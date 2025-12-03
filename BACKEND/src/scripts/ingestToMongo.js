
// src/scripts/ingestToMongo.js

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const { connectMongo } = require('../config/mongo');
const Term = require('../models/Term');

function readCsv(filePath, transform) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const t = transform(row);
          if (t) rows.push(t);
        } catch {}
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function run() {
  // ICD-11 source: icd_with_synonyms_and_problems_2_CSV.csv
const icdPath = path.join(__dirname, '..', 'data', 'icd_with_synonyms_and_problems_2_CSV.csv');
// NAMASTE source: NATIONAL AYURVEDA MORBIDITY CODES (1) - Copy_CSV.csv
const namastePath = path.join(__dirname, '..', 'data', 'NATIONAL AYURVEDA MORBIDITY CODES (1) - Copy_CSV.csv');

// Read and process ICD-11 file
console.log('Reading ICD-11 CSV...');
const icd11 = await readCsv(icdPath, (row) => {
    // Skip rows with invalid code/name
    if (!row.Code || row.Code === '#NAME?' || !row.Name || (row.Problem && row.Problem !== '')) return null;
    return {
      code: row.Code,
      name: row.Name,
      description: '', // No description column present
      synonyms: row.Synonyms || '',
      source: 'ICD-11',
      is_active: true,
      version: '2025-09'
    };
});

// Read and process NAMASTE file (Excel to preserve Unicode)
console.log('Reading NAMASTE Excel...');
const namaste = (() => {
  const xlsPath = path.join(__dirname, '..', 'data', 'NATIONAL AYURVEDA MORBIDITY CODES (1).xls');
  const workbook = XLSX.readFile(xlsPath, { cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows
    .map((row) => {
      const code = row.NAMC_CODE || row.NAMS_CODE || row.NAMCCode || '';
      const name = row.NAMC_term || row['Name English'] || row.TERM_NAME || '';
      if (!code || !name) return null;
      const description = row.Short_definition || row.Long_definition || row.DESCRIPTION || '';
      const synonyms = row['Name English Under Index'] || row.SYNONYMS || '';
      return {
        code,
        name,
        description,
        synonyms: (synonyms || '').replace(/,/g, ', '),
        source: 'NAMASTE',
        is_active: true,
        version: '1.0'
      };
    })
    .filter(Boolean);
})();

const all = [...namaste, ...icd11].filter(Boolean);
console.log(`Upserting ${all.length} terms into MongoDB...`);

for (const t of all) {
  await Term.updateOne(
    { code: t.code, source: t.source },
    { $set: t },
    { upsert: true }
  );
}

console.log(`✅ Upserted ${all.length} terms into MongoDB.`);
process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});



