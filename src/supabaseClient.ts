import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqmsdpxuikhhvymkzcqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbXNkcHh1aWtoaHZ5bWt6Y3FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzI4OTYsImV4cCI6MjEwODkwODg5Nn0.Gg64gbXTMoTbu0LiC-wnzosI3xSO8OOXWuWpMSr9SOY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
