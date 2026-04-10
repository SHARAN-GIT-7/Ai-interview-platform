import express from 'express';
import nodemailer from 'nodemailer';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for pending verifications (In a real app, use a database)
const pendingVerifications = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/api/send-verification', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const verificationLink = `http://localhost:${PORT}/api/verify?token=${token}`;

    pendingVerifications.set(email, { token, verified: false });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Company Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          </style>
        </head>
        <body style="font-family: 'Inter', Arial, sans-serif; background-color: #EAF0F0; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 20px rgba(20, 69, 66, 0.05);">
            <div style="width: 56px; height: 56px; background-color: #144542; border-radius: 16px; display: inline-block; text-align: center; line-height: 56px; font-size: 32px; font-weight: bold; color: #DAFF0C; margin-bottom: 24px;">🏢</div>
            <h2 style="color: #144542; font-size: 28px; font-weight: 900; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.5px;">Verify your company email</h2>
            <p style="color: #9B9B9B; font-size: 16px; margin-bottom: 32px; line-height: 1.6;">You're almost ready to start hiring! Please verify your company email address to unlock your recruitment workspace and start discovering top talent.</p>

            <a href="${verificationLink}" style="background-color: #144542; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 900; display: inline-block; font-size: 16px; box-shadow: 0 4px 14px rgba(20, 69, 66, 0.2);">Verify Company Email</a>
            <p style="color: #9B9B9B; font-size: 13px; margin-top: 40px; border-top: 1px solid #dce5e5; padding-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

app.get('/api/verify', (req, res) => {
  const { token } = req.query;

  for (const [email, data] of pendingVerifications.entries()) {
    if (data.token === token) {
      pendingVerifications.set(email, { ...data, verified: true });
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Company Email Verified - Interview App</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; background-color: #EAF0F0; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; max-width: 400px; width: 90%; }
            .logo { width: 56px; height: 56px; background-color: #144542; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; color: #DAFF0C; margin-bottom: 24px; }
            h1 { color: #144542; font-size: 32px; font-weight: 900; margin: 0 0 16px 0; letter-spacing: -1px; }
            p { color: #9B9B9B; font-size: 16px; line-height: 1.5; margin-bottom: 32px; }
            .success-icon { width: 64px; height: 64px; background-color: #DAFF0C; color: #144542; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="success-icon">✓</div>
            <h1>Company Email Verified!</h1>
            <p>Your company email has been successfully verified. You can safely close this window and return to the app to complete registration.</p>
          </div>
          <script>
            setTimeout(() => { window.close() }, 4000);
          </script>
        </body>
        </html>
      `);
    }
  }

  res.status(400).send('Invalid or expired verification link');
});

app.get('/api/check-verification/:email', (req, res) => {
  const { email } = req.params;
  const data = pendingVerifications.get(email);

  if (data && data.verified) {
    res.json({ verified: true });
  } else {
    res.json({ verified: false });
  }
});

// HR Database Proxy Endpoints
app.get('/api/hr/exists', async (req, res) => {
  const { email } = req.query;
  try {
    const response = await axios.get(`http://localhost:5263/api/HR/exists?email=${encodeURIComponent(email)}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error checking HR status:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to check HR status' });
  }
});

app.post('/api/hr/register', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5263/api/HR/register', req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error registering HR:', error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || 'Failed to register HR' });
  }
});

app.get('/api/hr/list/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const response = await axios.get(`http://localhost:5263/api/HR/company/${companyId}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching HR list:', error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch HR list' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Company email verification server running on http://localhost:${PORT}`);
});
