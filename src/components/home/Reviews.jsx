import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const MOCK_REVIEWS = [
    { id: 1, user_name: "Amit K.", content: "Instant activation as promised. Netflix 4K works perfectly!", rating: 5 },
    { id: 2, user_name: "Sneha R.", content: "Trusted service. Best price for Disney+ Hotstar premium.", rating: 5 },
    { id: 3, user_name: "Rahul S.", content: "Good support team, clear communication. Highly recommended.", rating: 4 },
    { id: 4, user_name: "Vikram J.", content: "Access keys received in less than 5 minutes. Amazing!", rating: 5 },
    { id: 5, user_name: "Priya M.", content: "Safe and secure payment. The best OTT provider.", rating: 5 },
];

export default function Reviews() {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const { data } = await supabase.from('reviews').select('*').eq('active', true);
        if (data && data.length > 0) {
            setReviews(data);
        } else {
            setReviews(MOCK_REVIEWS);
        }
    };

    return (
        <section className="py-24 overflow-hidden border-t border-white/5 bg-black/50">
            <div className="container mx-auto px-4 mb-16 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="font-display font-black italic text-4xl text-white uppercase"
                >
                    TRUSTED BY <span className="text-primary">COMMUNITY</span>
                </motion.h2>
                <div className="w-12 h-1 bg-primary mx-auto mt-4 rounded-full" />
            </div>

            <div className="flex gap-6 overflow-hidden select-none">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="flex gap-6 whitespace-nowrap"
                >
                    {[...reviews, ...reviews].map((review, i) => (
                        <div
                            key={i}
                            className="w-[300px] flex-shrink-0 bg-surface/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-primary/50 transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} size={14} className={j < review.rating ? "text-primary fill-primary" : "text-muted"} />
                                    ))}
                                </div>
                                <Quote size={20} className="text-white/10 group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-sm text-white/90 whitespace-normal mb-4 font-medium leading-relaxed italic">
                                "{review.content}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <span className="text-[10px] font-black italic text-primary">{review.user_name[0]}</span>
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-widest">{review.user_name}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
