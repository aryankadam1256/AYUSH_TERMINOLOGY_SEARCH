// server.js

// Import necessary packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectMongo } = require('./src/config/mongo');

// Load environment variables from .env file
dotenv.config();

// Import the main router for our API
const terminologyRoutes = require('./src/api/terminologyRoutes');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) so the frontend can call the backend
app.use(cors());
// Enable the Express app to parse JSON formatted request bodies
app.use(express.json());


// --- API Routes ---
// Mount the terminology routes at the /api/v1 path
app.use('/api/v1', terminologyRoutes);


// --- Start the Server ---
// Make the app listen for incoming requests on the specified port
connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error('Mongo connection failed', e);
    process.exit(1);
  });