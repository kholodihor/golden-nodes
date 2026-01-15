# Golden Nodes

A modern workflow automation platform and n8n clone built with Next.js, featuring visual workflow design, topological execution, and extensible executor registry.

## 🚀 Vision

Golden Nodes is a next-generation workflow automation tool that combines the power of visual workflow design with intelligent execution. Create, automate, and optimize your business processes with an intuitive drag-and-drop interface.

## 🛠️ Technology Stack

- **Next.js 16** + **React 19** + **TypeScript** - Modern frontend framework
- **tRPC** + **Prisma** + **PostgreSQL** - Type-safe backend with database
- **Inngest** - Background job processing and workflow orchestration
- **React Flow** - Visual workflow editor with drag-and-drop nodes
- **Jotai** + **React Query** - Optimized state management
- **Tailwind CSS** + **Radix UI** - Modern UI components
- **Better Auth** - Authentication and session management

## 🌟 Key Features

### Workflow Execution Engine

- **Topological Sorting** - Automatic dependency resolution for complex workflows
- **Executor Registry** - Extensible system for custom node types
- **Real-time Execution** - Live status tracking with cancellation support
- **Error Handling** - Comprehensive error recovery and retry logic
- **HTTP Requests** - Full REST API support with variable substitution
- **Conditional Logic** - Smart branching with expression evaluation

### Built-in Node Types

- **Start Nodes** - Workflow initialization and data injection
- **Action Nodes** - HTTP requests, webhooks, delays, and custom actions
- **Condition Nodes** - Advanced conditional logic with safe expression evaluation
- **Custom Nodes** - Extensible registry for business-specific operations

### Visual Workflow Designer

- **Drag-and-Drop Editor** - Intuitive React Flow-based interface
- **Node Configuration** - Modal-based node setup with JSON schema validation
- **Template Variables** - Dynamic data binding between workflow nodes
- **Real-time Validation** - Immediate feedback on workflow structure and cycles

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database     │
│                 │    │                 │    │                 │
│ • React Flow    │◄──►│ • tRPC API      │◄──►│ • PostgreSQL    │
│ • Executor Reg  │    │ • Inngest       │    │ • Prisma ORM   │
│ • Topological   │    │ • Job Queue     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google AI API key (optional)

### Installation

```bash
git clone https://github.com/kholodihor/golden-nodes.git
cd golden-nodes
npm install
cp .env.example .env
```

Configure environment variables:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="your-secret-key"
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"
```

Database setup:

```bash
npx prisma migrate dev
npx prisma generate
```

Start development:

```bash
npm run dev          # Frontend server
npm run inngest      # Background job processor
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── executors/          # Node executor registry
│   │   ├── start-executor.ts
│   │   ├── action-executor.ts
│   │   ├── condition-executor.ts
│   │   └── index.ts
│   └── executor-registry.ts
├── inngest/               # Background job functions
├── components/
│   ├── editor/            # Workflow editor components
│   └── workflow/          # Execution components
├── trpc/                 # Type-safe API
├── utils/                # Topological sorting utilities
└── types/                # TypeScript definitions
```

## 🔧 Executor Registry

The executor registry provides a clean, extensible system for adding custom node types:

```typescript
export class CustomExecutor extends BaseNodeExecutor {
  type = "CUSTOM" as NodeType;
  name = "Custom Action";
  description = "Performs custom business logic";

  async execute(nodeData: any, inputData: any, context: ExecutionContext) {
    this.log(context, "Executing custom action");
    return { result: "success", ...inputData };
  }
}

executorRegistry.register(new CustomExecutor());
```

### Built-in Executors

- **Start Node** - Initialize workflow execution with metadata
- **Action Node** - HTTP requests, webhooks, delays, and custom actions
- **Condition Node** - Advanced conditional logic with safe expression evaluation

## 🔧 Development

```bash
npm run dev          # Start development server
npm run inngest      # Start Inngest dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## 🎯 Roadmap

### ✅ Phase 1: Core Platform

- [x] Visual workflow designer with React Flow
- [x] Topological sorting for complex workflows
- [x] Executor registry with built-in node types
- [x] Real-time execution tracking
- [x] HTTP requests and conditional logic
- [x] Comprehensive error handling

### 🚧 Phase 2: AI Features

- [ ] Natural language workflow creation
- [ ] Smart debugging assistant
- [ ] Performance optimization

### 📋 Phase 3: Enterprise

- [ ] Team collaboration
- [ ] Advanced permissions
- [ ] Custom branding

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Golden Nodes** - Build automation, intelligently. 🚀
