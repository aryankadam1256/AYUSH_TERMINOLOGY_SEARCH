// src/config/elasticsearch.js

const { Client } = require('@elastic/elasticsearch');

// This creates a single, reusable client instance that connects to the
// Elasticsearch node specified in your .env file.
const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
});

console.log('elasticsearch client initialized');
module.exports = client;