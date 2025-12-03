// src/services/searchService.js

const esClient = require('../config/elasticsearch');

const INDEX_NAME = 'medical_terms'; // The name of our Elasticsearch index

/**
 * Finds medical terms in Elasticsearch based on a search string.
 * @param {string} searchTerm The text to search for.
 * @returns {Promise<Array>} A list of matching documents.
 */
const findTerms = async (searchTerm) => {
  try {
    const response = await esClient.search({
      index: INDEX_NAME,
      body: {
        query: {
          // A multi_match query searches the searchTerm across multiple fields
          multi_match: {
            query: searchTerm,
            fields: ["name^3", "synonyms^2", "description"], // Prioritize matches in 'name' and 'synonyms'
            fuzziness: "AUTO" // Allows for some typos
          }
        },
        size: 10 // Limit the results to the top 10 for the auto-complete dropdown
      }
    });

    // We format the complex Elasticsearch response into a simple array
    return response.hits.hits.map(hit => ({
      ...hit._source,
      relevance: hit._score
    }));

  } catch (error) {
    console.error('Error during Elasticsearch search:', error);
    throw error;
  }
};

module.exports = {
  findTerms
};