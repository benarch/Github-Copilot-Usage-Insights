# Team Usage Report - Standalone Application

## Architecture Overview

The Team Usage Report feature has been implemented as a **standalone, separate application** that runs independently from the main Copilot Usage Extended Insights dashboard.

### Why a Separate Application?

1. **Security Isolation**: Password-protected access per team without modifying the main app
2. **Independent Deployment**: Can be deployed separately with different security requirements
3. **Zero Impact on Main App**: No changes to existing dashboard functionality
4. **Flexible Access Control**: Teams can have their own secure access without affecting other users

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     GitHub Copilot Insights                    │
│                          Main Application                       │
│                        (Port 3000/3001)                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Dashboard   │  │  API Server  │  │   Database   │        │
│  │    (React)   │  │  (Express)   │  │   (SQLite)   │        │
│  │  Port 3000   │  │  Port 3001   │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│          │                 ▲                   ▲               │
│          └─────────────────┴───────────────────┘               │
└────────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP API Calls
                             │ (Proxied via Vite)
                             ▼
┌────────────────────────────────────────────────────────────────┐
│               Team Usage Report Application                     │
│                    (Port 3002)                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │              Login Page (Password Auth)           │         │
│  │  - Team selection dropdown                        │         │
│  │  - Password input with show/hide toggle          │         │
│  │  - Demo credentials display                       │         │
│  │  - Dark/Light theme toggle                        │         │
│  └──────────────────────────────────────────────────┘         │
│                           │                                     │
│                           │ On successful authentication        │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────┐         │
│  │          Report Page (Team-Specific Data)        │         │
│  │  - Team summary dashboard (8 metrics)            │         │
│  │  - Individual member statistics table            │         │
│  │  - Export options (CSV, PDF, Print)              │         │
│  │  - Search and sort functionality                 │         │
│  │  - Date range selector (7/14/28 days)           │         │
│  │  - Logout button                                  │         │
│  └──────────────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

## Applications

### Main Application (Unchanged)
- **Location**: `/web`, `/api`
- **Ports**: 3000 (web), 3001 (API)
- **Purpose**: Main dashboard with all features
- **Access**: No password required
- **Status**: ✅ No modifications made

### Team Report Application (New)
- **Location**: `/team-report-app`
- **Port**: 3002
- **Purpose**: Password-protected team-specific reports
- **Access**: Requires team password
- **Status**: ✅ Newly created

## Getting Started

### Installation

```bash
# Install all dependencies (main app + team report app)
npm run install:all
```

### Running the Applications

#### Option 1: Run All Applications (Recommended for Testing)

```bash
# Terminal 1: Start main application
npm run dev

# Terminal 2: Start team report application
npm run dev:team-report
```

Or use the combined command:

```bash
npm run dev:all
```

#### Option 2: Run Applications Separately

```bash
# Main application only
npm run dev

# Team report application only (requires main app to be running)
cd team-report-app
npm run dev
```

### Accessing the Applications

- **Main Dashboard**: http://localhost:3000
- **Team Report App**: http://localhost:3002
- **API Server**: http://localhost:3001

## Features

### Team Report Application

#### 1. Login Page (Password Protected)

**Features:**
- Team selection dropdown (populated from main app API)
- Password input with show/hide toggle
- Error handling for invalid credentials
- Dark/light theme toggle
- Demo credentials display for testing

**Demo Credentials:**
| Team | Password |
|------|----------|
| Acme Corp/Engineering | eng2024 |
| Acme Corp/Product | prod2024 |
| Acme Corp/Design | design2024 |

#### 2. Report Page (After Login)

**Team Summary Dashboard** (8 Metrics):
- Total Team Members (with trend indicator)
- Copilot Seats (count and percentage)
- Active Users (last N days)
- Average Acceptance Rate
- Total Suggestions (gradient purple card)
- Total Acceptances (gradient green card)
- Avg Acceptances Per User (gradient blue card)

**Individual Member Statistics Table:**
- Username (sortable)
- Copilot Seat (visual indicator ✓/✗)
- Suggestions (sortable)
- Acceptances (sortable)
- Acceptance Rate % (sortable, color-coded badges)
- Active Days (sortable)

**Additional Features:**
- Search members by username
- Sort by any column
- Export to CSV
- Export to PDF (via print)
- Print functionality
- Date range selector (7/14/28 days)
- Dark/light theme toggle
- Logout button

## Data Flow

```
1. User opens Team Report App (http://localhost:3002)
   ↓
2. Login Page loads and fetches team list from main app API
   ↓
3. User selects team and enters password
   ↓
4. Password is verified client-side (demo mode)
   ↓
5. On success, Report Page loads
   ↓
6. Report Page fetches:
   - Usage data from /api/usage/user-details
   - Team members from /api/teams
   ↓
7. Data is filtered for selected team members only
   ↓
8. Statistics are calculated and displayed
   ↓
9. User can export data or logout
```

## Security Considerations

### Current Implementation (Demo)

The current implementation includes:
- ✅ Password-protected access
- ✅ Team-specific data filtering
- ✅ Separate application (isolation)
- ⚠️ Client-side password verification (demo only)
- ⚠️ Hardcoded passwords in code (demo only)

### Production Recommendations

For production deployment:

1. **Backend Authentication**
   - Move password verification to backend
   - Use hashed passwords (bcrypt, argon2)
   - Implement JWT or session-based auth
   - Add HTTPS/TLS encryption

2. **API Security**
   - Add authentication to main app API
   - Implement rate limiting
   - Use CORS properly
   - Validate all inputs

3. **Password Management**
   - Store passwords securely in database
   - Implement password reset flow
   - Add password complexity requirements
   - Enable 2FA (two-factor authentication)

4. **Access Control**
   - Implement role-based access control (RBAC)
   - Add audit logging
   - Session timeout
   - Concurrent session management

## Testing

### Manual Testing Checklist

#### Main Application
- [ ] Start main app on port 3000
- [ ] Verify API on port 3001
- [ ] Check dashboard loads correctly
- [ ] Confirm no new features in main app

#### Team Report Application
- [ ] Start team report app on port 3002
- [ ] Login page loads
- [ ] Team dropdown populated
- [ ] Password authentication works
- [ ] Invalid password shows error
- [ ] Report page displays after login
- [ ] Team metrics are correct
- [ ] Member table shows team members only
- [ ] Search functionality works
- [ ] Sort functionality works
- [ ] CSV export downloads
- [ ] PDF export (print) works
- [ ] Date range selector works
- [ ] Theme toggle works
- [ ] Logout returns to login page

### Automated Testing

Add Playwright tests in `team-report-app`:

```bash
cd team-report-app
npm test
```

## Deployment

### Development

```bash
npm run install:all
npm run db:seed
npm run dev:all
```

### Production

1. **Build both applications:**
   ```bash
   npm run build:web
   npm run build:team-report
   ```

2. **Deploy separately:**
   - Main app: Deploy to your primary domain
   - Team report app: Deploy to a subdomain or different port

3. **Configure environment:**
   - Set API URLs
   - Configure HTTPS
   - Set up authentication backend
   - Configure CORS

### Docker (Future)

Create separate Docker containers:
- `copilot-insights-main`: Main application
- `copilot-insights-team-report`: Team report app

## Troubleshooting

### Team Report App Won't Start

**Solution:** Ensure main application is running first
```bash
# Terminal 1
npm run dev

# Terminal 2
cd team-report-app
npm run dev
```

### "Failed to fetch teams"

**Solution:** Check main app API is accessible
- Verify http://localhost:3001/api/teams returns data
- Check proxy configuration in vite.config.ts

### "No member data available"

**Solution:** Import team data in main application
1. Go to http://localhost:3000
2. Navigate to Teams tab
3. Import team CSV/JSON file

### Port 3002 Already in Use

**Solution:** Change port or kill existing process
```bash
# Kill process on port 3002
lsof -ti:3002 | xargs kill -9

# Or change port in team-report-app/vite.config.ts
```

## File Structure

```
Github-Copilot-Usage-Extended-Insights/
├── api/                          # Backend API (unchanged)
├── web/                          # Main dashboard (unchanged)
├── team-report-app/              # NEW: Standalone team report app
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.tsx    # Password-protected login
│   │   │   └── ReportPage.tsx   # Team usage report display
│   │   ├── App.tsx               # Main app logic
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── public/                   # Static assets
│   ├── index.html                # HTML template
│   ├── package.json              # Dependencies
│   ├── vite.config.ts            # Vite config (port 3002)
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── postcss.config.js         # PostCSS config
│   └── README.md                 # Team report app docs
├── package.json                  # Root package (updated scripts)
└── TEAM_REPORT_ARCHITECTURE.md   # This file
```

## Changes Made

### Files Modified
- ✅ `package.json`: Added scripts for team-report-app
- ✅ `web/src/App.tsx`: Reverted to original (removed integrated page)
- ✅ `web/src/components/Sidebar.tsx`: Reverted to original
- ❌ `web/src/pages/TeamUsageReportPage.tsx`: Removed (was integrated page)

### Files Created
- ✅ `team-report-app/`: Complete standalone application
- ✅ `team-report-app/src/components/LoginPage.tsx`: Login with password
- ✅ `team-report-app/src/components/ReportPage.tsx`: Team usage report
- ✅ `team-report-app/README.md`: Team report app documentation
- ✅ `TEAM_REPORT_ARCHITECTURE.md`: This architecture document

### Main Application
- ✅ **NO CHANGES** to existing functionality
- ✅ **NO NEW ROUTES** in main app
- ✅ **NO MODIFICATIONS** to API (except normal usage)
- ✅ **ZERO IMPACT** on current users

## Benefits of This Architecture

1. **Security Isolation**: Password protection without affecting main app
2. **Independent Scaling**: Scale team report app separately if needed
3. **Flexible Deployment**: Deploy to different servers/domains
4. **Clean Separation**: No code coupling between apps
5. **Easy Maintenance**: Update either app independently
6. **Zero Risk**: Main app functionality unchanged

## Future Enhancements

1. **Backend Authentication**: Move password logic to server
2. **User Management**: Admin panel for managing team passwords
3. **Advanced Security**: 2FA, SSO integration, audit logs
4. **Multiple Deployment Options**: Docker, Kubernetes, serverless
5. **Enhanced Reports**: PDF templates, scheduled reports, email delivery
6. **Mobile App**: React Native version for mobile access

## Support

For issues or questions:
1. Check `team-report-app/README.md` for team report app details
2. Check main README.md for main application
3. Review this architecture document
4. Open an issue on GitHub repository

## License

Same as the main Copilot Usage Extended Insights project.
