const axios = require('axios');

const RAG_SERVICE_URL = 'http://localhost:8000'; // Python Service URL

/**
 * Send query to RAG service (Chat)
 * @param {string} query - User's question
 * @returns {Promise<Object>} - { answer: string, sources: Array }
 */
const queryRagService = async (query) => {
  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/chat`, { query });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('RAG Chat Error Response:', error.response.data);
    }
    console.error('RAG Chat Error:', error.message);
    throw new Error('Failed to get response from AI service');
  }
};

/**
 * Search for terms using RAG service (Pinecone)
 * @param {string} query - Search term
 * @returns {Promise<Array>} - List of matching terms
 */
const searchRagService = async (query) => {
  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/search`, { query });
    // Python returns { results: [...] }
    return response.data.results;
  } catch (error) {
    if (error.response) {
      console.error('RAG Search Error Response:', error.response.data);
    }
    console.error('RAG Search Error:', error.message);
    throw new Error('Failed to search medical terms');
  }
};

module.exports = {
  queryRagService,
  searchRagService
};
