# LegalAI Assistant

An AI-powered legal assistant that helps people understand complex legal concepts, documents, and situations in clear, simple language. Built with Next.js and the Vercel AI SDK.

## Overview

LegalAI Assistant transforms the Vercel AI Chatbot template into a specialized tool for legal education and understanding. It's designed to:

- **Simplify Legal Jargon**: Translate complex legal terminology into everyday language
- **Explain Documents**: Help users understand contracts, notices, and other legal documents
- **Provide Context**: Explain why legal concepts matter and their real-world implications
- **Suggest Next Steps**: Guide users on what questions to ask qualified attorneys

## ⚠️ Important Disclaimer

**LegalAI Assistant is NOT a lawyer and does NOT provide legal advice.**

This application:
- Provides general legal information for educational purposes only
- Cannot replace professional legal counsel
- Does not create an attorney-client relationship
- Cannot represent users in legal matters
- May not reflect current laws in your jurisdiction

**Always consult a qualified attorney for specific legal advice.**

## Features

### 🎯 Legal-Focused AI Responses
- Custom system prompt engineered for legal explanation
- Clear, structured responses with examples
- Automatic disclaimers on all responses
- Jurisdiction-aware explanations

### 🎨 Professional Legal Branding
- Deep blue and gold color scheme
- Clean, professional interface
- Legal-themed welcome messages
- Curated legal question suggestions

### 📝 Legal-Specific Suggestions
- "Explain this contract clause in simple terms"
- "What are my rights as a tenant?"
- "Help me understand this legal notice"
- "What does 'force majeure' mean in plain English?"

### 🔒 Privacy & Security
- Secure document upload support
- Private chat sessions
- User authentication
- Data encryption

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A database (Postgres recommended)
- API keys for your chosen AI provider (OpenAI, Anthropic, etc.)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd legal-ai-assistant
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your:
- Database connection string
- AI provider API keys
- Authentication secrets

4. Run database migrations:
```bash
pnpm db:migrate
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Required variables in `.env`:

```bash
# Authentication
AUTH_SECRET="your-auth-secret"

# AI Provider - Anthropic Claude (Active)
ANTHROPIC_API_KEY="your-anthropic-key"

# Database
POSTGRES_URL="your-postgres-connection-string"

# Optional: Additional AI Providers
# Uncomment models in lib/ai/providers.ts and add keys:
# OPENAI_API_KEY="your-openai-key"
# OPENROUTER_API_KEY="your-openrouter-key"
# AI_GATEWAY_API_KEY="your-gateway-key" (for XAI Grok models)
```

### Getting API Keys

- **Anthropic (Claude)**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/api-keys (optional)
- **OpenRouter**: https://openrouter.ai/keys (optional, access 100+ models with one key)

## Customization

### Modifying the Legal System Prompt

The core legal assistant behavior is defined in `lib/ai/prompts.ts`. You can customize:

- Response structure and format
- Disclaimer language
- Specialization areas (e.g., focus on contract law, tenant rights, etc.)
- Tone and style

### Changing Suggested Questions

Update `components/suggested-actions.tsx` to modify the sample questions shown to new users.

### Updating Colors and Branding

The legal color theme is defined in `app/globals.css`:
- Primary: Deep blue (`hsl(221 83% 33%)`)
- Accent: Gold (`hsl(43 74% 52%)`)

Modify these values to match your brand.

## Project Structure

```
legal-ai-assistant/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication routes
│   ├── (chat)/              # Chat interface routes
│   ├── layout.tsx           # Root layout (metadata)
│   └── globals.css          # Global styles (color theme)
├── components/              # React components
│   ├── greeting.tsx         # Welcome message
│   ├── suggested-actions.tsx # Sample questions
│   ├── multimodal-input.tsx # Chat input
│   └── ...
├── lib/
│   ├── ai/
│   │   ├── prompts.ts       # System prompts (LEGAL BEHAVIOR)
│   │   └── models.ts        # AI model configuration
│   └── db/                  # Database schemas and queries
└── package.json             # Project metadata
```

## Key Files for Legal Customization

| File | Purpose | Customization |
|------|---------|---------------|
| `lib/ai/prompts.ts` | AI behavior and responses | Core legal assistant instructions |
| `components/greeting.tsx` | Landing page message | Welcome text and disclaimer |
| `components/suggested-actions.tsx` | Sample questions | Example legal queries |
| `app/globals.css` | Visual theme | Colors and styling |
| `app/layout.tsx` | Page metadata | Title and description |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Railway
- Fly.io
- AWS
- Google Cloud Platform

## Legal Considerations

### If You're Deploying This Application:

1. **Add Clear Disclaimers**: Ensure users understand this is not legal advice
2. **Terms of Service**: Create appropriate terms of service
3. **Privacy Policy**: Explain how user data is handled
4. **Jurisdiction Notice**: Specify which jurisdictions' laws you discuss
5. **Professional Review**: Consider having a lawyer review your disclaimers

### Ethical Guidelines:

- Never claim to provide legal advice
- Always direct users to consult qualified attorneys
- Be transparent about AI limitations
- Respect attorney-client privilege (never ask users to share privileged info)
- Consider adding resources for legal aid organizations

## Built With

- [Next.js 15](https://nextjs.org/) - React framework
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI integration
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Postgres](https://www.postgresql.org/) - Database
- [NextAuth.js](https://next-auth.js.org/) - Authentication

## License

[Your chosen license]

## Support

For issues and questions:
- GitHub Issues: [Your repository issues page]
- Documentation: [Your docs URL]

## Acknowledgments

- Based on the [Vercel AI Chatbot Template](https://github.com/vercel/ai-chatbot)
- Built with the Vercel AI SDK

---

**Remember**: This tool is for educational purposes. Always consult a qualified attorney for legal advice specific to your situation.
