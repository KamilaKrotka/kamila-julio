const sgMail = require('@sendgrid/mail');

module.exports = async (req, res) => {
  // 1. Allow Vercel to handle the request properly
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const {
    name,
    email,
    phone,
    attendance,
    guests,
    dietary,
    comments,
    notify_email,
  } = req.body;

  // 2. Configuration
  const apiKey = process.env.SENDGRID_API_KEY;
  // This 'from' email MUST be verified in your SendGrid dashboard
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@kamila-julio.com';
  const toEmail = notify_email || process.env.RSVP_NOTIFY_EMAIL || 'kamkrotka@gmail.com';

  if (!apiKey) {
    return res.status(500).json({ error: 'SENDGRID_API_KEY is missing in Vercel settings' });
  }

  sgMail.setApiKey(apiKey);

  // 3. Email Content
  const subject = `Wedding RSVP: ${name || 'New Guest'}`;
  const body = `
    New RSVP Received:
    --------------------------
    Name: ${name || '-'}
    Email: ${email || '-'}
    Phone: ${phone || '-'}
    Attendance: ${attendance || '-'}
    Number of Guests: ${guests || '-'}
    Dietary Info: ${dietary || '-'}
    Comments: ${comments || '-'}
  `;

  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: subject,
    text: body,
    html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${body}</div>`,
  };

  // 4. Send the Email
  try {
    await sgMail.send(msg);
    return res.status(200).json({ success: true, message: 'RSVP sent' });
  } catch (error) {
    console.error('SendGrid error:', error);
    return res.status(500).json({ 
      error: 'Could not send email', 
      details: error.response ? error.response.body : error.message 
    });
  }
};