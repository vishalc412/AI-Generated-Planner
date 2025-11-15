# CLAUDE.md - AI Assistant Development Guide

## Project Overview

**AI-Generated-Planner** is an AI-based task planning application designed to help users organize, prioritize, and manage tasks using artificial intelligence.

### Repository Status
- **Current State**: Initial setup phase
- **Branch**: `claude/claude-md-mhzqfakmc9kpiwy5-01A6gLecSUcgp2hwajCxDt3P`
- **Last Updated**: 2025-11-15

---

## Project Vision

This project aims to create an intelligent task planner that leverages AI to:
- Generate task breakdowns from high-level goals
- Prioritize tasks based on context and dependencies
- Suggest optimal scheduling and time allocation
- Learn from user preferences and patterns
- Provide intelligent recommendations for task management

---

## Repository Structure

### Current Structure
```
AI-Generated-Planner/
├── .git/                 # Git repository metadata
├── README.md            # Project description
└── CLAUDE.md           # This file - AI assistant guide
```

### Recommended Future Structure
```
AI-Generated-Planner/
├── .git/
├── .github/
│   └── workflows/       # CI/CD workflows
├── src/                 # Source code
│   ├── api/            # API routes and endpoints
│   ├── components/     # UI components (if web-based)
│   ├── services/       # Business logic and AI integration
│   ├── models/         # Data models and schemas
│   ├── utils/          # Utility functions
│   └── config/         # Configuration files
├── tests/              # Test files
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── e2e/           # End-to-end tests
├── docs/               # Documentation
├── scripts/            # Build and utility scripts
├── public/             # Static assets (if applicable)
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── package.json        # Node.js dependencies (if Node-based)
├── tsconfig.json       # TypeScript configuration (if TS-based)
├── README.md           # Project overview
└── CLAUDE.md          # This file
```

---

## Technology Stack Recommendations

### Backend Options
- **Node.js + Express/Fastify**: Fast, JavaScript-based API server
- **Python + FastAPI**: Excellent for AI/ML integration
- **Go**: High performance, compiled language option

### Frontend Options
- **React + TypeScript**: Modern, type-safe UI development
- **Vue.js**: Progressive framework, easier learning curve
- **Svelte**: Lightweight, compiled framework

### AI/ML Integration
- **OpenAI API**: GPT models for natural language processing
- **Anthropic Claude API**: Advanced reasoning for task planning
- **LangChain**: Framework for LLM application development
- **Local Models**: Ollama, llama.cpp for offline capabilities

### Database
- **PostgreSQL**: Robust relational database with JSON support
- **MongoDB**: Flexible document storage for tasks
- **SQLite**: Lightweight option for single-user deployments
- **Redis**: Caching and session management

---

## Development Workflows

### Git Workflow

#### Branch Naming Convention
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/[feature-name]` - New features
- `fix/[bug-name]` - Bug fixes
- `claude/[session-id]` - AI assistant development branches
- `docs/[doc-name]` - Documentation updates

#### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(planner): add AI-powered task breakdown
fix(api): resolve task priority calculation error
docs(readme): update installation instructions
```

#### Pushing Changes
- Always push to the designated Claude branch
- Use: `git push -u origin claude/[session-id]`
- Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s) on network errors
- Never force push to main/develop without explicit permission

### Code Quality Standards

#### General Principles
1. **Write Clear, Self-Documenting Code**: Use descriptive variable and function names
2. **Follow DRY**: Don't Repeat Yourself - extract common logic
3. **SOLID Principles**: Single responsibility, Open/closed, Liskov substitution, Interface segregation, Dependency inversion
4. **Error Handling**: Always handle errors gracefully with meaningful messages
5. **Security First**: Never commit secrets, validate all inputs, use parameterized queries

#### Code Style
- **Indentation**: 2 spaces (JavaScript/TypeScript) or 4 spaces (Python)
- **Line Length**: Maximum 100 characters
- **Semicolons**: Required in JavaScript/TypeScript
- **Quotes**: Single quotes for JavaScript/TypeScript, double for Python
- **File Naming**: camelCase for JS/TS files, snake_case for Python

#### Security Checklist
- [ ] No hardcoded credentials or API keys
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (escape user content)
- [ ] CSRF protection for state-changing operations
- [ ] Rate limiting on API endpoints
- [ ] Secure password hashing (bcrypt, argon2)
- [ ] HTTPS/TLS for production deployments

### Testing Strategy

#### Test Coverage Goals
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows

#### Test Naming Convention
```javascript
describe('TaskService', () => {
  describe('createTask', () => {
    it('should create a task with valid input', () => {
      // Test implementation
    });

    it('should throw error when title is missing', () => {
      // Test implementation
    });
  });
});
```

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.spec.js
```

---

## AI Assistant Guidelines

### Initial Development Phase

When starting feature development:

1. **Understand Requirements**
   - Read the task description carefully
   - Ask clarifying questions if ambiguous
   - Check existing code for patterns to follow

2. **Create a Plan**
   - Use TodoWrite to outline implementation steps
   - Break down complex tasks into smaller chunks
   - Identify dependencies and order tasks accordingly

3. **Research First**
   - Use Task/Explore to understand existing codebase
   - Search for similar patterns in the code
   - Check for relevant libraries or existing solutions

4. **Implement Incrementally**
   - Start with core functionality
   - Add features iteratively
   - Test as you go

5. **Document Changes**
   - Update relevant documentation
   - Add code comments for complex logic
   - Update CLAUDE.md if workflows change

### Code Implementation Guidelines

#### Before Writing Code
- [ ] Check if similar functionality exists
- [ ] Verify you understand the project structure
- [ ] Plan the implementation approach
- [ ] Consider edge cases and error handling

#### While Writing Code
- [ ] Follow existing code style and patterns
- [ ] Write self-documenting code with clear names
- [ ] Add comments for complex logic only
- [ ] Handle errors appropriately
- [ ] Validate all inputs
- [ ] Consider security implications

#### After Writing Code
- [ ] Review for security vulnerabilities
- [ ] Check for performance issues
- [ ] Add or update tests
- [ ] Update documentation if needed
- [ ] Run linters and formatters
- [ ] Test manually if applicable

### Common Pitfalls to Avoid

1. **Security Issues**
   - Never commit .env files or secrets
   - Always validate and sanitize user input
   - Use parameterized queries for SQL
   - Escape output to prevent XSS
   - Implement proper authentication/authorization

2. **Code Quality**
   - Don't create unnecessary files
   - Avoid over-engineering simple solutions
   - Don't duplicate code - refactor common logic
   - Don't ignore error cases
   - Don't skip tests for critical functionality

3. **Git Practices**
   - Never commit directly to main
   - Don't push to wrong branches
   - Always write meaningful commit messages
   - Don't commit generated files (node_modules, etc.)

### Task Management with TodoWrite

Always use TodoWrite for:
- Multi-step implementations (3+ steps)
- Complex features requiring planning
- Bug fixes affecting multiple files
- Refactoring tasks
- When user provides multiple tasks

Update todos in real-time:
- Mark as `in_progress` when starting
- Mark as `completed` immediately when done
- Add new todos if you discover additional work
- Keep only ONE task in_progress at a time

### File Operations

**Prefer:**
- `Read` tool for reading files (not `cat`)
- `Edit` tool for modifying files (not `sed`/`awk`)
- `Write` tool only for new files
- `Grep` tool for searching content (not `grep` command)
- `Glob` tool for finding files (not `find`/`ls`)

**Always:**
- Read files before editing them
- Edit existing files rather than creating new ones
- Use absolute paths in tool calls
- Preserve exact indentation when editing

### Communication Style

- Be concise and technical
- Avoid unnecessary emojis (unless requested)
- Don't use bash echo for communication
- Output text directly for user messages
- Reference specific code locations: `file_path:line_number`
- Be objective and factual, not overly validating

---

## Project-Specific Conventions

### Task Data Model (Proposed)

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  dependencies: string[]; // Task IDs
  estimatedDuration?: number; // minutes
  actualDuration?: number; // minutes
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  aiGenerated: boolean;
  aiSuggestions?: {
    priority?: string;
    estimatedDuration?: number;
    dependencies?: string[];
    subtasks?: string[];
  };
}
```

### API Endpoints (Proposed)

```
POST   /api/tasks              - Create a new task
GET    /api/tasks              - List all tasks
GET    /api/tasks/:id          - Get task details
PUT    /api/tasks/:id          - Update a task
DELETE /api/tasks/:id          - Delete a task
POST   /api/tasks/generate     - AI-generate task breakdown
POST   /api/tasks/:id/suggest  - Get AI suggestions for a task
GET    /api/tasks/schedule     - Get optimized schedule
```

### Environment Variables

Required environment variables (add to .env):

```bash
# API Keys
OPENAI_API_KEY=your_openai_key
# or
ANTHROPIC_API_KEY=your_anthropic_key

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/planner
# or
MONGODB_URI=mongodb://localhost:27017/planner

# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000

# Optional
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

### AI Integration Patterns

#### Task Generation Example
```javascript
async function generateTaskBreakdown(goal) {
  const prompt = `
    Break down the following goal into specific, actionable tasks:

    Goal: ${goal}

    Provide tasks in JSON format with title, description,
    estimated duration, and priority.
  `;

  const response = await aiService.complete(prompt);
  return parseAIResponse(response);
}
```

#### Task Prioritization Example
```javascript
async function suggestPriority(task, context) {
  const prompt = `
    Given this task and context, suggest appropriate priority:

    Task: ${task.title}
    Description: ${task.description}
    Context: ${JSON.stringify(context)}

    Consider: deadlines, dependencies, importance, urgency.
    Respond with: critical, high, medium, or low
  `;

  return await aiService.complete(prompt);
}
```

---

## Development Checklist

### Setting Up New Feature

- [ ] Create feature branch from develop
- [ ] Use TodoWrite to plan implementation
- [ ] Write failing tests first (TDD approach)
- [ ] Implement feature incrementally
- [ ] Ensure all tests pass
- [ ] Update documentation
- [ ] Commit with conventional commit message
- [ ] Push to feature branch
- [ ] Create pull request to develop

### Pre-Commit Checklist

- [ ] All tests passing
- [ ] No linter errors
- [ ] No console.log or debug statements
- [ ] No commented-out code
- [ ] No TODO comments without issue references
- [ ] No secrets or credentials
- [ ] Documentation updated
- [ ] Commit message follows convention

### Pre-Pull Request Checklist

- [ ] All commits follow naming convention
- [ ] Branch is up to date with develop
- [ ] All tests pass
- [ ] Code coverage meets threshold
- [ ] No merge conflicts
- [ ] Documentation is complete
- [ ] CHANGELOG updated (if applicable)

---

## Resources and References

### Documentation
- Project README: `/README.md`
- This file: `/CLAUDE.md`
- API documentation: `/docs/api.md` (when created)
- Architecture decisions: `/docs/adr/` (when created)

### External Resources
- [Conventional Commits](https://www.conventionalcommits.org/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [REST API Best Practices](https://restfulapi.net/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### AI/ML Resources
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [LangChain Documentation](https://python.langchain.com/)

---

## Maintenance Notes

### Updating This Document

This CLAUDE.md file should be updated when:
- Project structure changes significantly
- New conventions are established
- Technology stack changes
- New workflows are adopted
- Common issues and solutions are identified

### Version History

- **2025-11-15**: Initial version created
  - Established project structure recommendations
  - Defined coding conventions and workflows
  - Set up AI assistant guidelines

---

## Quick Reference

### Most Common Commands

```bash
# Install dependencies
npm install  # or: pip install -r requirements.txt

# Run development server
npm run dev  # or: python app.py

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Git workflow
git checkout -b feature/my-feature
git add .
git commit -m "feat(scope): description"
git push -u origin feature/my-feature
```

### File References

When referencing code, use the format: `path/to/file.js:123`

Example: "The task creation logic is in `src/services/taskService.js:45`"

---

## Support

For questions or issues:
1. Check existing documentation
2. Search closed issues/PRs for similar problems
3. Ask clarifying questions before implementing
4. Document solutions for future reference

---

**Remember**: This is a living document. Keep it updated as the project evolves!
