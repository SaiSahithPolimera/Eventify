import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error.message);
  } else {
    console.log('Email service ready');
  }
});

export const sendEventReminder = async (recipientEmail, eventDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Reminder: ${eventDetails.title} is in 2 hours!`,
      html: generateReminderHTML(eventDetails),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending reminder to ${recipientEmail}:`, error);
    return false;
  }
};

export const sendEventConfirmation = async (recipientEmail, eventDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `RSVP Confirmed: ${eventDetails.title}`,
      html: generateConfirmationHTML(eventDetails),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending confirmation to ${recipientEmail}:`, error);
    return false;
  }
};

const generateConfirmationHTML = (event) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f4f4f5;
        color: #1f2937;
        padding: 40px 16px;
      }

      .container {
        max-width: 640px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        overflow: hidden;
      }

      .header {
        background-color: #10b981;
        color: white;
        text-align: center;
        padding: 36px 20px;
      }

      .header h1 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .header p {
        font-size: 14px;
        opacity: 0.9;
      }

      .content {
        padding: 40px 32px;
      }

      .greeting {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
      }

      .intro-text {
        font-size: 15px;
        color: #4b5563;
        margin-bottom: 28px;
        line-height: 1.7;
      }

      .event-details {
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        margin-bottom: 32px;
      }

      .event-detail {
        display: flex;
        align-items: flex-start;
        padding: 16px 20px;
        border-bottom: 1px solid #e5e7eb;
      }

      .event-detail:last-child {
        border-bottom: none;
      }

      .event-detail-icon {
        font-size: 18px;
        margin-right: 14px;
      }

      .event-detail-label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .event-detail-value {
        font-size: 15px;
        font-weight: 500;
        color: #111827;
        margin-top: 3px;
      }

      .cta-section {
        text-align: center;
        margin-top: 20px;
      }

      .button {
        display: inline-block;
        background-color: #10b981;
        color: #ffffff !important;
        padding: 12px 28px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none !important;
        font-size: 15px;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

    .button:hover {
      background-color: #059669;
      color: #ffffff !important;
      text-decoration: none !important;
    }

      .footer {
        background: #f9fafb;
        padding: 28px 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }

      .footer-text {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.6;
        margin: 0;
      }

      .divider {
        height: 1px;
        background: #e5e7eb;
        margin: 16px 0;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1>RSVP Confirmed</h1>
        <p>Your spot is reserved</p>
      </div>

      <div class="content">
        <p class="greeting">Hello!</p>
        <p class="intro-text">
          Thank you for confirming your attendance. Your spot is now secured. 
          You'll receive a reminder email 2 hours before the event begins.
        </p>

        <div class="event-details">
          <div class="event-detail">
            <div class="event-detail-icon">🎉</div>
            <div>
              <div class="event-detail-label">Event</div>
              <div class="event-detail-value">${event.title}</div>
            </div>
          </div>
          <div class="event-detail">
            <div class="event-detail-icon">📅</div>
            <div>
              <div class="event-detail-label">Date</div>
              <div class="event-detail-value">${new Date(event.date).toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})}</div>
            </div>
          </div>
          <div class="event-detail">
            <div class="event-detail-icon">📍</div>
            <div>
              <div class="event-detail-label">Location</div>
              <div class="event-detail-value">${event.location}</div>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <a href="${process.env.CLIENT_URL}/dashboard" class="button">View My RSVPs</a>
        </div>
      </div>

      <div class="footer">
        <p class="footer-text"><strong>Need help?</strong> Reply to this email or visit our support page.</p>
        <div class="divider"></div>
        <p class="footer-text">© 2024 <strong>Eventify</strong>. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;


const generateReminderHTML = (event) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #fafafa;
        color: #1f2937;
        padding: 40px 16px;
      }

      .container {
        max-width: 640px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        overflow: hidden;
      }

      .header {
        background-color: #ef4444;
        color: white;
        text-align: center;
        padding: 36px 20px;
      }

      .header h1 {
        font-size: 26px;
        font-weight: 700;
        margin-bottom: 6px;
      }

      .countdown {
        font-size: 15px;
        font-weight: 500;
        background-color: rgba(255, 255, 255, 0.15);
        padding: 6px 14px;
        border-radius: 6px;
        display: inline-block;
      }

      .content {
        padding: 40px 32px;
      }

      .intro-text {
        font-size: 15px;
        color: #4b5563;
        line-height: 1.7;
        margin-bottom: 30px;
      }

      .event-details {
        border: 1px solid #f3f4f6;
        border-radius: 10px;
        margin-bottom: 28px;
      }

      .event-detail {
        display: flex;
        align-items: flex-start;
        padding: 16px 20px;
        border-bottom: 1px solid #f3f4f6;
      }

      .event-detail:last-child {
        border-bottom: none;
      }

      .event-detail-icon {
        font-size: 18px;
        margin-right: 14px;
      }

      .event-detail-label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .event-detail-value {
        font-size: 15px;
        font-weight: 500;
        color: #111827;
        margin-top: 3px;
      }

      .alert-box {
        background-color: #fef2f2;
        border-left: 4px solid #ef4444;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .alert-box p {
        font-size: 14px;
        color: #991b1b;
        margin: 0;
      }

      .cta-section {
        text-align: center;
        margin-top: 20px;
      }

    .button {
      display: inline-block;
      background-color: #ef4444;
      color: #ffffff !important;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none !important;
      font-size: 15px;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .button:hover {
      background-color: #dc2626;
      color: #ffffff !important;
      text-decoration: none !important;
    }

      .footer {
        background: #f9fafb;
        padding: 28px 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }

      .footer-text {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.6;
      }

      .divider {
        height: 1px;
        background: #e5e7eb;
        margin: 16px 0;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1>Event Starting Soon</h1>
        <div class="countdown">In 2 hours</div>
      </div>

      <div class="content">
        <p class="intro-text">
          Your event begins in just 2 hours. Get ready and make sure you have everything you need. See you there!
        </p>

        <div class="event-details">
          <div class="event-detail">
            <div class="event-detail-icon">🎪</div>
            <div>
              <div class="event-detail-label">Event</div>
              <div class="event-detail-value">${event.title}</div>
            </div>
          </div>
          <div class="event-detail">
            <div class="event-detail-icon">📅</div>
            <div>
              <div class="event-detail-label">Date</div>
              <div class="event-detail-value">${new Date(event.date).toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})}</div>
            </div>
          </div>
          <div class="event-detail">
            <div class="event-detail-icon">📍</div>
            <div>
              <div class="event-detail-label">Location</div>
              <div class="event-detail-value">${event.location}</div>
            </div>
          </div>
        </div>

        <div class="alert-box">
          <p>⚠️ Don’t be late — leave early to arrive on time.</p>
        </div>

        <div class="cta-section">
          <a href="${process.env.CLIENT_URL}/dashboard" class="button">View Event Details</a>
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">See you at the event!</p>
        <div class="divider"></div>
        <p class="footer-text">© 2024 <strong>Eventify</strong>. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;


export default transporter;