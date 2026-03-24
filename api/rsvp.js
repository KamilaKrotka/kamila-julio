const sgMail = require('@sendgrid/mail');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only POST allowed' });
    return;
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

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'no-reply@kamila-julio.com';
  const toEmail = notify_email || process.env.RSVP_NOTIFY_EMAIL || 'kamkrotka@gmail.com';

  if (!apiKey) {
    return res.status(500).json({ error: 'SENDGRID_API_KEY is not set in environment' });
  }

  sgMail.setApiKey(apiKey);

  const subject = `RSVP received from ${name || 'Guest'}`;
  const body = `
    Name: ${name || '-'}
    Email: ${email || '-'}
    Phone: ${phone || '-'}
    Attendance: ${attendance || '-'}
    Guests: ${guests || '-'}
    Dietary: ${dietary || '-'}
    Comments: ${comments || '-'}
  `;

  const msg = {
    to: toEmail,
    from: fromEmail,
    subject,
    text: body,
    html: `<pre>${body}</pre>`,
  };

  try {
    await sgMail.send(msg);
    return res.status(200).json({ success: true, message: 'RSVP sent' });
  } catch (error) {
    console.error('SendGrid error', error);
    return res.status(500).json({ error: 'Could not send email', details: error.message || error.toString() });
  }
};