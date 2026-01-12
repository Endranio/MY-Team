-- Add support for up to 3 images per event
-- All images are optional

-- First, make the existing image_url column nullable
ALTER TABLE public.events ALTER COLUMN image_url DROP NOT NULL;

-- Add two new optional image columns
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url_2 text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url_3 text;

-- Add comment for documentation
COMMENT ON COLUMN public.events.image_url IS 'First event image (optional)';
COMMENT ON COLUMN public.events.image_url_2 IS 'Second event image (optional)';
COMMENT ON COLUMN public.events.image_url_3 IS 'Third event image (optional)';
