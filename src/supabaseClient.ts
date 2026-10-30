import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqmsdpxuikhhvymkzcqc.supabase.co';
const supabaseAnonKey = 'Sb_publishable_Z9C9jEr0kU0uoGhz16iOvg_hEo8q-ps';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
