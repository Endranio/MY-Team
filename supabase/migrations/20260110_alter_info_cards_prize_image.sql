-- Migration to change prizes column to prize_image_url
-- Run this if info_cards table already exists with the old schema

-- Step 1: Drop the prizes column if exists
ALTER TABLE public.info_cards DROP COLUMN IF EXISTS prizes;

-- Step 2: Add prize_image_url column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'info_cards' 
        AND column_name = 'prize_image_url'
    ) THEN
        ALTER TABLE public.info_cards ADD COLUMN prize_image_url text;
    END IF;
END $$;
