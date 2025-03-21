/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');
var path = require('path');

// Configuration
const PORT = process.env.PORT || 5000;
const APP_SECRET = process.env.APP_SECRET;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'token';

// Validation middleware
if (!APP_SECRET) {
  console.warn('WARNING: APP_SECRET is not set. This is required for Facebook webhook validation.');
}

// Middleware setup
app.use(xhub({ algorithm: 'sha1', secret: APP_SECRET }));
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Store updates in memory (consider using a database for production)
var received_updates = [];

// Root endpoint - serve the HTML page
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Updates endpoint
app.get('/updates', function(req, res) {
  res.json(received_updates);
});

// Webhook verification endpoint
app.get(['/facebook', '/instagram', '/threads'], function(req, res) {
  if (
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VERIFY_TOKEN
  ) {
    console.log('Webhook verified successfully');
    res.send(req.query['hub.challenge']);
  } else {
    console.error('Failed webhook verification');
    res.sendStatus(400);
  }
});

// Facebook webhook endpoint
app.post('/facebook', function(req, res) {
  console.log('Facebook request body:', req.body);

  if (!req.isXHubValid()) {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.sendStatus(401);
    return;
  }

  console.log('request header X-Hub-Signature validated');
  const update = {
    type: 'facebook',
    timestamp: new Date().toISOString(),
    data: req.body
  };
  received_updates.unshift(update);
  
  // Keep only the last 100 updates
  if (received_updates.length > 100) {
    received_updates = received_updates.slice(0, 100);
  }
  
  res.sendStatus(200);
});

// Instagram webhook endpoint
app.post('/instagram', function(req, res) {
  console.log('Instagram request body:', req.body);
  const update = {
    type: 'instagram',
    timestamp: new Date().toISOString(),
    data: req.body
  };
  received_updates.unshift(update);
  
  // Keep only the last 100 updates
  if (received_updates.length > 100) {
    received_updates = received_updates.slice(0, 100);
  }
  
  res.sendStatus(200);
});

// Threads webhook endpoint
app.post('/threads', function(req, res) {
  console.log('Threads request body:', req.body);
  const update = {
    type: 'threads',
    timestamp: new Date().toISOString(),
    data: req.body
  };
  received_updates.unshift(update);
  
  // Keep only the last 100 updates
  if (received_updates.length > 100) {
    received_updates = received_updates.slice(0, 100);
  }
  
  res.sendStatus(200);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Webhook verification token: ${VERIFY_TOKEN}`);
});
