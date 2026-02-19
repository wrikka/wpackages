# AI Chat Application

AI-powered chat application built with Nuxt 4, featuring multi-agent support, RAG (Retrieval Augmented Generation), and knowledge base management.

## Features

- **Multi-Agent Chat**: Create and manage AI agents with custom system prompts
- **Knowledge Bases**: Upload and manage documents for RAG-powered conversations
- **Organization Management**: Multi-tenant support with team collaboration
- **GitHub OAuth Authentication**: Secure authentication via GitHub
- **Real-time Streaming**: SSE-based streaming for AI responses
- **Code Execution**: Support for code execution in conversations
- **Rich UI**: Built with Nuxt UI and UnoCSS for a modern interface

## Tech Stack

- **Framework**: Nuxt 4
- **Language**: TypeScript
- **Database**: Turso (LibSQL) with Drizzle ORM
- **Authentication**: Lucia with GitHub OAuth
- **AI**: OpenAI API
- **Styling**: UnoCSS + Nuxt UI
- **State Management**: Pinia
- **Testing**: Vitest

## Prerequisites

- Node.js 18+
- Bun (package manager)
- Turso account (for database)
- GitHub OAuth App credentials
- OpenAI API key

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd wai

# Install dependencies
bun install

# Copy environment variables
cp apps/aichat/.env.example apps/aichat/.env

# Edit .env with your credentials
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Turso Database Configuration
TURSO_DATABASE_URL=your_turso_database_url_here
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Public API Base URL
NUXT_PUBLIC_API_BASE=/api
```

### Setting up Turso Database

1. Create a Turso account at [https://turso.tech](https://turso.tech)
2. Create a new database
3. Get your database URL and auth token
4. Set them in your `.env` file

### Setting up GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set the callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env` file

### Setting up OpenAI API

1. Get your API key from [https://platform.openai.com](https://platform.openai.com)
2. Set it in your `.env` file

## Database Setup

```bash
# Generate migrations from schema
bun --cwd apps/aichat run db:generate

# Push schema to database (for development)
bun --cwd apps/aichat run db:push

# Run migrations (for production)
bun --cwd apps/aichat run db:migrate
```

## Development

```bash
# Start development server
bun --cwd apps/aichat run dev

# Run tests
bun --cwd apps/aichat run test

# Type check
bun --cwd apps/aichat run lint

# Format code
bun --cwd apps/aichat run format
```

## Project Structure

```
apps/aichat/
├── app/                    # Client-side code
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables
│   ├── layouts/            # Nuxt layouts
│   ├── pages/              # Nuxt pages
│   ├── plugins/            # Nuxt plugins
│   ├── stores/             # Pinia stores
│   └── utils/              # Client utilities
├── server/                 # Server-side code
│   ├── api/                # API routes
│   ├── composables/        # Server composables
│   ├── db/                 # Database schema and client
│   ├── middleware/         # Server middleware
│   ├── services/           # Business logic
│   └── utils/              # Server utilities
├── shared/                 # Shared types and utilities
├── modules/                # Nuxt modules
└── test/                   # Test files
```

## Database Schema

The application uses the following main entities:

- `users` - User accounts
- `organizations` - Organizations for multi-tenancy
- `organization_members` - Organization memberships
- `agents` - AI agents with custom prompts
- `chat_sessions` - Chat conversations
- `messages` - Chat messages
- `knowledge_bases` - Document collections
- `knowledge_base_files` - Uploaded documents
- `file_chunks` - Document chunks for RAG
- `attachments` - File attachments
- `folders` - Chat session organization

## API Endpoints

### Authentication

- `GET /api/user` - Get current user
- `POST /api/login` - Login with GitHub
- `POST /api/logout` - Logout

### Chat

- `POST /api/chat` - Send message and stream response

### Browser Extension

- `POST /api/extension/chat` - Receive a message from the browser extension, persist it to the database, and return a non-streaming assistant response.

If `AICHAT_EXTENSION_TOKEN` is configured, requests must include:

```http
x-extension-token: <token>
```

### Organizations

- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/[id]` - Get organization
- `PUT /api/organizations/[id]` - Update organization
- `DELETE /api/organizations/[id]` - Delete organization

### Agents

- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `GET /api/agents/[id]` - Get agent
- `PUT /api/agents/[id]` - Update agent
- `DELETE /api/agents/[id]` - Delete agent

### Knowledge Bases

- `GET /api/knowledge-bases` - List knowledge bases
- `POST /api/knowledge-bases` - Create knowledge base
- `GET /api/knowledge-bases/[id]` - Get knowledge base
- `PUT /api/knowledge-bases/[id]` - Update knowledge base
- `DELETE /api/knowledge-bases/[id]` - Delete knowledge base

## Testing

```bash
# Run all tests
bun --cwd apps/aichat run test

# Run tests in watch mode
bun --cwd apps/aichat run test -- --watch

# Run tests with coverage
bun --cwd apps/aichat run test -- --coverage
```

## Building for Production

```bash
# Build the application
bun --cwd apps/aichat run build

# Preview production build
bun --cwd apps/aichat run preview
```

## Deployment

### Environment Variables for Production

Make sure to set all required environment variables in your production environment:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `OPENAI_API_KEY`

### Deployment Platforms

This application can be deployed to:

- Vercel
- Netlify
- Cloudflare Pages
- Any Node.js hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
