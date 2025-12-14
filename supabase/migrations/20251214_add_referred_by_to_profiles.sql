-- Add referred_by column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN referred_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add RLS policy to allow anonymous users to read admin names for registration
CREATE POLICY "Anyone can view admin profiles for referral"
  ON public.profiles FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_roles.user_id = profiles.id 
      AND user_roles.role = 'admin'
    )
  );

-- Allow anonymous read on user_roles for checking admins
CREATE POLICY "Anyone can check admin status"
  ON public.user_roles FOR SELECT
  TO anon
  USING (role = 'admin');

-- Update handle_new_user function to include referred_by
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, referred_by)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    (new.raw_user_meta_data->>'referred_by')::uuid
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

