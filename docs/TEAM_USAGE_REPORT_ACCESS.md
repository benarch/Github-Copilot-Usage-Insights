# Team Usage Report Page - Access Guide

## Overview
The Team Usage Report Download Page is a powerful new feature that enables downloading team-specific Copilot usage reports with advanced analytics and export capabilities.

## Accessing the Team Usage Report Page

### Via Navigation
1. **Start the Application**
   ```bash
   # Install dependencies
   npm run install:all
   
   # Seed the database with sample data
   npm run db:seed
   
   # Start development servers
   npm run dev
   ```
   
   The application will be available at:
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

2. **Navigate to the Page**
   - Open your browser to http://localhost:3000
   - Click on **"Table view"** in the main navigation
   - In the left sidebar under "Reports", click on **"Team Usage Report"**
   
   Direct URL: http://localhost:3000/reports/team-usage

### Via Docker
```bash
# Build and start containers
docker compose up -d --build

# Access the application
# Web Dashboard: http://localhost:3010
# Navigate to Table view → Team Usage Report
```

## Prerequisites

### 1. Import Team Data
Before using the Team Usage Report, you need to import team/organization data:

1. Navigate to the **Teams** tab
2. Click the **Import** button
3. Upload a CSV/JSON file with team and user data

**Expected Format:**
- CSV with columns: `id`, `login`, `name`, `teams` (comma-separated team names)
- JSON array with objects containing: `id`, `login`, `name`, `teams` (array of team names)

You can use the [github-users-teams-export](https://github.com/benarch/github-users-teams-export) tool to generate this data.

### 2. Import Copilot Usage Data
Import GitHub Copilot usage data:

1. Navigate to the **Insights** tab
2. Click the upload button
3. Upload JSON/NDJSON file from GitHub's Copilot usage dashboard

**Where to get this data:**
- Go to your GitHub organization's Copilot usage page
- Click the **Export** button to download usage data
- Upload the downloaded file

## Features

### Team Selection
- **Multi-team selection**: Select one or more teams to analyze
- **Search/filter**: Quickly find teams using the search box
- **Select All/Clear**: Bulk selection controls

### Team Summary Dashboard
The dashboard displays aggregated metrics:
- **Total Team Members**: Count across selected teams
- **Members with Copilot Seats**: Number and percentage of members with active seats
- **Active Users**: Members who used Copilot in the selected time period
- **Average Acceptance Rate**: Overall acceptance rate across all team members
- **Total Suggestions**: Code suggestions generated
- **Total Acceptances**: Suggestions accepted by developers
- **Avg Acceptances Per User**: Average acceptances per active user

### Individual Member Statistics Table
Interactive table with the following columns:
- **Username**: Team member name
- **Copilot Seat**: Visual indicator (✓ for active seat)
- **Suggestions**: Number of code suggestions received
- **Acceptances**: Number of accepted suggestions
- **Acceptance Rate %**: Color-coded acceptance percentage (Green: ≥70%, Yellow: 40-70%, Red: <40%)
- **Active Days**: Days with Copilot activity

**Table Features:**
- **Sortable columns**: Click column headers to sort
- **Search**: Filter members by username
- **Color-coded performance**: Visual indicators for acceptance rates

### Date Range Selector
Choose from predefined time periods:
- Last 7 days
- Last 14 days
- Last 28 days

The current date range is displayed below the selector.

### Export Capabilities
Multiple export formats available:
- **CSV**: Spreadsheet-compatible format
- **Excel**: Same as CSV (for compatibility)
- **PDF**: Via print functionality
- **Print**: Browser print dialog for customized printing

### UI/UX Features
- **Modern card-based layout**: Clean, organized dashboard
- **Trend indicators**: Visual arrows showing performance trends
- **Dark/light theme support**: Toggle in the header
- **Responsive design**: Works on all screen sizes
- **Animated transitions**: Smooth interactions
- **Color-coded metrics**: Visual performance indicators

## Usage Examples

### Scenario 1: Generate Report for Engineering Team
1. Navigate to Team Usage Report page
2. Click "All Teams" dropdown
3. Search for "Engineering"
4. Select the Engineering team(s)
5. Choose time period (e.g., Last 7 days)
6. Review summary metrics
7. Export as CSV for sharing with management

### Scenario 2: Compare Multiple Teams
1. Click "All Teams" dropdown
2. Select multiple teams (e.g., Frontend, Backend, DevOps)
3. View aggregated metrics across all teams
4. Scroll to Individual Member Statistics to see combined list
5. Sort by Acceptance Rate to identify top performers
6. Export report for team leads

### Scenario 3: Identify License Optimization Opportunities
1. Select all teams or specific departments
2. Review "Members with Copilot Seats" percentage
3. Check "Active Users" count
4. In the member table, sort by "Suggestions" (low to high)
5. Identify users with seats but low/no usage
6. Export data for license reallocation decisions

## Testing

### Manual Testing
1. Navigate to the page and verify all UI elements load
2. Test team selection and search
3. Try different date ranges
4. Test table sorting by clicking headers
5. Search for specific members
6. Test export functionality
7. Toggle dark/light mode
8. Test on different screen sizes

### Automated Testing with Playwright
Run the comprehensive test suite:

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install chromium

# Run tests
npx playwright test tests/team-usage-report.spec.ts
```

The test suite covers:
- Page title and description
- Team summary dashboard cards
- Individual member statistics table
- Team selection dropdown
- Date range selector
- Export menu options
- Search functionality
- Table sorting
- Dark mode support
- Additional stats row

## Troubleshooting

### No Data Displayed
**Problem**: Page shows "No member data available"

**Solution**:
1. Ensure team/organization data is imported via Teams tab
2. Verify Copilot usage data is imported via Insights tab
3. Check that selected teams match the imported data
4. Ensure team names in both imports are consistent (case-sensitive)

### Teams Not Showing in Selector
**Problem**: Team dropdown is empty

**Solution**:
1. Import team data first (Teams tab → Import button)
2. Refresh the page
3. Verify the imported file format is correct

### Export Not Working
**Problem**: Export buttons don't download files

**Solution**:
1. Check browser permissions for downloads
2. Ensure there is data to export (at least one team selected with data)
3. Try a different export format
4. Check browser console for errors

### Performance Issues
**Problem**: Page loads slowly with large datasets

**Solution**:
1. Select fewer teams at once
2. Use shorter time periods (7 days instead of 28)
3. Clear browser cache
4. Ensure adequate system resources

## API Endpoints Used

The page interacts with the following API endpoints:
- `GET /api/usage/user-details?timeframe={days}` - Fetches usage data
- Team and user data is managed through the ImportDataContext

## Browser Compatibility

Tested and supported browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Considerations

- All data remains local to your deployment
- No data is sent to external services
- Export files contain sensitive user information - handle accordingly
- Implement appropriate access controls at the deployment level

## Future Enhancements

Potential future additions:
- Scheduled report generation
- Email delivery of reports
- Advanced filtering (by acceptance rate, activity level)
- Trend comparisons (week-over-week, month-over-month)
- Custom date range selection
- More visualization types (charts, graphs)
- Team comparison view side-by-side

## Support

For issues or questions:
1. Check the main README.md for general setup instructions
2. Review this guide for feature-specific information
3. Open an issue on the GitHub repository
4. Check existing issues for similar problems

## Additional Resources

- [Main Project README](../README.md)
- [GitHub Users Teams Export Tool](https://github.com/benarch/github-users-teams-export)
- [GitHub Copilot Usage Anonymizer](https://github.com/benarch/github-copilot-usage-anonymizer)
