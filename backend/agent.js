const OpenAI = require('openai');

// Initialize OpenAI client using environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-dev'
});

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
 * Runs the OpenAI agent with the user request and webpage context.
 * @param {string} userRequest - Natural language command from user
 * @param {string} pageContext - Text content captured from current webpage
 * @returns {Promise<Object>} Agent result containing tool call or text response
 */
async function runAgent(userRequest, pageContext) {
  const currentDate = new Date().toISOString().split('T')[0]; // Current date for context

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
    // Call OpenAI Chat Completions API with tools
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: [createCalendarEventTool],
      tool_choice: 'auto'
    });

    const choice = response.choices[0];
    const message = choice.message;

    // Check if the model decided to call a tool
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

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
    console.error('Error running OpenAI agent:', error.message);
    
    // Fallback stub response if API key is invalid/missing in dev environment
    if (error.message.includes('API key') || error.code === 'invalid_api_key') {
      console.warn('⚠️ OpenAI API Key invalid or missing. Returning mock tool call response for demo mode.');
      return {
        hasToolCall: true,
        toolName: 'create_calendar_event',
        eventDetails: {
          title: 'Project Kickoff Meeting',
          date: '2026-09-15',
          time: '10:00 AM',
          location: 'Meeting Room B'
        },
        message: 'I found an event in this page: "Project Kickoff Meeting" on Tuesday, Sept 15 at 10:00 AM.'
      };
    }

    throw error;
  }
}

module.exports = { runAgent };
