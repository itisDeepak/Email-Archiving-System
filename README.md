# 📧 Email Archiving System with Gmail API, Google Drive, and PostgreSQL

A full-stack Node.js application to fetch emails from Gmail, store email metadata in a PostgreSQL database, upload attachments to Google Drive, and display the data using a React frontend.

---

## 🚀 Features

- 🔐 **OAuth2 Authentication** with Gmail API
- 📥 **Email Fetching** from Gmail inbox
- 🗂️ **Metadata Storage** (emails and attachments) in PostgreSQL
- ☁️ **Attachment Upload** to Google Drive with file link storage
- 🚫 **Duplicate Folder Check** in Google Drive
- 📄 **Paginated API** to retrieve emails and attachments
- 🖥️ **React Frontend** for viewing emails and attachments

---

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (`pg` module)
- **Google APIs**: Gmail & Drive via `googleapis` with OAuth2
- **Frontend**: React (email list with pagination)

---

## 📁 Project Structure

```
/backend
├── .env                 # For OAuth
├── db.js                # PostgreSQL connection and queries
├── driveService.js      # Google Drive integration
├── gmailService.js      # Gmail API integration
├── index.js            # Express server and routing
├── app.js            # For getting Refresh token
/frontend           
├── src /
│   └── App.js          # React app root
│   └── EmailList.js    # Email data with attachments link
│   └── EmailList.css    # For css
```

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
cd email-archiver
```

### 2. Setup Environment Variables

Create a `.env` file in the `/backend` folder with the following:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret 
REDIRECT_URI=your_redirect_uri (use redirct URI as http://localhost:3000/oauth2callback (same as mentioned in Redirect URI in Oauth))
REFRESH_TOKEN=your_refresh_token  (get by runnnig app.js using node app.js click the link, click allow, copy refresh token and paste here)
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install
npm i express node-cron googleapis cors pg
# Frontend
cd frontend
npm install
```

### 4. Run the App

```bash
# Run backend
node index.js

# Run frontend
npm start
```

---

## 📬 API Endpoints

- `GET /emails?page=1&limit=10` – Fetch paginated list of emails with attachments
- `POST /fetch-emails` – Manually trigger email fetch and archive process

---

## 📄 Contact

- If you need help generating the backend and frontend code files, feel free to ask!
- `deepak1063.be21@chitkarauniversity.edu.in`
