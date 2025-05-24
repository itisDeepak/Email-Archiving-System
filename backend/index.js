require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { fetchEmails } = require('./gmailService');
const { Client } = require('pg');

const app = express();
app.use(cors());  // Enable CORS for frontend requests

const client = new Client({ connectionString: process.env.PG_URI });
client.connect()
  .then(() => console.log('Connected to DB'))
  .catch(err => console.error('DB connection error', err));

// Your cron job to fetch emails every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Fetching emails...');
  try {
    await fetchEmails();
  } catch (error) {
    console.error('Error fetching emails:', error);
  }
});

// API endpoint to get paginated emails
app.get('/api/emails', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const totalRes = await client.query('SELECT COUNT(*) FROM emails');
    const total = parseInt(totalRes.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Fetch emails for current page
    const emailsRes = await client.query(
      'SELECT id, subject, "from", "to", timestamp FROM emails ORDER BY timestamp DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const emails = emailsRes.rows;

    // Get all email IDs from this page
    const emailIds = emails.map(e => e.id);

    // Fetch all attachments related to these emails in one query
    let attachmentsMap = {};
    if (emailIds.length > 0) {
      const attachmentsRes = await client.query(
        `SELECT email_id, filename, drive_link FROM attachments WHERE email_id = ANY($1)`,
        [emailIds]
      );
      // Group attachments by email_id
      attachmentsRes.rows.forEach(att => {
        if (!attachmentsMap[att.email_id]) attachmentsMap[att.email_id] = [];
        attachmentsMap[att.email_id].push({
          filename: att.filename,
          drive_link: att.drive_link
        });
      });
    }

    // Attach attachments array to each email object
    const emailsWithAttachments = emails.map(email => ({
      ...email,
      attachments: attachmentsMap[email.id] || []
    }));

    res.json({
      emails: emailsWithAttachments,
      totalPages,
      page
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
