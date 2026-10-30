import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'TERA_PROJECT_URL_YAHAN_DALO'
const supabaseAnonKey = 'TERI_PUBLISHABLE_KEY_YAHAN_DALO'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
