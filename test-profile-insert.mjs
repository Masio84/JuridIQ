import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testProfileInsert() {
  console.log('Testing manual profile insert...');
  
  // UUID for test
  const testId = '00000000-0000-0000-0000-000000000000';
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: testId,
      email: 'test_insert@demo.juridiq.mx',
      nombre_completo: 'Test User',
      role: 'admin_despacho'
    });

  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Success:', data);
  }
}

testProfileInsert();
