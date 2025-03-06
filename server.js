const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const TARGET_URL = 'https://jags.co.in/jm//';

// Enable CORS for all routes
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Dynamic proxy endpoint that handles all HTTP methods and paths
app.all('/api/proxy/*', async (req, res) => {
  try {
    // Extract the path after '/api/proxy'
    const path = req.originalUrl.replace('/api/proxy', '');
    
    // Log the request for debugging
    console.log(`Proxying ${req.method} request to: ${TARGET_URL}${path}`);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    // Forward the request to the target URL
    const response = await axios({
      method: req.method.toLowerCase(),
      url: `${TARGET_URL}${path}`,
      headers: {
        // Forward content type and other relevant headers
        'Content-Type': req.headers['content-type'] || 'application/json',
        // Add any other headers you might need
        // 'Authorization': req.headers['authorization'],
      },
      // Only include body for methods that support it
      data: ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined,
      // Forward query parameters
      params: req.query
    });
    
    // Log success response for debugging
    console.log('Response status:', response.status);
    
    // Return the response data and status
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error);
    
    // Detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      console.error('Error response headers:', error.response.headers);
      
      // Forward the error response
      res.status(error.response.status).json({
        error: 'Target server error',
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      res.status(504).json({
        error: 'No response from target server',
        message: 'The request was sent but no response was received from the target server'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      res.status(500).json({
        error: 'Request setup error',
        message: error.message
      });
    }
  }
});

// Simple root endpoint for health check
app.get('/', (req, res) => {
  res.json({ status: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Proxying requests from http://localhost:${PORT}/api/proxy/* to ${TARGET_URL}/*`);
});