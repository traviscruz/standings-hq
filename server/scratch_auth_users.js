const supabase = require('./config/supabase');

const SAMPLE_USERS = [
  // ORGANIZERS (5)
  { fname: "Juan", lname: "Dela Cruz", username: "juandelacruz", email: "juan.delacruz@example.com", role: "Organizer" },
  { fname: "Maria Clara", lname: "Santos", username: "mariaclara", email: "maria.clara@example.com", role: "Organizer" },
  { fname: "Jose", lname: "Rizal", username: "joserizal", email: "jose.rizal@example.com", role: "Organizer" },
  { fname: "Cardo", lname: "Dalisay", username: "cardodalisay", email: "cardo.dalisay@example.com", role: "Organizer" },
  { fname: "Marites", lname: "Concepcion", username: "marites_c", email: "marites.c@example.com", role: "Organizer" },

  // JUDGES (7)
  { fname: "Andres", lname: "Bonifacio", username: "bonifacio_a", email: "andres.b@example.com", role: "Judge" },
  { fname: "Luningning", lname: "Dimagiba", username: "luningning", email: "luningning.d@example.com", role: "Judge" },
  { fname: "Renato", lname: "Reyes", username: "renatoreyes", email: "renato.reyes@example.com", role: "Judge" },
  { fname: "Gloria", lname: "Macapagal", username: "gloriam", email: "gloria.m@example.com", role: "Judge" },
  { fname: "Manny", lname: "Pacquiao", username: "pacman", email: "manny.pacman@example.com", role: "Judge" },
  { fname: "Pia", lname: "Wurtzbach", username: "piaw", email: "pia.w@example.com", role: "Judge" },
  { fname: "Catriona", lname: "Gray", username: "catrionag", email: "catriona.g@example.com", role: "Judge" },

  // PARTICIPANTS (7)
  { fname: "Dingdong", lname: "Dantes", username: "dingdongd", email: "dingdong.d@example.com", role: "Participant" },
  { fname: "Marian", lname: "Rivera", username: "marianr", email: "marian.r@example.com", role: "Participant" },
  { fname: "Kathryn", lname: "Bernardo", username: "kathrynb", email: "kathryn.b@example.com", role: "Participant" },
  { fname: "Daniel", lname: "Padilla", username: "danielp", email: "daniel.p@example.com", role: "Participant" },
  { fname: "Alden", lname: "Richards", username: "aldenr", email: "alden.r@example.com", role: "Participant" },
  { fname: "Maine", lname: "Mendoza", username: "mainem", email: "maine.m@example.com", role: "Participant" },
  { fname: "Jericho", lname: "Rosales", username: "echo_r", email: "jericho.r@example.com", role: "Participant" }
];

const DEFAULT_PASSWORD = "P@ssword123!";

async function seedUsers() {
  console.log(`Starting to seed ${SAMPLE_USERS.length} Pinoy sample users...`);

  // 1. Fetch existing auth users to avoid duplicates
  let existingUsersList = [];
  try {
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;
    existingUsersList = users || [];
  } catch (err) {
    console.error("Error fetching existing auth users:", err.message);
  }

  for (const user of SAMPLE_USERS) {
    try {
      const emailLower = user.email.toLowerCase();
      let authUser = existingUsersList.find(u => u.email && u.email.toLowerCase() === emailLower);

      if (!authUser) {
        console.log(`Creating Auth User: ${user.fname} ${user.lname} (${user.email})...`);
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            username: user.username,
            first_name: user.fname,
            last_name: user.lname,
            role: user.role
          }
        });

        if (authError) {
          console.error(`Failed to create Auth User ${user.email}:`, authError.message);
          continue;
        }
        authUser = authData.user;
      } else {
        console.log(`Auth User already exists: ${user.email}`);
      }

      // Upsert into public.profiles
      console.log(`Upserting Profile for: ${user.fname} ${user.lname}...`);
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: authUser.id,
          email: user.email,
          username: user.username,
          first_name: user.fname,
          last_name: user.lname,
          role: user.role,
          updated_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error(`Failed to upsert Profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`Successfully created/updated profile for ${user.fname} ${user.lname}`);
      }
    } catch (error) {
      console.error(`Unexpected error seeding user ${user.email}:`, error.message);
    }
  }

  console.log("Seeding complete!");
}

seedUsers();
