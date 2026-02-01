import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save } from 'lucide-react';

export default function PaymentSettings() {
    const [config, setConfig] = useState({ upi_id: '', whatsapp_number: '', qr_code_url: '' });
    const [loading, setLoading] = useState(false);
    const [id, setId] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        const { data } = await supabase.from('payment_config').select('*').maybeSingle();
        if (data) {
            setConfig({
                upi_id: data.upi_id || '',
                whatsapp_number: data.whatsapp_number || '',
                qr_code_url: data.qr_code_url || ''
            });
            setId(data.id);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (id) {
                await supabase.from('payment_config').update(config).eq('id', id);
            } else {
                await supabase.from('payment_config').insert(config);
                fetchConfig(); // Get ID
            }
            alert('Settings saved!');
        } catch (error) {
            alert('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-surface/50 p-8 rounded-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Payment Configuration</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-muted mb-1">WhatsApp Number</label>
                    <Input
                        value={config.whatsapp_number}
                        onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
                        placeholder="e.g. 919876543210"
                    />
                    <p className="text-xs text-muted mt-1">Used for order notifications.</p>
                </div>

                <div>
                    <label className="block text-sm text-muted mb-1">UPI ID</label>
                    <Input
                        value={config.upi_id}
                        onChange={(e) => setConfig({ ...config, upi_id: e.target.value })}
                        placeholder="username@upi"
                    />
                </div>

                <div>
                    <label className="block text-sm text-muted mb-1">QR Code Image URL</label>
                    <Input
                        value={config.qr_code_url}
                        onChange={(e) => setConfig({ ...config, qr_code_url: e.target.value })}
                        placeholder="https://..."
                    />
                    <p className="text-xs text-muted mt-1">Direct link to QR code image (upload to Supabase Storage manually and paste link here for now, or use external host).</p>
                </div>

                <div className="pt-4">
                    <Button onClick={handleSave} isLoading={loading} className="w-full">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
