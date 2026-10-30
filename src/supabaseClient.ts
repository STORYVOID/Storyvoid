import { createClient } from '@supabase/supabase-js';

// Apne Supabase project ka URL yahan daal (jaise https://abcdefgh.supabase.co)
const supabaseUrl = 'YOUR_SUPABASE_URL'; 
const supabaseAnonKey = 'Sb_publishable_Z9C9jEr0kU0uoGhz16iOvg_hEo8q-ps';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
