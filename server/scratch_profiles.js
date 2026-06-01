const supabase = require('./config/supabase');

async function checkProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, username, email, role')
    .order('role', { ascending: true });

  if (error) {
    console.error("Error fetching profiles:", error.message);
    return;
  }

  console.log("Current Profiles in Database:");
  console.log(JSON.stringify(data, null, 2));
}

checkProfiles();
