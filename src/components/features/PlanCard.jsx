import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

export default function PlanCard({ plan, onSelect, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-surface/80 hover:shadow-2xl hover:shadow-primary/10"
        >
            <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline text-3xl font-bold text-primary">
                    ₹{plan.price}
                </div>
            </div>

            <div className="mb-6 flex-grow space-y-3">
                {plan.details?.split(',').map((feature, i) => (
                    <div key={i} className="flex items-start">
                        <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-muted">{feature.trim()}</span>
                    </div>
                ))}
            </div>

            <Button onClick={() => onSelect(plan)} className="w-full">
                Buy Now
            </Button>
        </motion.div>
    );
}
