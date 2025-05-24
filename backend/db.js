const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.PG_URI });

client.connect()
  .then(() => console.log("Database connected"))
  .catch((error) => console.error("Database connection error:", error));

async function saveEmail(email) {
  const exists = await client.query('SELECT id FROM emails WHERE id = $1', [email.id]);
  if (exists.rows.length === 0) {
    await client.query(`
      INSERT INTO emails (id, threadId, subject, "from", "to", cc, bcc, timestamp, body)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      email.id, email.threadId, email.subject,
      email.from, email.to, email.cc,
      email.bcc, email.timestamp, email.body
    ]);
    console.log(`Saved email: ${email.subject}`);
    return true;
  } else {
    console.log(`Email already exists: ${email.subject}`);
    return false;
  }
}

async function saveAttachmentLink(emailId, filename, driveLink) {
  await client.query(`
    INSERT INTO attachments (email_id, filename, drive_link)
    VALUES ($1, $2, $3)
  `, [emailId, filename, driveLink]);
  console.log(`📎 Saved attachment: ${filename}`);
}

module.exports = { saveEmail, saveAttachmentLink };
