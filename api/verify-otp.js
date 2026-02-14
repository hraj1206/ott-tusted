import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { email, otp, userId } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Missing email or OTP' });

    try {
        const { data: record, error: fetchError } = await supabase
            .from('verification_otps')
            .select('*')
            .eq('email', email)
            .single();

        if (fetchError || !record) return res.status(400).json({ error: 'Invalid or expired OTP' });

        if (new Date() > new Date(record.expires_at)) {
            await supabase.from('verification_otps').delete().eq('email', email);
            return res.status(400).json({ error: 'OTP expired' });
        }

        const salt = process.env.OTP_SECRET || 'fallback-secret-change-me';
        const incomingHashed = crypto.createHmac('sha256', salt).update(otp).digest('hex');

        if (incomingHashed !== record.hashed_otp) return res.status(400).json({ error: 'Incorrect code' });

        // Success! 
        await supabase.from('verification_otps').delete().eq('email', email);

        // Update the profile using SERVICE ROLE (bypassing RLS)
        if (userId) {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_verified: true })
                .eq('id', userId);

            if (updateError) throw updateError;
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
