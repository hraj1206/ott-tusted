import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = process.env.OTP_SECRET || 'fallback-secret-change-me';
    const hashedOtp = crypto.createHmac('sha256', salt).update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
        const { error: dbError } = await supabase
            .from('verification_otps')
            .upsert({ email, hashed_otp: hashedOtp, expires_at: expiresAt }, { onConflict: 'email' });

        if (dbError) throw dbError;

        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: 'OTT Trusted', email: 'no-reply@otttrusted.online' },
                to: [{ email }],
                subject: 'Your Verification Code',
                htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 400px; margin: auto;">
            <h2 style="color: #FF0000; text-align: center;">OTT TRUSTED</h2>
            <p style="text-align: center;">Your 6-digit verification code is:</p>
            <h1 style="letter-spacing: 10px; background: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; color: #000;">${otp}</h1>
            <p style="color: #666; font-size: 12px; text-align: center;">This code expires in 5 minutes. Please do not share it with anyone.</p>
          </div>
        `
            })
        });

        if (!brevoResponse.ok) {
            const errorData = await brevoResponse.json();
            throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
        }

        return res.status(200).json({ message: 'OTP sent' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}