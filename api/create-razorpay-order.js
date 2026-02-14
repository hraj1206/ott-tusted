import Razorpay from 'razorpay';

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { amount, currency = 'INR', receipt } = req.body || {};

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        console.log('Order request received:', { amount, receipt });
        const keyId = process.env.VITE_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        console.log('Using Key ID:', keyId ? (keyId.substring(0, 8) + '***') : 'UNDEFINED');

        if (!keyId || !keySecret) {
            return res.status(500).json({ error: 'Razorpay keys are missing in server environment .env file' });
        }

        const instance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const options = {
            amount: Math.round(parseFloat(amount) * 100), // amount in smallest currency unit
            currency,
            receipt,
        };

        console.log('Sending options to Razorpay:', options);
        const order = await instance.orders.create(options);
        console.log('Razorpay Order Created:', order.id);

        return res.status(200).json(order);
    } catch (error) {
        console.error('CRITICAL RAZORPAY ERROR:', error);

        // Return a clean JSON error response
        return res.status(500).json({
            error: error.message || 'Internal Razorpay Error',
            details: error.description || (typeof error === 'object' ? JSON.stringify(error) : null),
            code: error.code || null
        });
    }
}
