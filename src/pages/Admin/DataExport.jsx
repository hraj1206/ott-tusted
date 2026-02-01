import * as XLSX from 'xlsx';
import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/ui/Button';
import { FileDown } from 'lucide-react';

export default function DataExport() {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          id,
          created_at,
          status,
          user:profiles(full_name, phone, role),
          plan:ott_plans(name, price, app:ott_apps(name))
        `);

            if (error) throw error;

            const flattenedData = data.map(order => ({
                OrderID: order.id,
                Date: new Date(order.created_at).toLocaleDateString(),
                CustomerName: order.user?.full_name,
                Phone: order.user?.phone,
                App: order.plan?.app?.name,
                Plan: order.plan?.name,
                Price: order.plan?.price,
                Status: order.status
            }));

            const ws = XLSX.utils.json_to_sheet(flattenedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Orders");
            XLSX.writeFile(wb, "OTT_Orders_Export.xlsx");

        } catch (err) {
            alert("Export failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-surface/50 p-8 rounded-xl border border-white/10 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Export Data</h3>
            <p className="text-muted mb-6">Download a complete report of all orders and users in Excel format.</p>

            <Button onClick={handleExport} isLoading={loading} size="lg">
                <FileDown className="mr-2 h-5 w-5" />
                Download Excel Report
            </Button>
        </div>
    );
}
