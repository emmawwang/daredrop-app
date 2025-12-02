# Supabase Storage Setup

This guide explains how to set up Supabase Storage buckets for storing dare images and videos in the cloud.

## Why Use Supabase Storage?

Currently, images are stored as local device file paths in the database. This means:

- ❌ Images are only on the user's device
- ❌ Images can't be shared across devices
- ❌ Images will be lost if the app is deleted
- ❌ Images can't be viewed on the web

With Supabase Storage:

- ✅ Images/videos are stored in the cloud
- ✅ Can be accessed from any device
- ✅ Persistent and backed up
- ✅ Can be shared publicly

## Setup Instructions

### Step 1: Create Storage Buckets

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **New bucket**

**Create TWO buckets:**

#### Bucket 1: dare-images

- **Name:** `dare-images`
- **Public:** ✅ Yes (check this box)
- **File size limit:** 5 MB
- **Allowed MIME types:** Leave empty or set to `image/*`
- Click **Create bucket**

#### Bucket 2: dare-videos

- **Name:** `dare-videos`
- **Public:** ✅ Yes (check this box)
- **File size limit:** 50 MB
- **Allowed MIME types:** Leave empty or set to `video/*`
- Click **Create bucket**

### Step 2: Configure Storage Policies

For each bucket, you need to set up policies so users can upload/delete their own files.

#### For `dare-images` bucket:

1. Click on `dare-images` bucket
2. Click **Policies** tab
3. Click **New policy**
4. Select **For full customization** → Click **Create policy**

**Policy 1: Allow authenticated users to upload**

```sql
-- Name: Enable insert for authenticated users
-- Allowed operation: INSERT

CREATE POLICY "Enable insert for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dare-images');
```

**Policy 2: Allow users to delete their own files**

```sql
-- Name: Enable delete for users own files
-- Allowed operation: DELETE

CREATE POLICY "Enable delete for users own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'dare-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Policy 3: Allow public read access**

```sql
-- Name: Give public read access
-- Allowed operation: SELECT

CREATE POLICY "Give public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'dare-images');
```

#### For `dare-videos` bucket:

Repeat the same three policies, but replace `'dare-images'` with `'dare-videos'`.

### Step 3: Test the Setup

Once you've created the buckets and policies:

1. Restart your Expo app
2. Complete a dare with an image
3. Check the Supabase Storage dashboard - you should see the file uploaded!

The database will now store URLs like:

```
https://yourproject.supabase.co/storage/v1/object/public/dare-images/user-id/dare_12345.jpg
```

Instead of local paths like:

```
file:///Users/emmawang/Library/Developer/CoreSimulator/...
```

## How It Works

### File Upload Process

1. User selects/takes a photo or video
2. App reads the local file as base64
3. Uploads to Supabase Storage in the appropriate bucket
4. Returns a public URL
5. Saves the public URL in the database

### File Organization

Files are organized by user:

```
dare-images/
  ├── user-id-1/
  │   ├── dare_123456.jpg
  │   └── dare_789012.jpg
  └── user-id-2/
      └── dare_345678.jpg

dare-videos/
  └── user-id-1/
      └── dare_111222.mp4
```

### Video Support

The app now supports videos with:

- 30-second maximum duration
- Common formats: MP4, MOV, AVI, WebM, MKV
- Automatic video player with native controls

## Troubleshooting

### "Failed to upload media"

Check:

- Buckets are created and **public** is enabled
- Storage policies are set up correctly
- User is authenticated
- File size is within limits

### Videos not playing

Make sure `expo-av` is installed:

```bash
npm install expo-av --legacy-peer-deps
```

### Old dares showing local paths

Existing dares will keep their local paths. New dares and re-edited dares will upload to Supabase Storage.

To migrate old dares, you would need to manually re-edit each one.
