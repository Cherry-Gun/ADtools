const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ucpsztaufynmbqtvwqxa.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY; // I will pass this in

if (!supabaseAnonKey) {
  console.error("Please provide SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing Supabase connection...");
  const { data, error } = await supabase.from('rules').select('*').limit(5);
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`Success! Fetched ${data.length} rows.`);
    if (data.length > 0) {
      console.log(data[0]);
    }
  }
}

test();
