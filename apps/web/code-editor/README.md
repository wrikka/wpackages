# Dev Workspace Dashboard

A modern Nuxt 4 dashboard application built with Drizzle ORM and UnoCSS for database management and real-time workspace monitoring.

## Features

- **Dashboard Overview**: Real-time statistics and activity monitoring
- **Code Editor**: Built-in code editor with file management
- **File Explorer**: Advanced file system navigation and management
- **Terminal**: Integrated terminal with socket.io communication
- **Database Integration**: Drizzle ORM with SQLite
- **Modern UI**: Built with UnoCSS and custom design system
- **TypeScript**: Full type safety throughout
- **Modular Architecture**: Clean separation of concerns

## Tech Stack

- **Framework**: Nuxt 4
- **Database**: SQLite with Drizzle ORM
- **Styling**: UnoCSS with custom shortcuts
- **Language**: TypeScript
- **Icons**: Heroicons via UnoCSS preset
- **Real-time**: Socket.io for terminal communication

## Architecture

### Project Structure

```
apps/dev-workspace/
├── app/
│   ├── assets/css/          # Global styles
│   ├── components/          # Vue components
│   │   ├── FileExplorer.vue
│   │   ├── MonacoEditor.vue
│   │   └── Terminal.vue
│   ├── composables/         # Vue composables
│   │   ├── useFileExplorer.ts
│   │   ├── useEditor.ts
│   │   └── useTerminal.ts
│   ├── layouts/            # Layout components
│   └── pages/             # Page components
├── server/
│   ├── api/               # API routes
│   │   ├── dashboard/
│   │   ├── files/
│   │   ├── editor/
│   │   └── terminal/
│   ├── db/                # Database schemas
│   └── utils/             # Server utilities
├── shared/                # Shared layer
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
└── public/                # Static assets
```

### Key Patterns

- **Composables**: Business logic extracted into reusable composables
- **Shared Types**: Centralized type definitions
- **API Layer**: Clean separation between client and server
- **Error Handling**: Consistent error handling across the application
- **Type Safety**: Full TypeScript coverage

## Development

### Prerequisites

- Bun or npm
- Node.js 18+

### Installation

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Generate database schema:
   ```bash
   bun run db:generate
   ```

5. Run database migrations:
   ```bash
   bun run db:migrate
   ```

6. Start development server:
   ```bash
   bun run dev
   ```

## Available Scripts

- `dev`: `nuxt dev`
- `build`: `nuxt build`
- `preview`: `nuxt preview`
- `lint`: `nuxt typecheck`
- `db:generate`: `drizzle-kit generate`
- `db:migrate`: `drizzle-kit migrate`
- `db:studio`: `drizzle-kit studio`

## Components

### File Explorer
- Advanced file tree navigation
- Context menu actions
- File creation, deletion, and renaming
- Real-time file system updates

### Code Editor
- Monaco Editor integration
- Syntax highlighting for multiple languages
- Save, run, and format actions
- Keyboard shortcuts support

### Terminal
- Real-time terminal emulation
- Socket.io communication
- Command history and execution
- Resize and clear functionality

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Dashboard statistics and recent activities

### Files
- `GET /api/files` - File system listing
- `POST /api/files` - File operations (create, rename, move)
- `DELETE /api/files/:id` - File deletion

### Editor
- `POST /api/editor/save` - Save file content
- `POST /api/editor/run` - Execute code
- `POST /api/editor/format` - Format code

### Terminal
- `POST /api/terminal` - Execute terminal commands

## Database Schema

The application uses the following main tables:

- **users** - User management
- **projects** - Project tracking
- **activities** - Activity logging
- **analytics** - Analytics data
- **templates** - Code templates
- **workflow_checkpoints** - Workflow state management

## Development Guidelines

### Adding New Features

1. Define types in `shared/types/`
2. Create composables in `app/composables/`
3. Build UI components in `app/components/`
4. Add API endpoints in `server/api/`
5. Update database schema if needed

### Code Style

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use UnoCSS classes and shortcuts
- Leverage composables for shared logic
- Keep components small and focused

### Testing

```bash
# Type checking
bun run lint

# Database operations
bun run db:studio
```

## Environment Variables

- `DATABASE_URL` - Database connection string
- `NUXT_PUBLIC_API_URL` - Public API endpoint

## License

MIT
