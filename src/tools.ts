// src/tools.ts
export const tools = [
  {
    name: 'classify_and_label',
    description: 'Classify an email by priority and apply a Gmail label. Use for emails that need no reply.',
    input_schema: {
      type: 'object',
      properties: {
        email_id: { type: 'string' },
        priority: { type: 'string', enum: ['urgent', 'normal', 'low', 'spam'] },
        label: { type: 'string', description: 'Gmail label to apply, e.g. "newsletters", "bills", "work"' },
        summary: { type: 'string', description: 'One sentence summary of the email' },
      },
      required: ['email_id', 'priority', 'label', 'summary'],
    },
  },
  {
    name: 'draft_reply',
    description: 'Draft a reply to an email and save it to Gmail Drafts for human review.',
    input_schema: {
      type: 'object',
      properties: {
        email_id: { type: 'string' },
        reply_body: { type: 'string', description: 'The full reply text to draft' },
        reasoning: { type: 'string', description: 'Why this reply was drafted' },
      },
      required: ['email_id', 'reply_body', 'reasoning'],
    },
  },
];