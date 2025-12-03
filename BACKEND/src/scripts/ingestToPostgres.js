// src/scripts/ingestToPostgres.js

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../config/db');

function readCsv(filePath, transformRow) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const t = transformRow(row);
          if (t) rows.push(t);
        } catch (e) {
          // Skip bad rows, log once per file at end
        }
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS terms (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT,
      description TEXT,
      synonyms TEXT,
      source TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      version TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE (code, source)
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS concept_map (
      id SERIAL PRIMARY KEY,
      source_code TEXT NOT NULL,
      source_system TEXT NOT NULL,
      target_code TEXT NOT NULL,
      target_system TEXT NOT NULL,
      relationship TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
}

async function bulkUpsertTerms(terms) {
  if (!terms.length) return 0;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const text = `
      INSERT INTO terms (code, name, description, synonyms, source, is_active, version, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (code, source)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        synonyms = EXCLUDED.synonyms,
        is_active = EXCLUDED.is_active,
        version = EXCLUDED.version,
        updated_at = NOW();
    `;
    for (const t of terms) {
      await client.query(text, [
        t.code,
        t.name || null,
        t.description || null,
        t.synonyms || null,
        t.source,
        t.is_active ?? true,
        t.version || null
      ]);
    }
    await client.query('COMMIT');
    return terms.length;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function run() {
  console.log('Ensuring database schema...');
  await ensureSchema();

  const namastePath = path.join(__dirname, '..', 'data', 'NAMASTE_sample.csv');
  const icd11Path = path.join(__dirname, '..', 'data', 'ICD11_sample.csv');

  console.log('Reading NAMASTE CSV...');
  const namaste = await readCsv(namastePath, (row) => ({
    code: row.NMS_CODE,
    name: row.TERM_NAME,
    description: row.DESCRIPTION,
    synonyms: (row.SYNONYMS || '').replace(/,/g, ', '),
    source: 'NAMASTE',
    is_active: true,
    version: '1.0'
  }));

  console.log('Reading ICD-11 CSV...');
  const icd11 = await readCsv(icd11Path, (row) => ({
    code: row['Entity-ID'],
    name: row['Foundation-Title'],
    description: row.Definition,
    synonyms: (row.AlternateNames || '').replace(/,/g, ', '),
    source: 'ICD-11',
    is_active: true,
    version: '2025-09'
  }));

  const all = [...namaste, ...icd11];
  console.log(`Upserting ${all.length} terms into Postgres...`);
  const inserted = await bulkUpsertTerms(all);
  console.log(`✅ Upserted ${inserted} terms into Postgres.`);
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});







