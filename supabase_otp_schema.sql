-- 1. Add verification status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Create OTP storage table
-- Note: We store the email because users might verify before they have a stable auth session,
-- though in this flow, they sign up first.
CREATE TABLE IF NOT EXISTS public.verification_otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    hashed_otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_otp_email ON public.verification_otps(email);

-- 3. RLS for verification_otps (Very strict)
ALTER TABLE public.verification_otps ENABLE ROW LEVEL SECURITY;

-- Only service role (backend) should touch this table. 
-- We don't want ANY client-side access to this.
CREATE POLICY "No public access to OTPs" 
ON public.verification_otps 
FOR ALL 
USING (false);
