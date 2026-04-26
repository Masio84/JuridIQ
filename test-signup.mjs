import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSignup() {
  console.log('Testing signup...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_trigger@demo.juridiq.mx',
    password: 'Password123!',
    email_confirm: true,
    user_metadata: {
      nombre_completo: 'Test User',
      nombre_despacho: 'Test Despacho',
      role: 'admin_despacho'
    }
  });

  if (error) {
    console.error('Signup Error:', error);
  } else {
    console.log('Signup Success:', data.user.id);
    
    // Check if profile was created
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profError) {
      console.error('Profile fetch error:', profError);
    } else {
      console.log('Profile created successfully:', profile);
    }

    // Cleanup
    await supabase.auth.admin.deleteUser(data.user.id);
    console.log('Test user deleted');
  }
}

testSignup();
