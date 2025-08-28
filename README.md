# El Profesor - AI Education Assistant

A Next.js application that reproduces the "El Profesor" AI education assistant website with streaming capabilities and MCP (Model Context Protocol) server integration.

## Features

- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- **AI-Powered Chat**: Google Generative AI with streaming responses
- **MCP Integration**: Multiple MCP servers for enhanced context:
  - AWS Documentation MCP Server
  - Terraform MCP Server  
  - AWS Diagram MCP Server
- **Responsive Design**: Mobile-friendly interface
- **Real-time Streaming**: Server-sent events for smooth chat experience

## Prerequisites

1. **Node.js** (v20 or higher)
2. **Python** with `uv` and `uvx` installed for MCP servers:
   ```bash
   # Install uv (Python package manager)
   curl -LsSf https://astral.sh/uv/install.sh | sh
   # or with homebrew
   brew install uv
   ```
3. **Google AI API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # For development
   cp .env.local.example .env.dev
   # Edit .env.dev and add your development Google API key
   
   # For production (when deploying)
   cp .env.local.example .env.prod
   # Edit .env.prod and add your production Google API key
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## MCP Server Configuration

The application automatically connects to these MCP servers:

- **AWS Documentation**: `awslabs.aws-documentation-mcp-server@latest`
- **Terraform**: `awslabs.terraform-mcp-server@latest`  
- **AWS Diagrams**: `awslabs.aws-diagram-mcp-server@latest`
- **Microsoft Docs**: `microsoftdocs-mcp@latest`

These servers provide enhanced context for AI responses about AWS, Terraform, and Microsoft technologies.

## Architecture

### Frontend-Backend Separation

```
├── src/                      # Source code
│   ├── app/                  # Next.js App Router
│   │   ├── api/
│   │   │   └── chat/        # API routes (thin controllers)
│   │   ├── chat/            # Chat interface page
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── backend/             # Backend logic (MVC pattern)
│   │   ├── config/
│   │   │   └── env-config.ts # Environment configuration
│   │   ├── controllers/
│   │   │   └── chat-controller.ts # Chat business logic
│   │   └── services/
│   │       ├── ai-service.ts     # Google GenAI integration
│   │       └── mcp-service.ts    # MCP server integration
│   └── frontend/            # Frontend logic
│       ├── hooks/
│       │   └── use-chat.ts  # Chat state management
│       └── services/
│           └── chat-service.ts   # API communication
├── .github/workflows/       # CI/CD workflows
├── .vscode/                 # VS Code settings
└── ...config files
```

### Key Features

- **Proper Streaming**: Uses `@google/genai` with correct streaming implementation
- **MVC Architecture**: Clear separation of concerns
- **Frontend/Backend Split**: Clean architecture with proper abstractions
- **Error Handling**: Comprehensive error handling and user feedback
- **Real-time UI**: Stop generation, loading states, error display

## Key Components

- **Home Page**: Landing page with hero section and feature cards
- **Chat Interface**: Real-time streaming chat with El Profesor
- **MCP Service**: Handles connections to multiple MCP servers
- **Streaming API**: Server-sent events for real-time responses

## Usage

1. Visit the home page to see the El Profesor interface
2. Click "Start Learning Now" to access the chat
3. Ask questions about AWS, Terraform, or programming
4. Get enhanced responses with context from MCP servers

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Code Quality

The project includes comprehensive linting and formatting:

- **ESLint**: TypeScript, React, and Next.js rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Pre-commit hooks**: Automatic linting and formatting

### Development Workflow

1. **Setup**: `npm install`
2. **Development**: `npm run dev`
3. **Before commit**: `npm run lint:fix && npm run format`
4. **Type check**: `npm run type-check`
5. **Build test**: `npm run build`

## License

MIT License
## 
Environment Configuration

The application automatically loads the correct environment file based on `NODE_ENV`:

- **Development** (`npm run dev`): Loads `.env.dev`
- **Production** (`npm run build` / `npm run start`): Loads `.env.prod`
- **Fallback**: Uses `.env.local` if environment-specific file is missing

### Environment Files

- `.env.dev` - Development configuration (not committed to git)
- `.env.prod` - Production configuration (not committed to git)
- `.env.local.example` - Template file with all required variables
- `.env.local` - Local override (not committed to git)

### Security

- All `.env.*` files (except `.env.local.example`) are excluded from git
- Environment variables are validated at startup
- No sensitive data is exposed in the client-side code