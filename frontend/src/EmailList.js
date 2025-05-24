import React, { useEffect, useState } from 'react';
import './EmailList.css';

function EmailList() {
  const [emails, setEmails] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchEmails(page);
  }, [page]);

  async function fetchEmails(page) {
    try {
      const res = await fetch(`http://localhost:4000/api/emails?page=${page}&limit=${limit}`);
      const data = await res.json();
      setEmails(data.emails);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch emails:', err);
    }
  }

  function handlePrev() {
    if (page > 1) setPage(page - 1);
  }

  function handleNext() {
    if (page < totalPages) setPage(page + 1);
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString();
  }

  return (
    <div className="email-container">
      <h2 className="email-title">Emails</h2>
      <table className="email-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>From</th>
            <th>To</th>
            <th>Date</th>
            <th>Attachments</th>
          </tr>
        </thead>
        <tbody>
          {emails.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-emails">No emails found.</td>
            </tr>
          ) : (
            emails.map((email) => (
              <tr key={email.id} className="email-row">
                <td>{email.subject || '(No Subject)'}</td>
                <td>{email.from}</td>
                <td>{email.to}</td>
                <td>{formatDate(email.timestamp)}</td>
                <td>
                  {email.attachments && email.attachments.length > 0 ? (
                    email.attachments.map((att, i) => (
                      <div key={i}>
                        <a href={att.drive_link} target="_blank" rel="noopener noreferrer">
                          {att.filename}
                        </a>
                      </div>
                    ))
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={handlePrev} disabled={page === 1}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={handleNext} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
}

export default EmailList;
