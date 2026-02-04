import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsAppButton() {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            const { data } = await supabase.from('payment_config').select('whatsapp_number').maybeSingle();
            setConfig(data);
        };
        fetchConfig();
    }, []);

    const handleWhatsAppClick = () => {
        const waNumber = config?.whatsapp_number ? config.whatsapp_number.replace(/\D/g, '') : '919876543210';
        window.open(`https://wa.me/${waNumber}`, '_blank');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWhatsAppClick}
                className="bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
                aria-label="Contact Support on WhatsApp"
            >
                <MessageCircle className="w-8 h-8 fill-current" />
                <span className="absolute right-full mr-4 bg-surface border border-white/10 px-3 py-1 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Need Help?
                </span>
            </motion.button>
        </div>
    );
}
