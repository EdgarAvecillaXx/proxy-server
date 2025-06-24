require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Authentication middleware
const API_KEY = process.env.API_KEY;
const authMiddleware = (req, res, next) => {
  // Authentication middleware
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).send('Unauthorized: Invalid API Key');
  }
  next();
};

// Middleware to handle CORS, JSON parsing, and authentication
app.use(cors({ origin: 'https://eiqv-test.fa.us6.oraclecloud.com/' }));
app.use(authMiddleware);

// Proxy configuration
const proxyConfig = {
  target: process.env.TARGET_URL,
  changeOrigin: true,

  on: {
    proxyReq: (proxyReq) => {
      const token = process.env.AUTH_TOKEN;
      if (token) {
        proxyReq.setHeader('authorization', `Basic ${token}`);
      }
    },
  },
};

const proxy = createProxyMiddleware(proxyConfig);
app.use(proxy);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
