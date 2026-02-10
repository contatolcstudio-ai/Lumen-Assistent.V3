import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nrfzrthiuyuusawhrdzg.supabase.co';
const supabaseAnonKey = 'sb_publishable_nb-NwewhBMEWQTMUtYnChg_LXLp_iqQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
