import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';

export default function ReviewManager() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ user_name: '', content: '', rating: 5 });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (data) setReviews(data);
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        await supabase.from('reviews').insert([newReview]);
        setNewReview({ user_name: '', content: '', rating: 5 });
        fetchReviews();
    };

    const toggleActive = async (id, active) => {
        await supabase.from('reviews').update({ active: !active }).eq('id', id);
        fetchReviews();
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this review?')) {
            await supabase.from('reviews').delete().eq('id', id);
            fetchReviews();
        }
    };

    if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />;

    return (
        <div className="space-y-8">
            <div className="bg-surface/50 p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-primary" /> Add New Review
                </h3>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        placeholder="User Name"
                        value={newReview.user_name}
                        onChange={e => setNewReview({ ...newReview, user_name: e.target.value })}
                        required
                    />
                    <Input
                        placeholder="Review Content"
                        value={newReview.content}
                        onChange={e => setNewReview({ ...newReview, content: e.target.value })}
                        required
                    />
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            min="1" max="5"
                            value={newReview.rating}
                            onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                        />
                        <Button type="submit" className="w-full">Add</Button>
                    </div>
                </form>
            </div>

            <div className="bg-surface/50 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-muted uppercase">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Content</th>
                            <th className="px-6 py-3">Rating</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {reviews.map((review) => (
                            <tr key={review.id} className="hover:bg-white/5">
                                <td className="px-6 py-4 font-medium text-white">{review.user_name}</td>
                                <td className="px-6 py-4 text-muted max-w-xs truncate">{review.content}</td>
                                <td className="px-6 py-4 text-primary font-bold">{review.rating} ★</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => toggleActive(review.id, review.active)}>
                                        {review.active ?
                                            <CheckCircle className="text-green-500 h-5 w-5" /> :
                                            <XCircle className="text-muted h-5 w-5" />
                                        }
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(review.id)} className="text-muted hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
