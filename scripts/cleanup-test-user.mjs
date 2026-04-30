// Script de cleanup do usuário de teste
// Deleta APENAS o userId e companyId específicos passados como argumento

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uipvhxgjaungdetwojou.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpcHZoeGdqYXVuZ2RldHdvam91Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjE0Mjc5MSwiZXhwIjoyMDgxNzE4NzkxfQ.JuDrrW3wJBjbbxtSjoN7uk-mxCSgCfBGIGwGvE_f_7U';

const USER_ID    = 'fc50cddd-1953-47cd-9140-8302810762ea';
const COMPANY_ID = '19cff2ed-c960-4433-b3d0-6e2986690414';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function del(table, filter) {
  const [col, val] = filter;
  const { error, count } = await supabase.from(table).delete({ count: 'exact' }).eq(col, val);
  if (error) {
    console.error(`  ✗ ${table}: ${error.message}`);
  } else {
    console.log(`  ✓ ${table}: ${count ?? 0} registro(s) deletado(s)`);
  }
}

console.log(`\n🗑️  Iniciando cleanup`);
console.log(`   userId:    ${USER_ID}`);
console.log(`   companyId: ${COMPANY_ID}\n`);

// 1: galeria
await del('company_gallery',   ['company_id', COMPANY_ID]);
// 2: reviews
await del('reviews',           ['company_id', COMPANY_ID]);
// 3: transações
await del('transactions',      ['company_id', COMPANY_ID]);
// 4: saldos cashback
await del('cashback_balances', ['company_id', COMPANY_ID]);
// 5: payment_history via subscription_id
const { data: subs } = await supabase.from('subscriptions').select('id').eq('company_id', COMPANY_ID);
if (subs && subs.length > 0) {
  const subIds = subs.map(s => s.id);
  const { error, count } = await supabase.from('payment_history').delete({ count: 'exact' }).in('subscription_id', subIds);
  if (error) console.error(`  ✗ payment_history: ${error.message}`);
  else console.log(`  ✓ payment_history: ${count ?? 0} registro(s) deletado(s)`);
} else {
  console.log('  ✓ payment_history: 0 registro(s) deletado(s)');
}
// 6: assinaturas
await del('subscriptions', ['company_id', COMPANY_ID]);
// 7: staff (profiles com company_id da empresa)
const { error: staffErr, count: staffCount } = await supabase
  .from('profiles').delete({ count: 'exact' })
  .eq('company_id', COMPANY_ID).eq('role', 'company_staff');
if (staffErr) console.error(`  ✗ profiles (staff): ${staffErr.message}`);
else console.log(`  ✓ profiles (staff): ${staffCount ?? 0} registro(s) deletado(s)`);

// 8: empresa
await del('companies', ['id', COMPANY_ID]);

// 9: profile do owner
await del('profiles', ['id', USER_ID]);

// 10: Supabase Auth
const { error: authError } = await supabase.auth.admin.deleteUser(USER_ID);
if (authError) {
  console.error(`  ✗ auth.users: ${authError.message}`);
} else {
  console.log(`  ✓ auth.users: usuário deletado`);
}

// Verificação final
const { data: checkProfile } = await supabase.from('profiles').select('id').eq('id', USER_ID).single();
const { data: checkCompany } = await supabase.from('companies').select('id').eq('id', COMPANY_ID).single();
const { data: { user: checkAuth } } = await supabase.auth.admin.getUserById(USER_ID);

console.log('\n🔍 Verificação final:');
console.log(`   profile:   ${checkProfile ? '❌ ainda existe' : '✓ deletado'}`);
console.log(`   company:   ${checkCompany ? '❌ ainda existe' : '✓ deletado'}`);
console.log(`   auth user: ${checkAuth   ? '❌ ainda existe' : '✓ deletado'}`);
console.log('');
