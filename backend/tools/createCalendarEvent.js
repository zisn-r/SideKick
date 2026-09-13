const { getCalendarClient } = require('../calendar');

/**
 * Creates a calendar event either via Google Calendar API or simulated fallback.
 * @param {Object} eventDetails - { title, date, time, location }
 * @returns {Promise<Object>} Execution result
 */
async function createCalendarEvent({ title, date, time, location }) {
  const isGoogleEnabled = process.env.GOOGLE_CALENDAR_ENABLED === 'true';

  console.log(`Executing createCalendarEvent (Google API Enabled: ${isGoogleEnabled})`);
  console.log('Event details:', { title, date, time, location });

  if (!isGoogleEnabled) {
    // Simulated Fallback for Hackathon MVP Demo
    console.log('ℹ️ Running in simulated mode. Returning mock calendar creation success.');
    return {
      success: true,
      simulated: true,
      message: `[Simulated] Event "${title || 'Meeting'}" created for ${date || 'TBD'} at ${time || 'TBD'}.`,
      event: {
        id: `mock-event-${Date.now()}`,
        title: title || 'Meeting',
        date: date || '2026-09-15',
        time: time || '10:00 AM',
        location: location || 'Meeting Room B',
        htmlLink: 'https://calendar.google.com'
      }
    };
  }

  // Real Google Calendar API Execution
  const calendar = getCalendarClient();
  if (!calendar) {
    throw new Error('Google Calendar client not authenticated. Please run OAuth setup or check credentials.');
  }

  // Helper to parse date and time into RFC 3339 format
  let startDateTime = new Date(`${date} ${time}`);
  if (isNaN(startDateTime.getTime())) {
    startDateTime = new Date(); // Fallback if parsing fails
  }

  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration default

  const resource = {
    summary: title || 'Meeting',
    location: location || '',
    description: 'Created by Sidekick AI Browser Agent',
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Asia/Kuala_Lumpur'
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Asia/Kuala_Lumpur'
    }
  };

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource
    });

    console.log('✅ Google Calendar event created successfully:', res.data.htmlLink);

    return {
      success: true,
      simulated: false,
      message: `Event "${res.data.summary}" created in Google Calendar!`,
      event: {
        id: res.data.id,
        title: res.data.summary,
        date,
        time,
        location,
        htmlLink: res.data.htmlLink
      }
    };
  } catch (error) {
    console.error('❌ Google Calendar API error:', error.message);
    throw new Error(`Google Calendar API Error: ${error.message}`);
  }
}

module.exports = { createCalendarEvent };
