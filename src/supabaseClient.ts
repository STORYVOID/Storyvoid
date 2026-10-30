import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tera-project-id.supabase.co'; // Yahan apna real URL daal
const supabaseAnonKey = 'Sb_publishable_Z9C9jEr0kU0uoGhz16iOvg_hEo8q-ps';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
