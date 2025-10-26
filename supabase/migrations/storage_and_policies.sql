-- ==============================================
-- 1. CREATE STORAGE BUCKETS
-- ==============================================

-- Bucket for user avatars (publicly readable)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for campaign and reward images (publicly readable)
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for sensitive documents like applications and compliance files (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket for QR code assets (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('qrcodes', 'qrcodes', false)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 2. AVATARS BUCKET POLICIES
-- ==============================================

-- Allow public read access to all files in the 'avatars' bucket.
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar.
-- The file path must be scoped to their user ID (e.g., 'public/user-id-123.jpg').
CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update or delete their own avatar.
CREATE POLICY "Allow authenticated users to update/delete their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ==============================================
-- 3. CAMPAIGNS BUCKET POLICIES
-- ==============================================

-- Allow admin roles (super_admin, franchise_admin) to perform all actions.
CREATE POLICY "Allow admin to manage campaigns"
ON storage.objects FOR ALL
USING (
    bucket_id = 'campaigns' AND
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin')
)
WITH CHECK (
    bucket_id = 'campaigns' AND
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin')
);

-- Allow public read access for campaign images.
CREATE POLICY "Public read for campaigns"
ON storage.objects FOR SELECT
USING ( bucket_id = 'campaigns' );

-- ==============================================
-- 4. DOCUMENTS BUCKET POLICIES
-- ==============================================

-- Allow users to upload to a personal folder within the documents bucket.
-- This is perfect for influencer applications.
CREATE POLICY "Allow upload to own user folder in documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view and download their own documents.
CREATE POLICY "Allow viewing for own user folder in documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admin roles to view all documents.
-- Essential for reviewing applications and compliance files.
CREATE POLICY "Allow admins to view all documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents' AND
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin')
);

-- ==============================================
-- 5. QR CODES BUCKET POLICIES
-- ==============================================

-- Allow staff and admin roles to manage all QR code files.
CREATE POLICY "Allow staff/admin to manage QR codes"
ON storage.objects FOR ALL
USING (
    bucket_id = 'qrcodes' AND
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin', 'manager', 'branch_staff')
)
WITH CHECK (
    bucket_id = 'qrcodes' AND
    (SELECT role from public.users where id = auth.uid()::text) IN ('super_admin', 'franchise_admin', 'manager', 'branch_staff')
);
