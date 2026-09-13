const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

/**
 * Initializes and returns an OAuth2 client.
 */
function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

  if (!clientId || !clientSecret) {
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Gets an authenticated Google Calendar client using saved token.json if available.
 */
function getCalendarClient() {
  const oAuth2Client = getOAuth2Client();
  if (!oAuth2Client) {
    return null;
  }

  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oAuth2Client.setCredentials(token);
      return google.calendar({ version: 'v3', auth: oAuth2Client });
    } catch (err) {
      console.error('Error reading token.json:', err.message);
      return null;
    }
  }

  return null;
}

module.exports = { getOAuth2Client, getCalendarClient, TOKEN_PATH, SCOPES };
