# Browser Extensions 🌐

## Introduction

WAI Browser Extensions is an AI-powered browser extension for intelligent web interaction. Built with WXT and Vue 3, it enables users to leverage AI agents directly within their browser to automate tasks, analyze web content, and enhance productivity. The extension provides a seamless integration of AI capabilities into your browsing experience, allowing you to interact with web pages, extract information, and perform complex tasks with natural language commands.

## Features

- 🤖 **AI-Powered Automation**: Automate web tasks using intelligent AI agents
- 🌐 **Cross-Browser Support**: Works with Chrome, Firefox, and other Chromium-based browsers
- 🎨 **Modern UI**: Beautiful interface built with Vue 3 and Radix Vue components
- 📊 **Visual Analytics**: D3.js-powered data visualization for agent insights
- 🔌 **MCP Integration**: Model Context Protocol support for enhanced AI capabilities
- 📝 **Markdown Support**: Render formatted content with marked
- ⚡ **Fast Performance**: Optimized with UnoCSS for minimal bundle size
- 🔍 **Content Analysis**: Analyze and extract information from web pages
- 🎯 **Task Automation**: Execute complex multi-step web workflows
- 📦 **Plugin System**: Extensible architecture for custom plugins

## Goals

- 🎯 Enable AI-powered web automation directly in the browser
- 🤖 Provide intelligent assistance for web-based tasks
- 📊 Visualize agent actions and insights for better understanding
- 🔧 Create extensible platform for browser-based AI agents
- 🌐 Enhance productivity through intelligent web interaction
- 🔍 Enable content analysis and information extraction from web pages
- 🎨 Create beautiful, accessible user interface
- 🔒 Ensure privacy-first with local processing
- 📊 Provide comprehensive observability
- 🌐 Enable cross-browser support

## Design Principles

- 🧩 **Component-Based**: Modular Vue 3 components for maintainability and reusability
- 🎨 **Accessible UI**: Radix Vue components for accessibility and keyboard navigation
- 📦 **Type Safe**: Full TypeScript support throughout the codebase
- 🚀 **Performance First**: UnoCSS for efficient styling and small bundle sizes
- 🔌 **Extensible**: Plugin architecture for adding new capabilities
- 🌐 **Cross-Platform**: Works across multiple browsers with consistent experience
- 🔒 **Privacy First**: Local processing with optional cloud integration

## Installation

<details>
<summary>Development</summary>

Prerequisites:

- Node.js 18+ or Bun 1.0+
- Chrome, Firefox, or another supported browser

Install dependencies at the monorepo root:

```bash
bun install
```

</details>

<details>
<summary>Production</summary>

Install from Chrome Web Store or Firefox Add-ons (when published)

</details>

## Usage

### Development Mode

### Backend Integration (AIChat)

This extension can call the `apps/aichat` server to persist conversations in the database and return AI responses.

#### Required Environment Variables

Set these variables in `apps/browser-extensions/.env` (see `.env.example`):

```env
# URL of the AIChat server
VITE_AICHAT_API_BASE=http://localhost:3000

# Optional: if the AIChat server is configured with AICHAT_EXTENSION_TOKEN
VITE_AICHAT_EXTENSION_TOKEN=your_extension_token_here
```

#### API Endpoint

The extension calls:

```http
POST /api/extension/chat
```

Request body:

```json
{
  "message": "Hello",
  "conversationId": "optional-existing-conversation-id"
}
```

Optional header (if token is configured on the server):

```http
x-extension-token: <token>
```

Response:

```json
{
  "success": true,
  "conversationId": "...",
  "message": {
    "id": "...",
    "role": "assistant",
    "content": "..."
  }
}
```

#### Chrome Development

```bash
# Start Chrome development server
bun --cwd apps/browser-extensions run dev
```

Load the unpacked extension from the `.output` folder:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3` folder

#### Firefox Development

```bash
# Start Firefox development server
bun --cwd apps/browser-extensions run dev:firefox
```

Load the temporary add-on:
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file from the `.output/firefox-mv2` folder

### Production Build

#### Chrome Build

```bash
# Build and package for Chrome
bun --cwd apps/browser-extensions run build
```

#### Firefox Build

```bash
# Build and package for Firefox
bun --cwd apps/browser-extensions run build:firefox
```

### Linting and Testing

```bash
# Type checking
bun --cwd apps/browser-extensions run compile

# Format code
bun --cwd apps/browser-extensions run format

# Run linter
bun --cwd apps/browser-extensions run lint

# Run full verification
bun --cwd apps/browser-extensions run verify
```

## Examples

### Loading in Chrome

```bash
# Step 1: Build the extension
bun --cwd apps/browser-extensions run dev

# Step 2: Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select .output/chrome-mv3 folder
```

### Loading in Firefox

```bash
# Step 1: Build the extension
bun --cwd apps/browser-extensions run dev:firefox

# Step 2: Load in Firefox
# 1. Open about:debugging#/runtime/this-firefox
# 2. Click "Load Temporary Add-on"
# 3. Select any file from .output/firefox-mv2 folder
```

### Using AI Agent

```typescript
// Example: Analyze web page content
const agent = new WebPageAgent();

// Extract key information from current page
const summary = await agent.summarizePage();

// Find specific elements
const elements = await agent.findElements('buttons', 'links');

// Perform actions
await agent.clickElement('#submit-button');
```

## License

This project is licensed under the MIT License.
