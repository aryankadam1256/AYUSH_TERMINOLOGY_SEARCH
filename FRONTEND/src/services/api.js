import axios from 'axios';

// Create an axios instance that points to our backend API
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/**
 * Searches for terms by calling the backend's /search endpoint.
 * @param {string} query The search term from the user.
 * @returns {Promise<Array>} A list of search results.
 */
export const searchTerms = async (query) => {
  try {
    // Backend expects 'q' parameter
    const response = await apiClient.get(`/search?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching search terms:', error);
    throw error;
  }
};

/**
 * Sends a question to the AI Assistant via the backend.
 * @param {string} query The user's question.
 * @returns {Promise<Object>} The AI's answer and sources.
 */
export const chatWithAI = async (query) => {
  try {
    const response = await apiClient.post('/chat', { query });
    return response.data;
  } catch (error) {
    console.error('Error chatting with AI:', error);
    throw error;
  }
};