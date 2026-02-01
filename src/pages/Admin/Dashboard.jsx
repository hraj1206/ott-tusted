import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Smartphone, Settings, FileSpreadsheet, MessageSquare } from 'lucide-react';
import Orders from './Orders';
import AppsManager from './AppsManager';
import PaymentSettings from './PaymentSettings';
import DataExport from './DataExport';
import ReviewManager from './ReviewManager';

const tabs = [
    { id: 'orders', label: 'Orders', icon: LayoutDashboard },
    { id: 'apps', label: 'Apps & Plans', icon: Smartphone },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'export', label: 'Reports', icon: FileSpreadsheet },
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('orders');

    return (
        <div className="min-h-screen pt-4 pb-12 px-4 container mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

                {/* Tabs */}
                <div className="flex space-x-2 overflow-x-auto pb-2 mb-8 border-b border-white/10">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-lg shadow-red-900/20'
                                        : 'text-muted hover:text-white hover:bg-white/5'}
                `}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'orders' && <Orders />}
                        {activeTab === 'apps' && <AppsManager />}
                        {activeTab === 'reviews' && <ReviewManager />}
                        {activeTab === 'settings' && <PaymentSettings />}
                        {activeTab === 'export' && <DataExport />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
