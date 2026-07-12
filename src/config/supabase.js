import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eazcxaiomyzcnimogpkm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhemN4YWlvbXl6Y25pbW9ncGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4Nzc0ODksImV4cCI6MjA5OTQ1MzQ4OX0.65mveI-TEOa3l2jx2fKQzJ28V1W398UMOwJpkTu4E1g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
