import crypto from 'crypto';

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing signature verification parameters' });
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            return res.status(500).json({ error: 'RAZORPAY_KEY_SECRET is missing' });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            return res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            console.error('Signature Mismatch!', { expectedSignature, razorpay_signature });
            return res.status(400).json({ success: false, message: 'Invalid signature mismatch' });
        }
    } catch (error) {
        console.error('VERIFICATION ERROR:', error);
        return res.status(500).json({ error: error.message || 'Internal Verification Error' });
    }
}
