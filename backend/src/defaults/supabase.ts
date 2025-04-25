export const basePrompt = `
# Supabase Project Setup Guidelines

## Project Structure
- /src
  - /components  (React components)
  - /lib
    - /supabase.js (Supabase client setup)
  - /pages (if using Next.js)
  - /hooks (custom hooks for Supabase integration)

## Authentication
Implement authentication using Supabase Auth with:
- Email/password login
- Social providers if needed
- Password reset flow

## Database
Use Supabase's PostgreSQL database:
- Design tables with proper relationships
- Set up Row Level Security (RLS) policies
- Create appropriate indexes
- Use Supabase's SQL editor for migrations
- Use Supabase's API for CRUD operations


## Storage (if needed)
Implement file uploads using Supabase Storage:
- Configure storage buckets
- Set proper permissions
- Handle image uploads and transformations

## Realtime (if needed)
Use Supabase's realtime subscriptions for:
- Chat features
- Live updates
- Collaborative features

## Edge Functions (if needed)
Implement serverless functions for:
- Webhook handling
- Complex operations
- Third-party integrations

Start by setting up the Supabase client and authentication.
`;