// // src/scripts/ingestData.js

// const esClient = require('../config/elasticsearch');
// const INDEX_NAME = 'medical_terms';

// // --- Placeholder Data ---
// // In a real project, you would read this from your NAMASTE.csv and ICD-11.json files.
// const dataToIngest = [
//     { code: 'A60.1', name: 'Amavata', source: 'NAMASTE', description: 'A disorder with joint pain and stiffness.', synonyms: 'Ama Vatham, Rheumatic complaints' },
//     { code: 'MG20', name: 'Fever', source: 'ICD-11', description: 'Fever of unknown origin, high temperature.', synonyms: 'Pyrexia' },
//     { code: 'A01.1', name: 'Jvara', source: 'NAMASTE', description: 'A condition with fever and body pain.', synonyms: 'High temp' },
//     { code: 'MG30.0', name: 'Migraine', source: 'ICD-11', description: 'A type of head pain, often with nausea.', synonyms: 'Headache' }
// ];

// async function run() {
//     console.log('Starting data ingestion...');

//     // 1. Check if the index already exists
//     const indexExists = await esClient.indices.exists({ index: INDEX_NAME });
//     if (indexExists) {
//         console.log(`Index "${INDEX_NAME}" already exists. Deleting...`);
//         await esClient.indices.delete({ index: INDEX_NAME });
//     }

//     // 2. Create a new index with custom settings and mappings
//     console.log(`Creating new index "${INDEX_NAME}"...`);
//     await esClient.indices.create({
//         index: INDEX_NAME,
//         body: {
//             // Here you would define your analyzers, synonym files, etc.
//             // This is a simplified version.
//             settings: {
//                 analysis: {
//                     // Add analyzer configuration here in a real project
//                 }
//             },
//             mappings: {
//                 properties: {
//                     code: { type: 'keyword' },
//                     name: { type: 'text' },
//                     source: { type: 'keyword' },
//                     description: { type: 'text' },
//                     synonyms: { type: 'text' }
//                 }
//             }
//         }
//     });

//     // 3. Ingest the data
//     console.log('Ingesting data...');
//     const body = dataToIngest.flatMap(doc => [{ index: { _index: INDEX_NAME } }, doc]);
//     const { errors } = await esClient.bulk({ refresh: true, body });

//     if (errors) {
//         console.error('An error occurred during bulk ingestion.');
//     } else {
//         const count = await esClient.count({ index: INDEX_NAME });
//         console.log(`✅ Successfully indexed ${count.count} documents.`);
//     }
// }

// run().catch(console.error);


// src/scripts/ingestData.js






// working version - 3:15 pm 30th oct 2025
// const fs = require('fs');
// const path = require('path');
// const csv = require('csv-parser');
// const esClient = require('../config/elasticsearch');
// const INDEX_NAME = 'medical_terms';

// // --- Helper function to process the NAMASTE CSV file ---
// function processNamasteFile() {
//     return new Promise((resolve, reject) => {
//         const results = [];
//         const filePath = path.join(__dirname, '..', 'data', 'NAMASTE_sample.csv');

//         fs.createReadStream(filePath)
//             .pipe(csv())
//             .on('data', (row) => {
//                 // This is the "Transform" step for NAMASTE data
//                 const transformedRecord = {
//                     code: row.NMS_CODE,
//                     name: row.TERM_NAME,
//                     description: row.DESCRIPTION,
//                     synonyms: row.SYNONYMS.replace(/,/g, ', '), // Add spaces for better searching
//                     source: 'NAMASTE',
//                     is_active: true,
//                     version: '1.0'
//                 };
//                 results.push(transformedRecord);
//             })
//             .on('end', () => {
//                 console.log('✅ NAMASTE CSV file successfully processed.');
//                 resolve(results);
//             })
//             .on('error', reject);
//     });
// }

// // --- Helper function to process the ICD-11 CSV file ---
// function processIcd11File() {
//     return new Promise((resolve, reject) => {
//         const results = [];
//         const filePath = path.join(__dirname, '..', 'data', 'ICD11_sample.csv');

//         fs.createReadStream(filePath)
//             .pipe(csv())
//             .on('data', (row) => {
//                 // This is the "Transform" step for ICD-11 data
//                 const transformedRecord = {
//                     code: row['Entity-ID'],
//                     name: row['Foundation-Title'],
//                     description: row.Definition,
//                     synonyms: row.AlternateNames.replace(/,/g, ', '),
//                     source: 'ICD-11',
//                     is_active: true,
//                     version: '2025-09'
//                 };
//                 results.push(transformedRecord);
//             })
//             .on('end', () => {
//                 console.log('✅ ICD-11 CSV file successfully processed.');
//                 resolve(results);
//             })
//             .on('error', reject);
//     });
// }


// async function run() {
//     console.log('Starting data ingestion from CSV files...');

//     // 1. EXTRACT & TRANSFORM: Process both files and merge the data
//     const namasteData = await processNamasteFile();
//     const icd11Data = await processIcd11File();
//     const allDataToIngest = [...namasteData, ...icd11Data];
    
//     // 2. LOAD: The rest of the process is the same as before
//     const indexExists = await esClient.indices.exists({ index: INDEX_NAME });
//     if (indexExists) {
//         await esClient.indices.delete({ index: INDEX_NAME });
//     }

// Inside ingestData.js

// await esClient.indices.create({
//     index: INDEX_NAME,
//     body: {
//         settings: {
//             analysis: {
//                 analyzer: {
//                     custom_analyzer_with_synonyms: {
//                         tokenizer: 'standard',
//                         filter: [ 'lowercase', 'synonym_filter' ]
//                     }
//                 },
//                 filter: {
//                     synonym_filter: {
//                         type: 'synonym_graph',
//                         // UPDATE THIS LINE:
//                         synonyms_path: 'analysis/synonym.txt', // Use the path inside the container
//                         updateable: true
//                     }
//                 }
//             }
//         },
//         mappings: {
//             properties: {
//                 code: { type: 'keyword' },
//                 name: { type: 'text', analyzer: 'custom_analyzer_with_synonyms' },
//                 description: { type: 'text', analyzer: 'custom_analyzer_with_synonyms' },
//                 synonyms: { type: 'text', analyzer: 'custom_analyzer_with_synonyms' },
//                 source: { type: 'keyword' }
//             }
//         }
//     }
// });

// await esClient.indices.create({
//     index: INDEX_NAME,
//     body: {
//         settings: {
//             analysis: {
//                 analyzer: {
//                     // This is our custom analyzer that will now be used ONLY for searching
//                     custom_analyzer_with_synonyms: {
//                         tokenizer: 'standard',
//                         filter: [
//                             'lowercase',
//                             'synonym_filter' // Apply our custom synonym filter
//                         ]
//                     }
//                 },
//                 filter: {
//                     synonym_filter: {
//                         type: 'synonym_graph',
//                         synonyms_path: 'analysis/synonym.txt',
//                         updateable: true
//                     }
//                 }
//             }
//         },
//         mappings: {
//             properties: {
//                 code: { type: 'keyword' },
//                 // --- THIS IS THE CORRECTED PART ---
//                 name: {
//                     type: 'text',
//                     analyzer: 'standard', // Use a simple analyzer when saving data
//                     search_analyzer: 'custom_analyzer_with_synonyms' // Use our powerful analyzer when searching
//                 },
//                 description: {
//                     type: 'text',
//                     analyzer: 'standard',
//                     search_analyzer: 'custom_analyzer_with_synonyms'
//                 },
//                 synonyms: {
//                     type: 'text',
//                     analyzer: 'standard',
//                     search_analyzer: 'custom_analyzer_with_synonyms'
//                 },
//                 source: { type: 'keyword' }
//             }
//         }
//     }
// });

// FIXED VERSION: Separate analyzers for indexing and searching
// await esClient.indices.create({
//     index: INDEX_NAME,
//     body: {
//         settings: {
//             analysis: {
//                 filter: {
//                     synonym_filter: {
//                         type: 'synonym_graph',
//                         synonyms_path: 'analysis/synonym.txt',
//                         updateable: true
//                     },
//                     autocomplete_filter: {
//                         type: 'edge_ngram',
//                         min_gram: 2,
//                         max_gram: 20
//                     }
//                 },
//                 analyzer: {
//                     indexing_analyzer: {
//                         tokenizer: 'standard',
//                         filter: ['lowercase', 'autocomplete_filter']
//                     },
//                     search_analyzer: {
//                         tokenizer: 'standard',
//                         filter: ['lowercase', 'synonym_filter', 'autocomplete_filter']
//                     }
//                 }
//             }
//         },
//         mappings: {
//             properties: {
//                 code: { type: 'keyword' },
//                 name: {
//                     type: 'text',
//                     analyzer: 'indexing_analyzer',
//                     search_analyzer: 'search_analyzer'
//                 },
//                 description: {
//                     type: 'text',
//                     analyzer: 'indexing_analyzer',
//                     search_analyzer: 'search_analyzer'
//                 },
//                 synonyms: {
//                     type: 'text',
//                     analyzer: 'indexing_analyzer',
//                     search_analyzer: 'search_analyzer'
//                 },
//                 source: { type: 'keyword' }
//             }
//         }
//     }
// });

// WORKING VERSION -1

// await esClient.indices.create({
//     index: INDEX_NAME,
//     body: {
//     // initial setup
//         // settings: {
//         //     analysis: {
//         //         analyzer: {
//         //             // This is our custom analyzer that will now be used ONLY for searching
//         //             custom_analyzer_with_synonyms: {
//         //                 tokenizer: 'standard',
//         //                 filter: [
//         //                     'lowercase',
//         //                     'synonym_filter'
//         //                 ]
//         //             }
//         //         },
//         //         filter: {
//         //             synonym_filter: {
//         //                 type: 'synonym_graph',
//         //                 synonyms_path: 'analysis/synonym.txt',
//         //                 updateable: true
//         //             }
//         //         }
//         //     }
//         // },
//         // mappings: {
//         //     properties: {
//         //         code: { type: 'keyword' },
//         //         // --- THIS IS THE CORRECTED PART ---
//         //         name: {
//         //             type: 'text',
//         //             analyzer: 'standard', // Use a simple analyzer when saving data
//         //             search_analyzer: 'custom_analyzer_with_synonyms' // Use our powerful analyzer when searching
//         //         },
//         //         description: {
//         //             type: 'text',
//         //             analyzer: 'standard',
//         //             search_analyzer: 'custom_analyzer_with_synonyms'
//         //         },
//         //         synonyms: {
//         //             type: 'text',
//         //             analyzer: 'standard',
//         //             search_analyzer: 'custom_analyzer_with_synonyms'
//         //         },
//         //         source: { type: 'keyword' }
//         //     }
//         // }


//   // update -2 :- 17:56 pm , 26 sept 2025
//       settings: {
//             analysis: {
//                 // This is our new, more powerful analyzer
//             autocomplete_analyzer: {
//                 tokenizer: 'standard',
//                 filter: [
//                     'lowercase',
//                     'synonym_filter',
//                     'autocomplete_filter' // Apply the ngram filter
//                 ]
//             }
//         },
//         filter: {
//                     synonym_filter: {
//                         type: 'synonym_graph',
//                         synonyms_path: 'analysis/synonym.txt',
//                         updateable: true
//                     },
//                     // Add a new filter for partial words
//             autocomplete_filter: {
//                 type: 'edge_ngram',
//                 min_gram: 2,
//                 max_gram: 20
//             }
//                 }
//         },
//         mappings: {
//             properties: {
//                 code: { type: 'keyword' },
//                 // --- THIS IS THE CORRECTED PART ---
//                name: {
//             type: 'text',
//             analyzer: 'autocomplete_analyzer', // Use the new analyzer
//             search_analyzer: 'standard' // Use a simple analyzer at search time
//         },
//                 description: {
//                     type: 'text',
//                     analyzer: 'standard',
//                     search_analyzer: 'custom_analyzer_with_synonyms'
//                 },
//                 synonyms: {
//                     type: 'text',
//                     analyzer: 'standard',
//                     search_analyzer: 'custom_analyzer_with_synonyms'
//                 },
//                 source: { type: 'keyword' }
//             }
//         }
//     }
    
// });

//     const body = allDataToIngest.flatMap(doc => [{ index: { _index: INDEX_NAME } }, doc]);
//     const { errors } = await esClient.bulk({ refresh: true, body });

//     if (errors) {
//         console.error('An error occurred during bulk ingestion.');
//     } else {
//         const count = await esClient.count({ index: INDEX_NAME });
//         console.log(`✅ Successfully indexed ${count.count} total documents from CSV files.`);
//     }
// }

// run().catch(console.error);



// TRIAL -VERSION -1 :- WITH FULL DATASET - 3:15 pm 30th oct 2025
// src/scripts/ingestData.js

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const esClient = require('../config/elasticsearch');
const INDEX_NAME = 'medical_terms';

// Helper to process icd_with_synonyms_and_problems_2_CSV.csv
function processIcd11File() {
    return new Promise((resolve, reject) => {
        const results = [];
        const filePath = path.join(__dirname, '..', 'data', 'icd_with_synonyms_and_problems_2_CSV.csv');
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                console.log(row);
                // Skip invalid or blank code/name/problem
                if (!row.Code || row.Code === '#NAME?' || !row.Name || (row.Problem && row.Problem !== '')) return;
                results.push({
                    code: row.Code,
                    name: row.Name,
                    description: '', // No description present in your file
                    synonyms: row.Synonyms || '',
                    source: 'ICD-11',
                    is_active: true,
                    version: '2025-09'
                });
                console.log(results);
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

// Helper to process NATIONAL AYURVEDA MORBIDITY CODES (1) - Copy_CSV.csv
function processNamasteFile() {
    // Read directly from Excel to preserve diacritics/Unicode
    return new Promise((resolve, reject) => {
        try {
            const xlsPath = path.join(__dirname, '..', 'data', 'NATIONAL AYURVEDA MORBIDITY CODES (1).xls');
            const workbook = XLSX.readFile(xlsPath, { cellDates: false });
            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

            const results = [];
            for (const row of rows) {
                const code = row.NAMC_CODE || row.NAMS_CODE || row.NAMCCode || '';
                const name = row.NAMC_term || row['Name English'] || row.TERM_NAME || '';
                if (!code || !name) continue;
                const description = row.Short_definition || row.Long_definition || row.DESCRIPTION || '';
                const synonyms = row['Name English Under Index'] || row.SYNONYMS || '';
                results.push({
                    code,
                    name,
                    description,
                    synonyms,
                    source: 'NAMASTE',
                    is_active: true,
                    version: '1.0'
                });
            }
            resolve(results);
        } catch (e) {
            reject(e);
        }
    });
}

async function run() {
    console.log('Starting data ingestion from full CSV files...');

    // 1. Extract & transform both datasets
    const icd11Data = await processIcd11File();
    const namasteData = await processNamasteFile();
    const allDataToIngest = [...namasteData, ...icd11Data];

    // 2. Delete old index, if it exists
    const indexExists = await esClient.indices.exists({ index: INDEX_NAME });
    if (indexExists) {
        await esClient.indices.delete({ index: INDEX_NAME });
    }

    // 3. Create index with correct analyzers/mappings
    await esClient.indices.create({
        index: INDEX_NAME,
        body: {
            settings: {
                analysis: {
                    filter: {
                        synonym_filter: {
                            type: 'synonym_graph',
                            synonyms_path: 'analysis/synonym.txt',
                            updateable: true
                        },
                        autocomplete_filter: {
                            type: 'edge_ngram',
                            min_gram: 2,
                            max_gram: 20
                        }
                    },
                    analyzer: {
                        indexing_analyzer: {
                            tokenizer: 'standard',
                            filter: ['lowercase', 'autocomplete_filter']
                        },
                        search_analyzer: {
                            tokenizer: 'standard',
                            filter: ['lowercase', 'synonym_filter', 'autocomplete_filter']
                        }
                    }
                }
            },
            mappings: {
                properties: {
                    code: { type: 'keyword' },
                    name: {
                        type: 'text',
                        analyzer: 'indexing_analyzer',
                        search_analyzer: 'search_analyzer'
                    },
                    description: {
                        type: 'text',
                        analyzer: 'indexing_analyzer',
                        search_analyzer: 'search_analyzer'
                    },
                    synonyms: {
                        type: 'text',
                        analyzer: 'indexing_analyzer',
                        search_analyzer: 'search_analyzer'
                    },
                    source: { type: 'keyword' }
                }
            }
        }
    });

    // 4. Bulk ingest data
    const body = allDataToIngest.flatMap((doc) => [
        { index: { _index: INDEX_NAME } }, doc
    ]);
    const { errors } = await esClient.bulk({ refresh: true, body });

    if (errors) {
        console.error('An error occurred during bulk ingestion.');
    } else {
        const count = await esClient.count({ index: INDEX_NAME });
        console.log(`✅ Successfully indexed ${count.count} total documents from real CSV files.`);
    }
}

run().catch(console.error);