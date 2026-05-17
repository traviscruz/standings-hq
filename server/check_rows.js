const supabase = require('./config/supabase');

async function main() {
  console.log('--- EVENT PARTICIPANTS ---');
  const { data: participants, error: pError } = await supabase
    .from('event_participants')
    .select('id, name, email, status, event_id');
  if (pError) console.error(pError);
  else console.log(participants);

  console.log('--- EVENT JUDGES ---');
  const { data: judges, error: jError } = await supabase
    .from('event_judges')
    .select('id, name, email, status, event_id');
  if (jError) console.error(jError);
  else console.log(judges);
}

main();
