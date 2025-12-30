# Golden Nodes

A modern workflow automation platform and n8n clone built with Next.js, featuring visual workflow design, AI-powered automation, and subscription-based premium features.

## 🚀 Vision

Golden Nodes is a next-generation workflow automation tool that combines the power of visual workflow design with AI intelligence. Create, automate, and optimize your business processes with an intuitive drag-and-drop interface.

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 16** - React framework with App Router for optimal performance
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development

### UI & Design
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Smooth animations and transitions
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation

### Backend & API
- **tRPC** - End-to-end type-safe APIs
- **Prisma** - Modern database toolkit with PostgreSQL
- **Better Auth** - Authentication and session management
- **Inngest** - Background job processing and workflow orchestration

### AI & Automation
- **Google AI SDK** - AI-powered workflow suggestions and optimizations
- **AI SDK** - Framework for AI integration

### Database & Storage
- **PostgreSQL** - Primary database
- **Prisma Client** - Type-safe database access

### Subscription & Payments
- **Polar** - Subscription management and payment processing

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting (80-char line limit)
- **VS Code** - Recommended IDE with custom settings

## 🌟 Key Features

### Workflow Automation
- **Visual Workflow Designer** - Drag-and-drop node-based editor
- **100+ Integrations** - Connect popular services and APIs
- **Conditional Logic** - Smart branching and decision-making
- **Scheduled Execution** - Time-based and event triggers
- **Error Handling** - Robust error recovery and retry logic

### AI-Powered Features
- **Workflow Suggestions** - AI recommends optimal automation patterns
- **Natural Language Processing** - Create workflows from descriptions
- **Smart Debugging** - AI identifies and fixes workflow issues
- **Performance Optimization** - Automatic workflow efficiency improvements

### Enterprise Features
- **Team Collaboration** - Shared workflows and permissions
- **Audit Logs** - Complete workflow execution history
- **Custom Nodes** - Build and share custom integrations
- **API Access** - Programmatic workflow management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database     │
│                 │    │                 │    │                 │
│ • Next.js 16    │◄──►│ • tRPC API      │◄──►│ • PostgreSQL    │
│ • React 19      │    │ • Better Auth   │    │ • Prisma ORM   │
│ • Tailwind CSS  │    │ • Inngest       │    │                 │
│ • Radix UI      │    │ • AI Services   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │  Background     │    │   External      │
│                 │    │   Processing    │    │   Services      │
│ • Workflow      │    │                 │    │                 │
│   Designer      │    │ • Inngest       │    │ • Polar         │
│ • Node Editor   │    │ • Job Queue     │    │ • Google AI     │
│ • Dashboard     │    │ • Webhooks      │    │ • 100+ APIs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Polar account (for subscriptions)
- Google AI API key

### Installation

1. **Clone and setup**
   ```bash
   git clone https://github.com/kholodihor/golden-nodes.git
   cd golden-nodes
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure essential variables:
   ```env
   DATABASE_URL="postgresql://..."
   AUTH_SECRET="your-secret-key"
   POLAR_ACCESS_TOKEN="your-polar-access-token"
   GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"
   ```

3. **Database setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start development**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Main dashboard
│   ├── workflows/        # Workflow management
│   ├── integrations/     # Service connections
│   └── api/             # API routes
├── components/            # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── workflow/        # Workflow-specific components
│   └── integrations/   # Integration UI
├── lib/                  # Core libraries
│   ├── auth/            # Authentication logic
│   ├── polar/           # Subscription management
│   └── ai/              # AI services
├── trpc/                 # tRPC procedures
│   ├── routers/         # API routers
│   └── procedures/      # Individual procedures
├── hooks/               # Custom React hooks
├── inngest/             # Background jobs
└── utils/               # Helper functions
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run inngest      # Start Inngest dev server
npm run dev:all      # Start all dev services
```

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js + TypeScript rules
- **Prettier**: 80-character line limit
- **Husky**: Pre-commit hooks

### Database Operations
```bash
npx prisma generate    # Generate client
npx prisma migrate dev # Run migrations
npx prisma studio      # Visual database browser
```

## 🔐 Authentication & Security

- **Better Auth**: Modern authentication solution
- **OAuth Providers**: Google, GitHub, email/password
- **Session Management**: Secure token-based sessions
- **RBAC**: Role-based access control
- **API Security**: Rate limiting and input validation

## 💳 Subscription Model

### Free Tier
- Up to 5 active workflows
- 100 executions per month
- Basic integrations
- Community support

### Premium Tier
- Unlimited workflows
- 10,000 executions per month
- All integrations
- AI-powered features
- Priority support
- Custom nodes

## 🤖 AI Integration

### Workflow Intelligence
- **Smart Suggestions**: AI recommends optimal node configurations
- **Natural Language**: Create workflows from text descriptions
- **Error Detection**: Proactive issue identification and resolution
- **Performance Optimization**: Automatic workflow efficiency improvements

### AI Models
- **Google Gemini**: Advanced reasoning and analysis
- **Custom Models**: Specialized automation intelligence

## 🚀 Deployment

### Production Setup
1. **Environment Variables**: Configure all production secrets
2. **Database**: Set up managed PostgreSQL
3. **Background Jobs**: Configure Inngest infrastructure
4. **Monitoring**: Set up logging and error tracking

### Recommended Platforms
- **Vercel**: Frontend and API hosting
- **Railway/PlanetScale**: PostgreSQL database
- **Inngest Cloud**: Background job processing
- **Polar**: Subscription management

## 🎯 Roadmap

### Phase 1: Core Platform
- [x] Basic workflow designer
- [x] Authentication system
- [x] Subscription management
- [ ] 50+ core integrations

### Phase 2: AI Features
- [ ] Natural language workflow creation
- [ ] Smart debugging assistant
- [ ] Performance optimization
- [ ] Predictive analytics

### Phase 3: Enterprise
- [ ] Team collaboration
- [ ] Advanced permissions
- [ ] Custom branding
- [ ] On-premise deployment

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Ensure code quality standards
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.goldennodes.com](https://docs.goldennodes.com)
- **Issues**: [GitHub Issues](https://github.com/kholodihor/golden-nodes/issues)
- **Discord**: [Community Server](https://discord.gg/goldennodes)
- **Email**: support@goldennodes.com

---

**Golden Nodes** - Build automation, intelligently. 🚀