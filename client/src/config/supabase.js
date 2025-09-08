import { createClient } from '@supabase/supabase-js';

// Supabase client configuration for React
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ryddcawwyzqqdrwxkhpa.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5ZGRjYXd3eXpxcWRyd3hraHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyOTYwMTUsImV4cCI6MjA3Mjg3MjAxNX0.EmRFWkulVzlJfYf8G1oRA25YTewnm1SNKzQdI6EpOmI';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;