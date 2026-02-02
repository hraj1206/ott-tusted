import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const MOCK_REVIEWS = [
    { id: 1, user_name: "Chetan S.", content: "Best service, fast reply. Replacement was a quick solution to my problems thx!", rating: 5 },
    { id: 2, user_name: "Sneha Reddy", content: "Trusted service. Best price for Disney+ Hotstar premium I've found so far.", rating: 5 },
    { id: 3, user_name: "Rahul Verma", content: "Good support team, clear communication. Highly recommended for OTT seekers.", rating: 4 },
    { id: 4, user_name: "Vikram Jeet", content: "Access keys received in less than 5 minutes. Amazing speed and reliability!", rating: 5 },
    { id: 5, user_name: "Priya Malhotra", content: "Safe and secure payment. Definitely the best OTT provider in the market.", rating: 5 },
    { id: 6, user_name: "Arjun Vijay", content: "Been using for 3 months now. No issues at all. Very smooth experience.", rating: 5 },
    { id: 7, user_name: "Deepika P.", content: "Super fast delivery. Got my Prime Video account instantly! Great work guys.", rating: 5 },
    { id: 8, user_name: "Karan Tiwari", content: "Affordable and reliable. Will definitely renew my Netflix 4K from here.", rating: 5 },
    { id: 9, user_name: "Ananya Saxena", content: "Great customer service. Helped me with the setup very quickly and politely.", rating: 5 },
    { id: 10, user_name: "Rohan Bansal", content: "Finally a trusted source for discounted premium accounts! No more scams.", rating: 5 },
    { id: 11, user_name: "Ishaan K.", content: "Smooth login process and the quality of the stream is top notch 4K.", rating: 5 },
    { id: 12, user_name: "Megha Gupta", content: "Honest service. They actually deliver what they promise on the landing page.", rating: 5 },
    { id: 13, user_name: "Suresh Mani", content: "Very professional. The dashboard is easy to use and tracking is simple.", rating: 4 },
    { id: 14, user_name: "Tanvi Rao", content: "I was skeptical at first, but they proved me wrong. Excellent service!", rating: 5 },
    { id: 15, user_name: "Yash Vardhan", content: "Best prices for bundled packages. Highly recommended for families.", rating: 5 },
];

export default function Reviews() {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const { data } = await supabase.from('reviews').select('*').eq('active', true);

        // Combine Supabase reviews with our diverse mock set
        // This ensures the marquee is always full and varied
        const combined = data && data.length > 0
            ? [...data, ...MOCK_REVIEWS]
            : MOCK_REVIEWS;

        setReviews(combined);
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

            <div id="reviews-marquee-container" className="relative flex overflow-hidden group/carousel">
                {/* Edge Fades for smoother look */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black via-black/50 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black via-black/50 to-transparent z-10 pointer-events-none" />

                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex gap-6 whitespace-nowrap py-4"
                >
                    {/* Render many times to ensure even a single review covers the screen width twice */}
                    {[...reviews, ...reviews, ...reviews, ...reviews, ...reviews, ...reviews, ...reviews, ...reviews].map((review, i) => (
                        <div
                            key={i}
                            className="w-[300px] md:w-[350px] flex-shrink-0 bg-surface/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-primary/50 transition-colors group"
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
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                    <span className="text-xs font-black italic text-primary">{review.user_name ? review.user_name[0] : 'U'}</span>
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-widest">{review.user_name || 'Anonymous'}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
