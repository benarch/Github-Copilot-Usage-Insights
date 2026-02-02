# Team Usage Report Application

A standalone, password-protected web application for viewing team-specific Copilot usage reports.

## Overview

This is a **separate application** that runs independently from the main Copilot Usage Extended Insights dashboard. It provides secure, team-specific access to usage reports with password authentication.

### Key Features

- **Password-Protected Access**: Each team has its own password for secure access
- **Standalone Application**: Runs on port 3002 (separate from main app on port 3000)
- **Real-time Data**: Fetches data from the main application's API
- **Team-Specific Reports**: Only shows data for the authenticated team
- **Export Capabilities**: Download reports as CSV or PDF
- **Dark/Light Theme**: Full theme support
- **Responsive Design**: Works on all screen sizes

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│  Main Application   │         │  Team Report App     │
│  (Port 3000/3001)   │◄────────│  (Port 3002)         │
│                     │  API    │                      │
│  - Dashboard        │  Calls  │  - Login Page        │
│  - Data Storage     │         │  - Report Page       │
│  - API Endpoints    │         │  - Password Auth     │
└─────────────────────┘         └──────────────────────┘
```

## Installation

1. **Navigate to the team-report-app directory**:
   ```bash
   cd team-report-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

1. **Start the main application** (required for API access):
   ```bash
   cd ..
   npm run install:all
   npm run db:seed
   npm run dev
   ```

2. **In a new terminal, start the team report app**:
   ```bash
   cd team-report-app
   npm run dev
   ```

3. **Access the application**:
   - Team Report App: http://localhost:3002
   - Main App API: http://localhost:3001 (proxied automatically)

### Production Build

```bash
npm run build
npm run preview
```

## Usage

### Login

1. Navigate to http://localhost:3002
2. Select a team from the dropdown
3. Enter the team password
4. Click "Access Report"

### Demo Credentials

For testing purposes, use these credentials:

| Team | Password |
|------|----------|
| Acme Corp/Engineering | eng2024 |
| Acme Corp/Product | prod2024 |
| Acme Corp/Design | design2024 |

### Viewing Reports

Once logged in, you can:

- View team summary metrics (members, seats, active users, acceptance rates)
- See individual member statistics in a sortable table
- Search for specific members
- Change the time period (7, 14, or 28 days)
- Export data as CSV or PDF
- Print the report

### Logout

Click the "Logout" button in the top-right corner to return to the login page.

## Security Considerations

### Password Storage

⚠️ **Important**: The current implementation stores passwords in the client-side code for demonstration purposes. In a production environment, you should:

1. Store hashed passwords securely on the backend
2. Implement proper authentication with JWT or session tokens
3. Use HTTPS for all communications
4. Add rate limiting to prevent brute force attacks
5. Implement password complexity requirements
6. Add password reset functionality

### API Security

The application connects to the main app's API at `http://localhost:3001`. Ensure:

1. The main API has proper CORS configuration
2. API endpoints have authentication/authorization
3. Sensitive data is not exposed without proper access controls

## Configuration

### Port Configuration

To change the port, edit `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3002, // Change this port
    // ...
  },
})
```

Also update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite --port 3002",
    "preview": "vite preview --port 3002"
  }
}
```

### API Proxy

The app uses Vite's proxy feature to forward `/api` requests to the main application. Configure in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001', // Main app API
      changeOrigin: true,
    }
  }
}
```

## Testing

### Manual Testing

1. Start both applications (main app and team report app)
2. Navigate to http://localhost:3002
3. Test login with different teams
4. Verify data is displayed correctly
5. Test exports (CSV, PDF, Print)
6. Test theme switching
7. Test responsive design at different screen sizes

### Automated Testing

Playwright tests can be added:

```bash
npm test
```

## Deployment

### Docker

Create a `Dockerfile` in the team-report-app directory:

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3002
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables

For different environments, create `.env` files:

```env
# .env.development
VITE_API_URL=http://localhost:3001

# .env.production
VITE_API_URL=https://your-api-domain.com
```

## Troubleshooting

### "Failed to fetch data"

- Ensure the main application is running on port 3001
- Check that the API proxy is configured correctly in vite.config.ts
- Verify CORS settings on the main app

### "Team not found"

- Import team data in the main application first
- Check that team names match exactly (case-sensitive)

### Port Already in Use

- Change the port in vite.config.ts and package.json
- Or stop the process using port 3002:
  ```bash
  lsof -ti:3002 | xargs kill -9
  ```

## Development

### Project Structure

```
team-report-app/
├── src/
│   ├── components/
│   │   ├── LoginPage.tsx       # Password-protected login
│   │   └── ReportPage.tsx      # Main report view
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── public/                      # Static assets
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
└── tailwind.config.js          # Tailwind CSS config
```

### Adding New Features

1. **Add new team**: Update the `TEAMS` array in `LoginPage.tsx`
2. **Change metrics**: Modify calculations in `ReportPage.tsx`
3. **Add export formats**: Add new functions in `ReportPage.tsx`
4. **Customize theme**: Edit `tailwind.config.js`

## License

Same as the main Copilot Usage Extended Insights project.

## Support

For issues or questions:
1. Check this README
2. Review the main project documentation
3. Open an issue on the GitHub repository
