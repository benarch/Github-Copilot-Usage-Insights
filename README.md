# Copilot Usage Insights Dashboard

A full-stack application for visualizing GitHub Copilot usage analytics, built with React, TypeScript, Express, and SQLite.

## Tech Stack

### Frontend
- React 18+
- TypeScript
- Tailwind CSS
- Vite
- Recharts (for charts)
- TanStack Query (for data fetching)

### Backend
- Express.js
- TypeScript
- SQLite (better-sqlite3)
- OpenAPI/Swagger documentation

### DevOps
- Docker & Docker Compose

## Project Structure

```
├── api/                    # Backend API
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # Database & types
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Database seeding
│   │   └── index.ts        # Entry point
│   └── Dockerfile
├── web/                    # Frontend React app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # API client
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript types
│   └── Dockerfile
├── docker-compose.yml
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install:all

# Seed the database with sample data
npm run db:seed

# Start development servers
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api-docs

### Docker

```bash
# Build and run with Docker
npm run docker:build
npm run docker:up

# Stop containers
npm run docker:down
```

## Features

- **Dashboard Overview**: View IDE active users, agent adoption rates, and most used chat models
- **Interactive Charts**: 
  - Daily/Weekly active users (area charts with tooltips)
  - Average chat requests per user
  - Requests by chat mode (stacked bar chart)
- **Timeframe Filter**: Switch between 7, 14, and 28 day views
- **Code Generation Stats**: View suggestion counts and acceptance rates
- **Responsive Design**: Works on desktop and tablet

## Related Tools

### GitHub Users, Teams & Organizations Exporter
**[github-users-teams-export](https://github.com/benarch/github-users-teams-export)**

A companion tool that exports GitHub users, teams, and organizations data. Use this to:
- Import users into the **Teams** tab for team-level analytics
- Add extended visibility on users, team membership, and nested team/organization membership
- Map Copilot usage data to organizational structure

### GitHub Copilot Usage Anonymizer
**[github-copilot-usage-anonymizer](https://github.com/benarch/github-copilot-usage-anonymizer)**

A data anonymization tool used to generate the demo data in this project. It:
- Anonymizes Copilot usage data by replacing real user names with generated names
- Preserves data structure and relationships while protecting privacy
- Enables safe sharing and demonstration of Copilot analytics without exposing actual user identities

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/usage/summary` | Dashboard summary stats |
| `GET /api/usage/daily-active-users` | Daily active users data |
| `GET /api/usage/weekly-active-users` | Weekly active users data |
| `GET /api/usage/avg-chat-requests` | Average chat requests per user |
| `GET /api/usage/chat-mode-requests` | Requests by chat mode |
| `GET /api/usage/code-generation` | Code generation statistics |

All endpoints accept a `timeframe` query parameter: `7`, `14`, or `28` (days).
