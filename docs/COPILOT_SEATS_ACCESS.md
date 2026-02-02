# Accessing the Copilot Seats View

This document provides information on how to access and use the new Copilot Seats view in the Summary Report.

## Prerequisites

Before you can view Copilot seat statistics, you need to:

1. **Import Copilot Usage Data**: The seat statistics are calculated from the Copilot usage data that you import into the dashboard.

2. **Have GitHub Copilot Usage Data Access**: You need to be able to export Copilot usage data from your GitHub organization. This typically requires:
   - Organization owner or admin permissions
   - Access to your organization's GitHub Copilot settings page

## Exporting Data from GitHub

To get the data needed for the Copilot Seats view:

1. Navigate to your GitHub organization's Copilot usage page:
   - Go to `https://github.com/organizations/[YOUR-ORG]/settings/copilot/usage`
   - Or from your organization page: Settings → Copilot → Usage

2. Click the **Export** button to download usage data in JSON or NDJSON format

## Importing Data into the Dashboard

1. **Start the Dashboard**: `npm run dev` (Dashboard at http://localhost:3000)
2. **Navigate to the Insights Tab**
3. **Upload Your Data**: Click upload, select JSON/NDJSON file, wait for import

## Accessing the Copilot Seats View

1. Click on **Table View** in the main navigation
2. Select **Summary Report** from the sidebar
3. View the Copilot Seats section at the top showing:
   - **Total Seats**: All allocated Copilot licenses
   - **Active Seats**: Users with activity in selected timeframe
   - **Unused Seats**: Users with no activity in selected timeframe

## Understanding the Metrics

- **Total Seats**: All unique users in your data (constant)
- **Active Seats**: Users with any activity in the timeframe (changes with timeframe)
- **Unused Seats**: Total Seats - Active Seats (optimization opportunities)

## Tips for License Optimization

1. Review Unused Seats monthly
2. Cross-reference with Teams view for utilization by team
3. Consider seasonal patterns
4. Use multiple timeframes for better insights
