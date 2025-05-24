const { google } = require('googleapis');
const { saveEmail, saveAttachmentLink } = require('./db');
const { decodeBase64 } = require('./utils');
const { uploadToDrive } = require('./driveService');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

async function fetchEmails() {
  try {
    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
    const messages = res.data.messages || [];

    for (const msg of messages) {
      const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id });
      const payload = detail.data.payload;
      const headers = Object.fromEntries(payload.headers.map(h => [h.name, h.value]));

      const bodyPart = findTextPart(payload);
      const body = bodyPart?.body?.data ? decodeBase64(bodyPart.body.data) : '';

      const email = {
        id: detail.data.id,
        threadId: detail.data.threadId,
        subject: headers['Subject'] || '',
        from: headers['From'] || '',
        to: headers['To'] || '',
        cc: headers['Cc'] || '',
        bcc: headers['Bcc'] || '',
        timestamp: new Date(+detail.data.internalDate),
        body,
      };

      const saved = await saveEmail(email);

      if (saved && payload.parts) {
        for (const part of payload.parts) {
          if (part.filename && part.body && part.body.attachmentId) {
            const attachment = await gmail.users.messages.attachments.get({
              userId: 'me',
              messageId: detail.data.id,
              id: part.body.attachmentId,
            });

            const buffer = Buffer.from(attachment.data.data, 'base64');
            const driveFile = await uploadToDrive(part.filename, buffer, part.mimeType || 'application/octet-stream');

            if (driveFile) {
              await saveAttachmentLink(email.id, part.filename, driveFile.webViewLink);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error in fetchEmails:', err);
  }
}

function findTextPart(payload) {
  if (!payload.parts) return payload;
  for (const part of payload.parts) {
    if (part.mimeType === 'text/plain') return part;
    if (part.parts) {
      const inner = findTextPart(part);
      if (inner) return inner;
    }
  }
  return null;
}

module.exports = { fetchEmails };
