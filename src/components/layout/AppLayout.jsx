import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import WhatsAppButton from '../WhatsAppButton';

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-background text-text">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <WhatsAppButton />
        </div>
    );
}
