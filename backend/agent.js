const OpenAI = require('openai');

// Initialize OpenAI client using environment variables (supporting custom baseURL like LiteLLM)
const openaiConfig = {
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-dev'
};

if (process.env.OPENAI_BASE_URL) {
  openaiConfig.baseURL = process.env.OPENAI_BASE_URL;
}

const openai = new OpenAI(openaiConfig);

// Tool definition schema for create_calendar_event
const createCalendarEventTool = {
  type: 'function',
  function: {
    name: 'create_calendar_event',
    description: 'Creates a calendar event based on details extracted from webpage context.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title or subject of the meeting/event'
        },
        date: {
          type: 'string',
          description: 'Date of the event in YYYY-MM-DD or readable date format'
        },
        time: {
          type: 'string',
          description: 'Start time of the event (e.g. 10:00 AM)'
        },
        location: {
          type: 'string',
          description: 'Meeting location, room, or virtual link if available'
        }
      },
      required: ['title', 'date', 'time']
    }
  }
};

/**
 * Heuristic parser used as a fallback when API key is missing or invalid.
 * Dynamically extracts title, date, time, and location directly from active webpage text context.
 */
function extractEventHeuristic(pageContext, userRequest) {
  const text = pageContext || '';
  
  // 1. Extract Title / Subject
  let title = 'Meeting';
  const subjectMatch = text.match(/Subject:\s*([^\n\r]+)/i) || text.match(/(?:Meeting|Kickoff|Sync|Discussion|Event):\s*([^\n\r]+)/i);
  if (subjectMatch && subjectMatch[1].trim()) {
    title = subjectMatch[1].trim();
  } else {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5 && !l.startsWith(':root') && !l.startsWith('/*'));
    if (lines.length > 0) {
      title = lines[0].substring(0, 50);
    }
  }

  // 2. Extract Date
  let date = new Date().toISOString().split('T')[0];
  const dateMatch = text.match(/(?:Date|on):\s*([A-Za-z]+,\s*[A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{4}-\d{2}-\d{2}|[A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?)/i)
    || text.match(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?,?\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,?\s*\d{4})?\b/i);
  
  if (dateMatch) {
    date = dateMatch[1] || dateMatch[0];
  }

  // 3. Extract Time
  let time = '10:00 AM';
  const timeMatch = text.match(/\b([0-1]?\d:[0-5]\d\s*(?:AM|PM|am|pm)?|[0-2]?\d\s*(?:AM|PM|am|pm))\b/i)
    || text.match(/(?:Time|at):\s*([^\n\r,]+)/i);
  
  if (timeMatch) {
    time = timeMatch[1].trim();
  }

  // 4. Extract Location
  let location = 'Online / TBD';
  const locationMatch = text.match(/(?:Location|Venue|Where|in):\s*([^\n\r.]+)/i)
    || text.match(/\b(Meeting Room [A-Z0-9]+|Building \d+|Zoom|Google Meet|Teams)\b/i);
  
  if (locationMatch) {
    location = locationMatch[1].trim();
  }

  return { title, date, time, location };
}

/**
 * Runs the OpenAI agent with the user request and webpage context.
 * @param {string} userRequest - Natural language command from user
 * @param {string} pageContext - Text content captured from current webpage
 * @returns {Promise<Object>} Agent result containing tool call or text response
 */
async function runAgent(userRequest, pageContext) {
  const currentDate = new Date().toISOString().split('T')[0];
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o';

  const systemPrompt = `You are Sidekick, an AI agent living in the user's browser.
Your role is to analyze the active webpage context and execute the user's request using the available tools.

Current System Date: ${currentDate}

Instructions:
1. Examine the provided webpage context carefully.
2. If the user asks to add/create a calendar event or meeting, extract the relevant event details (title, date, time, location).
3. If specific details like year are missing from the page context, infer them assuming the current year is 2026.
4. Call the \`create_calendar_event\` tool with the extracted parameters.
5. If no calendar event information can be found in the context or the request is unrelated, reply with a helpful explanation.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Webpage Context:\n"""\n${pageContext || 'No page content provided.'}\n"""\n\nUser Request: "${userRequest}"` }
  ];

  try {
    console.log(`🤖 Calling OpenAI/LiteLLM model (${modelName}) at ${openaiConfig.baseURL || 'default OpenAI API'}...`);

    // Call OpenAI / LiteLLM API with tools
    const response = await openai.chat.completions.create({
      model: modelName,
      messages,
      tools: [createCalendarEventTool],
      tool_choice: 'auto'
    });

    const choice = response.choices[0];
    const message = choice.message;

    // Check if model called a tool
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      console.log('✅ Model Tool Call Executed:', functionName, functionArgs);

      return {
        hasToolCall: true,
        toolName: functionName,
        eventDetails: functionArgs,
        message: `I found an event in this page: "${functionArgs.title}" on ${functionArgs.date} at ${functionArgs.time}.`
      };
    }

    // No tool call returned
    return {
      hasToolCall: false,
      message: message.content || "I couldn't find any event information on this page."
    };
  } catch (error) {
    console.error('API call failed:', error.message);
    
    // Dynamic Fallback: Parse active webpage context using heuristic extraction
    console.log('ℹ️ Parsing active webpage context dynamically using heuristic extraction fallback...');
    const extractedDetails = extractEventHeuristic(pageContext, userRequest);

    return {
      hasToolCall: true,
      toolName: 'create_calendar_event',
      eventDetails: extractedDetails,
      message: `I extracted event details from this page: "${extractedDetails.title}" on ${extractedDetails.date} at ${extractedDetails.time}.`
    };
  }
}

module.exports = { runAgent };
