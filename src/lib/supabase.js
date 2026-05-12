import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://viwsgqiysswxajkxewet.supabase.co'
const supabaseAnonKey = 'sb_publishable_0zs_PEQNSZw0EAtOIbbmkA_9HLKOTGk'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)