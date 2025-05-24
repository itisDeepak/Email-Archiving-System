const { google } = require('googleapis');
require('dotenv').config();


// Method to apply authentication
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });


// Setting up to upload attachments to Drive
const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function findFolder(folderName) {
  try {
    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    if (res.data.files.length > 0) {
      console.log(`Folder "${folderName}" already exists with ID: ${res.data.files[0].id}`);
      return res.data.files[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error searching for folder:', error);
    return null;
  }
}

async function createFolder(folderName) {
  // First try to find folder
  const existingFolderId = await findFolder(folderName);
  if (existingFolderId) {
    return existingFolderId;
  }

  // Create folder if not found
  try {
    const res = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
    });
    console.log('Folder created with ID:', res.data.id);
    return res.data.id;
  } catch (error) {
    console.error('Error creating folder:', error);
    return null;
  }
}

async function uploadToDrive(name, buffer, mimeType) {
  try {
    if (!process.env.DRIVE_FOLDER_ID) {
      const folderId = await createFolder('EmailAttachments');
      if (folderId) {
        process.env.DRIVE_FOLDER_ID = folderId;
        console.log('Set DRIVE_FOLDER_ID :', folderId);
      } else {
        throw new Error('Failed to create or find Drive folder');
      }
    }

    const res = await drive.files.create({
      requestBody: {
        name: name,
        mimeType: mimeType,
        parents: [process.env.DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: mimeType,
        body: bufferToStream(buffer),
      },
    });

    await drive.permissions.create({
      fileId: res.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const fileLink = `https://drive.google.com/uc?id=${res.data.id}`;
    return { id: res.data.id, webViewLink: fileLink };
  } catch (error) {
    console.error('❌ Error uploading to Drive:', error);
    return null;
  }
}

function bufferToStream(buffer) {
  const stream = require('stream');
  const readable = new stream.Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
}

module.exports = { uploadToDrive };
