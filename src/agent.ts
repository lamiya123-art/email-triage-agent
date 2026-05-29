import 'dotenv/config';
import Groq from 'groq-sdk';
import { createDraft, applyLabel } from './gmail';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function triageEmail(gmail: any, email: any) {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are an email triage assistant. Be concise.
          Respond ONLY with a JSON object, no markdown, no explanation.
          Format: { "action": "draft_reply" or "classify_and_label", "email_id": "...", "priority": "urgent|normal|low|spam", "label": "...", "summary": "...", "reply_body": "..." }
          Rules: anything from a real person asking a question gets draft_reply. Newsletters, receipts, notifications get classify_and_label.`,
      },
      {
        role: 'user',
        content: `Triage this email:

From: ${email.from}
Subject: ${email.subject}
Date: ${email.date}

${email.body.slice(0, 2000)}`,
      },
    ],
  });

  const text = response.choices[0].message.content || '';

  try {
    const decision = JSON.parse(text.replace(/```json|```/g, '').trim());
    decision.email_id = email.id;
    if (decision.action === 'draft_reply') {
      await createDraft(gmail, email, decision.reply_body);
      return { ...decision, action: 'drafted' };
    } else {
      await applyLabel(gmail, email.id, decision.label);
      return { ...decision, action: 'labelled' };
    }
  } catch (e: any) {
    console.error('Error:', e?.message || e);
    console.error('Raw response:', text);
    return null;
  }
}