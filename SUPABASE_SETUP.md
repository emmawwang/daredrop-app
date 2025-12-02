# Supabase Setup Guide

This guide will help you set up Supabase for the DareDrop app.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: `daredrop`
   - Database Password: Create a secure password (save this!)
   - Region: Choose the closest region to your users
4. Wait for the project to be created (~2 minutes)

## Step 2: Get Your API Credentials

1. Go to Project Settings (gear icon in sidebar)
2. Click on "API" in the left menu
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

## Step 3: Configure Your App

1. Create a `.env` file in the root of your project (copy from `.env.example`)
2. Add your credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database Tables

Run the following SQL in your Supabase SQL Editor (in the Supabase Dashboard):

### 1. Create Users Profile Table

```sql
-- Create a table for user profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Policy: Users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Create an index on email
create index profiles_email_idx on public.profiles(email);
```

### 2. Create Dares Table

```sql
-- Create a table for dares
create table public.dares (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  dare_text text not null,
  completed boolean default false not null,
  image_uri text,
  video_uri text,
  reflection_text text,
  draft_text text,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.dares enable row level security;

-- Policy: Users can view their own dares
create policy "Users can view own dares"
  on public.dares for select
  using ( auth.uid() = user_id );

-- Policy: Users can insert their own dares
create policy "Users can insert own dares"
  on public.dares for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can update their own dares
create policy "Users can update own dares"
  on public.dares for update
  using ( auth.uid() = user_id );

-- Policy: Users can delete their own dares
create policy "Users can delete own dares"
  on public.dares for delete
  using ( auth.uid() = user_id );

-- Create indexes
create index dares_user_id_idx on public.dares(user_id);
create index dares_completed_idx on public.dares(completed);
create index dares_created_at_idx on public.dares(created_at desc);
```

**Note**: If you already have the `dares` table, run this migration to add the new columns:

```sql
-- Add video_uri, reflection_text, and draft_text columns if they don't exist
alter table public.dares 
  add column if not exists video_uri text,
  add column if not exists reflection_text text,
  add column if not exists draft_text text;
```

### 3. Set Up Database Function to Create Profile on Signup

```sql
-- Function to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;

-- Trigger to call the function when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 4. Create Streak Tracking View

```sql
-- Create a view to calculate user streaks
create or replace view public.user_streaks as
select
  user_id,
  count(distinct date(completed_at)) as total_completed_days,
  max(completed_at) as last_completed_at
from public.dares
where completed = true
group by user_id;
```

### 5. Set Up Supabase Storage for Videos

Videos are larger files, so we'll store them in Supabase Storage instead of the database.

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to **Storage** in your Supabase Dashboard
2. Click **"New bucket"**
3. Create a bucket named `dare-videos` with the following settings:
   - **Public bucket**: Toggle **OFF** (private bucket)
   - **File size limit**: 50 MB (or your preferred limit)
   - **Allowed MIME types**: `video/mp4`, `video/quicktime`, `video/x-msvideo` (or leave empty for all)
4. Click **"Create bucket"**

**Option B: Using SQL (Alternative)**

Run this SQL in the SQL Editor:

```sql
-- Create storage bucket for dare videos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dare-videos',
  'dare-videos',
  false, -- Private bucket
  52428800, -- 50 MB limit
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo']
);
```

### 6. Set Up Storage Policies (Row Level Security for Storage)

Run this SQL to allow users to upload, view, and delete their own videos:

```sql
-- Policy: Users can upload videos to their own folder
create policy "Users can upload own videos"
on storage.objects for insert
with check (
  bucket_id = 'dare-videos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own videos
create policy "Users can view own videos"
on storage.objects for select
using (
  bucket_id = 'dare-videos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own videos
create policy "Users can update own videos"
on storage.objects for update
using (
  bucket_id = 'dare-videos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own videos
create policy "Users can delete own videos"
on storage.objects for delete
using (
  bucket_id = 'dare-videos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

**Important**: Videos will be stored in folders organized by user ID: `{user_id}/{video_filename}.mp4`

## Step 5: Enable Email Authentication

1. In Supabase Dashboard, go to Authentication > Providers
2. Make sure "Email" is enabled
3. **Important: Disable Email Confirmation for mobile apps**
   - Scroll down to **"Confirm email"**
   - **Toggle it OFF** (this prevents the localhost redirect issue)
   - Click **Save**
4. Configure email templates if desired (Authentication > Email Templates)

**Note**: Email confirmation doesn't work well with Expo apps out of the box because Supabase tries to redirect to localhost. For development, it's best to disable it. For production, you'll need to set up deep linking (see TROUBLESHOOTING.md).

## Step 6: Test Your Setup

1. Restart your Expo app: `npm start`
2. Try signing up with a new account
3. Check your Supabase Dashboard:
   - Go to Authentication > Users to see the new user
   - Go to Table Editor > profiles to see the profile created
   - Go to Table Editor > dares to see dares (after completing some)
   - Go to Storage > dare-videos to see uploaded videos (after completing video dares)

## Database Schema Summary

### Tables:

1. **profiles** - User profile information

   - id (uuid, primary key, references auth.users)
   - first_name (text)
   - last_name (text)
   - email (text)
   - created_at (timestamp)
   - updated_at (timestamp)

2. **dares** - User's dares and completion status
   - id (uuid, primary key)
   - user_id (uuid, references profiles)
   - dare_text (text)
   - completed (boolean)
   - image_uri (text, optional) - For photo dares
   - video_uri (text, optional) - For video dares (Supabase Storage path)
   - reflection_text (text, optional) - For text dares
   - draft_text (text, optional) - For saving draft reflections
   - completed_at (timestamp, optional)
   - created_at (timestamp)
   - updated_at (timestamp)

3. **Storage Bucket: dare-videos**
   - Stores video files for video dares
   - Organized by user ID: `{user_id}/{filename}.mp4`
   - Private bucket (users can only access their own videos)

### Security:

- Row Level Security (RLS) is enabled on all tables
- Storage policies ensure users can only access their own videos
- Users can only access their own data
- Automatic profile creation on user signup
