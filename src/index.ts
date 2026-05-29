import 'dotenv/config';
import { getGmailClient, fetchUnreadEmails } from './gmail';
import { triageEmail } from './agent';

console.log('Key loaded:', process.env.GROQ_API_KEY?.slice(0, 8));

async function run() {
  console.log(`[${new Date().toISOString()}] Starting triage run...`);
  const gmail = await getGmailClient();
  const emails = await fetchUnreadEmails(gmail);
  console.log(`Found ${emails.length} unread emails`);

  const results = [];
  for (const email of emails) {
    const result = await triageEmail(gmail, email);
    console.log('Result:', JSON.stringify(result));
    results.push(result);
    console.log(`  ✓ ${email.subject} → ${result?.action} (${result?.priority ?? ''})`);
  }

  console.log('\n--- Digest ---');
  const drafted = results.filter(r => r?.action === 'drafted').length;
  const labelled = results.filter(r => r?.action === 'labelled').length;
  console.log(`Drafted: ${drafted} | Labelled/archived: ${labelled}`);
  console.log('All results:', results.map(r => r?.action));
}

run().catch(console.error);