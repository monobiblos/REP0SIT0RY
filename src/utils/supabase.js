import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gqqenecnubsvjntihcuj.supabase.co';
const supabaseAnonKey = 'sb_publishable_QbByoh5MMeFaD-Mlca5KGg_Dxt4HTsW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
