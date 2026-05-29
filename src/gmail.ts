// src/gmail.ts
import { google } from 'googleapis';
import * as fs from 'fs';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
];

export async function getGmailClient() {
  const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const token = JSON.parse(fs.readFileSync('token.json', 'utf-8'));
  oAuth2Client.setCredentials(token);
  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

export async function fetchUnreadEmails(gmail: any, maxResults = 20) {
  const res = await gmail.users.messages.list({
    userId: 'me', q: 'is:unread', maxResults
  });
  const messages = res.data.messages || [];
  return Promise.all(messages.map(async (m: any) => {
    const msg = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'full' });
    return parseEmail(msg.data);
  }));
}

function parseEmail(raw: any) {
  const headers = raw.payload.headers;
  const get = (name: string) => headers.find((h: any) => h.name === name)?.value ?? '';
  const body = extractBody(raw.payload);
  return { id: raw.id, from: get('From'), subject: get('Subject'), date: get('Date'), body };
}

function extractBody(payload: any): string {
  if (payload.body?.data) return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractBody(part);
      if (text) return text;
    }
  }
  return '';
}
export async function createDraft(gmail: any, email: any, replyBody: string) {
  const raw = makeRaw(email.from, `Re: ${email.subject}`, replyBody);
  await gmail.users.drafts.create({
    userId: 'me',
    requestBody: { message: { raw } },
  });
}

export async function applyLabel(gmail: any, emailId: string, labelName: string) {
  const labelsRes = await gmail.users.labels.list({ userId: 'me' });
  const labels = labelsRes.data.labels || [];
  let label = labels.find((l: any) => l.name.toLowerCase() === labelName.toLowerCase());

  if (!label) {
    const created = await gmail.users.labels.create({
      userId: 'me',
      requestBody: { name: labelName },
    });
    label = created.data;
  }

  await gmail.users.messages.modify({
    userId: 'me',
    id: emailId,
    requestBody: { addLabelIds: [label.id], removeLabelIds: ['UNREAD'] },
  });
}

function makeRaw(to: string, subject: string, body: string): string {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ].join('\n');
  return Buffer.from(message).toString('base64url');
}