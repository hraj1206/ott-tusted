import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setLoading(true); // Re-activate loading while fetching new profile
                setUser(session.user);
                fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // If profile missing, create it dynamically (Self-healing)
            if (error && error.code === 'PGRST116') {
                console.log("Profile missing, creating new default profile...");
                const { data: userUser } = await supabase.auth.getUser();
                if (userUser?.user) {
                    const { error: insertError } = await supabase.from('profiles').insert({
                        id: userId,
                        full_name: userUser.user.user_metadata?.full_name || 'User',
                        phone: userUser.user.user_metadata?.phone || '',
                        role: 'user' // Default role
                    });

                    if (!insertError) {
                        // Retry fetch
                        const retry = await supabase.from('profiles').select('*').eq('id', userId).single();
                        data = retry.data;
                        error = retry.error;
                    }
                }
            }

            if (error) {
                console.error("Error fetching/creating profile:", error);
            }
            setProfile(data);
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Optimized admin and verification checks
    const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin';
    const isVerified = profile?.is_verified === true || isAdmin;

    return (
        <AuthContext.Provider value={{ user, profile, isAdmin, isVerified, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
