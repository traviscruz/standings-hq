const supabase = require('./config/supabase');

async function main() {
  const id = '00000000-0000-0000-0000-000000000000';
  const updates = { status: 'Registered', updated_at: new Date().toISOString() };

  console.log('Testing update on event_participants...');
  const { data, error } = await supabase
    .from('event_participants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('SUPABASE ERROR:', error);
  } else {
    console.log('SUPABASE SUCCESS:', data);
  }
}

main();
