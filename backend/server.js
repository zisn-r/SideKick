require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the Chrome extension can call the backend
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Basic request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (Object.keys(req.body || {}).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

const { runAgent } = require('./agent');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sidekick Backend API' });
});

// Agent endpoint - runs OpenAI agent reasoning & tool selection
app.post('/agent', async (req, res) => {
  const { userRequest, pageContext } = req.body;

  if (!userRequest) {
    return res.status(400).json({ error: 'userRequest is required' });
  }

  console.log(`Processing agent request: "${userRequest}"`);

  try {
    const agentResult = await runAgent(userRequest, pageContext);
    res.json({
      status: 'success',
      ...agentResult
    });
  } catch (error) {
    console.error('Agent processing failed:', error);
    res.status(500).json({ error: 'Agent failed to process request.', details: error.message });
  }
});

const { createCalendarEvent } = require('./tools/createCalendarEvent');

// Confirmation endpoint - executes confirmed calendar creation
app.post('/confirm', async (req, res) => {
  const eventDetails = req.body;

  console.log('Received confirmation for event:', eventDetails);

  try {
    const result = await createCalendarEvent(eventDetails);
    res.json({
      status: 'success',
      ...result
    });
  } catch (error) {
    console.error('Calendar creation failed:', error.message);
    res.status(500).json({ error: 'Failed to create calendar event.', details: error.message });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Sidekick Backend API running on http://localhost:${PORT}`);
});
