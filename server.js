const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());
app.use(bodyParser.json());

// Proxy endpoint
app.post('/api/proxy', async (req, res) => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://jags.co.in/jm//Auth/RefreshToken.aspx',
      headers: {
        'Content-Type': 'application/json'
      },
      data: req.body
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error);
    
    // Send back details about the error
    res.status(500).json({
      error: error.message,
      status: error.response ? error.response.status : null,
      data: error.response ? error.response.data : null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});