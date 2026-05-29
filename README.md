# Email Triage Agent

An autonomous AI agent that connects to Gmail, classifies incoming emails using LLaMA 3.3, and automatically applies labels — reducing inbox noise with zero manual intervention.

## Demo

The agent reads unread emails and applies labels directly in Gmail:

- `newsletter` — promotional and subscription emails
- `real estate notification` — property listings
- `notification` — platform alerts and reminders
- `security notification` — account security emails
- `order confirmation` — purchase receipts

## How It Works

1. **Fetches** unread emails from Gmail via the Gmail API
2. **Classifies** each email using LLaMA 3.3 70B (via Groq) — determines priority, intent, and the appropriate label
3. **Acts** — either applies a Gmail label or saves a draft reply for human review
4. **Logs** a digest of all actions taken each run

## Tech Stack

- **TypeScript / Node.js**
- **Gmail API** — OAuth 2.0 for reading, labelling, and drafting
- **Groq** — LLaMA 3.3 70B for email classification
- **node-cron** — scheduled runs every 30 minutes

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Cloud project with Gmail API enabled
- A [Groq API key](https://console.groq.com) (free)

### 1. Clone the repo

```bash
git clone https://github.com/lamiya123-art/email-triage-agent.git
cd email-triage-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Gmail OAuth

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Enable the Gmail API
- Create an OAuth 2.0 credential (Desktop app)
- Download it as `credentials.json` and place it in the project root
- Add your Gmail as a test user under OAuth consent screen

Then run the auth script to generate `token.json`:

```bash
npx ts-node src/auth.ts
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```
GROQ_API_KEY=your_groq_api_key_here
```

### 5. Run the agent

```bash
npx ts-node src/index.ts
```

## Project Structure

```
src/
├── index.ts      # Entry point and scheduler
├── agent.ts      # AI classification logic (Groq + LLaMA)
├── gmail.ts      # Gmail API client (fetch, label, draft)
├── tools.ts      # Tool definitions
└── auth.ts       # OAuth setup script
```

## Example Output

```
[2026-05-29T04:43:21.934Z] Starting triage run...
Found 20 unread emails
  ✓ Supa Update May 2026 → labelled (low)
  ✓ Security alert → labelled (normal)
  ✓ Your Duolingo streak → labelled (low)
  ...

--- Digest ---
Drafted: 0 | Labelled/archived: 20
```

## Future Improvements

- Web dashboard to review the digest
- Customizable labelling rules via config file
- Slack/Telegram notification of daily digest
- Draft reply approval via email

## License

MIT
