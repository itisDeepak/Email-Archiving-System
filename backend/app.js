const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/drive.file',
];

app.get('/', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.send(`<a href="${authUrl}">Authenticate with Google</a>`);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send('No code found.');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Show tokens - you’ll save refresh_token to .env or secure place
    res.send(`
      <h3>Authentication successful!</h3>
      <p>Refresh Token: ${tokens.refresh_token}</p>
      <p>Access Token: ${tokens.access_token}</p>
      <p>Save the refresh token securely to your .env file as REFRESH_TOKEN</p>
    `);
  } catch (error) {
    console.error('Error exchanging code:', error);
    res.send('Error during authentication.');
  }
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
