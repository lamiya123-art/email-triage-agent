import { google } from 'googleapis';
import * as fs from 'fs';
import * as readline from 'readline';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
];

const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf-8'));
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
console.log('Open this URL in your browser:\n', authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('\nPaste the code from the browser here: ', async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);
  fs.writeFileSync('token.json', JSON.stringify(tokens));
  console.log('token.json saved! You are good to go.');
  rl.close();
});