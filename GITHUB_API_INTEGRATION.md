# GitHub Copilot Metrics API Integration

This document provides detailed information about the GitHub Copilot Metrics API integration feature.

## Overview

The GitHub Copilot Metrics API integration allows you to automatically fetch usage data directly from GitHub's API instead of manually exporting and importing files.

## Features

- ✅ Direct API integration with GitHub Copilot Metrics API
- ✅ Automatic data synchronization (on-demand)
- ✅ Organization-level metrics support
- ✅ Personal Access Token (PAT) and GitHub App authentication
- ✅ Rate limit monitoring
- ✅ Error handling with detailed messages
- ✅ REST API endpoints for sync operations
- ✅ Configuration status checking

## Prerequisites

1. **GitHub Enterprise Cloud** account with Copilot enabled
2. **Organization admin access** to view Copilot metrics
3. **Personal Access Token** or **GitHub App** with appropriate permissions

## Setup Instructions

### Step 1: Generate GitHub Access Token

#### Option A: Personal Access Token (PAT)

1. Go to [GitHub Settings > Personal Access Tokens > Fine-grained tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Configure the token:
   - **Token name**: Copilot Usage Dashboard
   - **Expiration**: Choose appropriate expiration (e.g., 90 days)
   - **Resource owner**: Select your organization
   - **Repository access**: Not required (leave as "Public Repositories (read-only)")
   - **Organization permissions**:
     - **Copilot**: Read access
     - Or: **Administration**: Read access (for organization_copilot_seat_management)
4. Click "Generate token" and copy the token immediately

#### Option B: GitHub App

1. Create a GitHub App in your organization settings
2. Grant the following permissions:
   - **Organization permissions**:
     - `organization_copilot_seat_management`: Read
3. Install the app in your organization
4. Generate a private key or installation token

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   GITHUB_TOKEN=your_github_personal_access_token_here
   GITHUB_ORG=your_organization_name_here
   ```

3. Restart the application to load the new configuration:
   ```bash
   npm run dev
   ```

### Step 3: Test the Connection

Test your GitHub API connection:

```bash
curl http://localhost:3001/api/usage/github/test-connection
```

Expected response on success:
```json
{
  "success": true,
  "message": "Successfully connected to GitHub API",
  "rateLimit": {
    "limit": 5000,
    "remaining": 4999,
    "reset": 1234567890,
    "used": 1
  }
}
```

### Step 4: Sync Data

Trigger a data sync from the GitHub API:

```bash
curl -X POST http://localhost:3001/api/usage/github/sync \
  -H "Content-Type: application/json" \
  -d '{}'
```

With optional parameters:
```bash
curl -X POST http://localhost:3001/api/usage/github/sync \
  -H "Content-Type: application/json" \
  -d '{
    "since": "2024-01-01",
    "until": "2024-01-31",
    "clearExisting": false
  }'
```

## API Endpoints

### GET /api/usage/github/status

Get the current GitHub API sync configuration status.

**Response:**
```json
{
  "configured": true,
  "lastSyncDate": "2024-01-31",
  "organization": "your-org-name"
}
```

### GET /api/usage/github/test-connection

Test the GitHub API connection and authentication.

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to GitHub API",
  "rateLimit": {
    "limit": 5000,
    "remaining": 4999,
    "reset": 1234567890,
    "used": 1
  }
}
```

### POST /api/usage/github/sync

Sync data from GitHub Copilot Metrics API.

**Request Body:**
```json
{
  "since": "2024-01-01",      // Optional: Start date (ISO 8601)
  "until": "2024-01-31",      // Optional: End date (ISO 8601)
  "clearExisting": false      // Optional: Clear existing data before sync
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully synced 28 days of metrics (28 records).",
  "recordsSynced": 28
}
```

## Rate Limits

GitHub API has the following rate limits:

- **Authenticated requests**: 5,000 requests per hour
- **Secondary rate limits**: 60 requests per minute for some endpoints

The Copilot Metrics API returns up to 28 days of data per request, so fetching a full year of data requires approximately 13 requests.

### Monitoring Rate Limits

Check your current rate limit status:

```bash
curl http://localhost:3001/api/usage/github/test-connection
```

## Troubleshooting

### Error: "GitHub API not configured"

**Cause**: Missing or invalid environment variables.

**Solution**: 
1. Ensure `.env` file exists with `GITHUB_TOKEN` and `GITHUB_ORG`
2. Restart the application after updating `.env`

### Error: "Failed to connect to GitHub API"

**Cause**: Invalid token or organization name.

**Solution**:
1. Verify your token has not expired
2. Check that the organization name is correct (case-sensitive)
3. Ensure the token has the required permissions

### Error: "403 Forbidden"

**Cause**: Token lacks required permissions or organization doesn't have Copilot.

**Solution**:
1. Regenerate token with `copilot` or `organization_copilot_seat_management` permission
2. Verify your organization has GitHub Copilot enabled

### Error: "Rate limit exceeded"

**Cause**: Too many API requests in a short period.

**Solution**:
1. Wait until the rate limit resets (check `rateLimit.reset` timestamp)
2. Reduce sync frequency
3. Use `since` parameter to fetch only new data

## Data Format

The GitHub API returns aggregated metrics, which differ slightly from the per-user export format:

### GitHub API Format
- Aggregated daily metrics for the entire organization
- Breakdown by language and editor
- Total counts rather than per-user details

### Database Storage
- Stored as synthetic "aggregate" user records
- Compatible with existing dashboard views
- Includes daily usage summaries

## Security Considerations

1. **Token Storage**: Never commit `.env` files to version control
2. **Token Permissions**: Use minimum required permissions (read-only)
3. **Token Rotation**: Regularly rotate access tokens
4. **Token Expiration**: Set appropriate expiration dates on tokens
5. **Access Control**: Restrict who can trigger sync operations in production

## Testing

Run the E2E tests to validate the integration:

```bash
npm run test:e2e
```

All tests should pass:
- ✅ API status endpoint
- ✅ Connection testing
- ✅ Sync functionality
- ✅ Error handling
- ✅ Documentation validation

## Benefits vs Manual Import

### Benefits of API Integration
- ✅ Real-time or near real-time data access
- ✅ Automated data refresh capability
- ✅ Eliminates manual export/import process
- ✅ Always up-to-date metrics
- ✅ Supports incremental updates
- ✅ No file handling required
- ✅ Scheduled sync capability (future enhancement)

### Disadvantages of API Integration
- ❌ Requires GitHub API token with appropriate permissions
- ❌ Subject to GitHub API rate limits
- ❌ Needs network connectivity to GitHub
- ❌ Additional security considerations for token storage
- ❌ Only works with GitHub Enterprise Cloud
- ❌ Returns aggregated data instead of per-user details

### When to Use Each Method

**Use API Integration when:**
- You need real-time or frequently updated data
- You want automated synchronization
- You have GitHub Enterprise Cloud
- You can securely manage API tokens

**Use Manual Import when:**
- You don't have API access
- You need per-user detailed metrics
- You prefer offline operation
- You have security concerns about API tokens

## Future Enhancements

Potential improvements for future versions:

1. **Scheduled Sync**: Automatic sync on a schedule (hourly, daily)
2. **Webhook Support**: Real-time updates via GitHub webhooks
3. **Per-User Metrics**: Fetch detailed per-seat usage data
4. **Multiple Organizations**: Support syncing from multiple orgs
5. **Sync History**: Track sync operations and changes
6. **Dashboard UI**: Web interface for triggering syncs
7. **Incremental Sync**: Only fetch new data since last sync

## References

- [GitHub Copilot Usage Metrics API Documentation](https://docs.github.com/en/rest/copilot/copilot-usage)
- [GitHub REST API Authentication](https://docs.github.com/en/rest/overview/authenticating-to-the-rest-api)
- [Fine-grained Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [GitHub API Status](https://www.githubstatus.com/)
3. Open an issue on the repository
