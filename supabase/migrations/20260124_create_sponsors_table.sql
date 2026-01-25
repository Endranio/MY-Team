-- Create sponsors table
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active sponsors
CREATE POLICY "Public can view active sponsors" ON public.sponsors
    FOR SELECT
    USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage sponsors" ON public.sponsors
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Create storage bucket for sponsor logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsor-logos', 'sponsor-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Public can view sponsor logos
CREATE POLICY "Public can view sponsor logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsor-logos');

-- Storage policy: Admins can upload sponsor logos
CREATE POLICY "Admins can upload sponsor logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'sponsor-logos'
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Storage policy: Admins can update sponsor logos
CREATE POLICY "Admins can update sponsor logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'sponsor-logos'
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Storage policy: Admins can delete sponsor logos
CREATE POLICY "Admins can delete sponsor logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'sponsor-logos'
    AND EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);
