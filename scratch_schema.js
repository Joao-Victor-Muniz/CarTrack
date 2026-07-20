import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('c:/Users/Jvsm/Desktop/CarTrack/app/.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('registros').select('*').limit(1);
  if (error) {
    console.error(error);
  } else {
    console.log("Success. Result:");
    console.log(data);
  }
}

check();
