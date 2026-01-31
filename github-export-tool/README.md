# GitHub Organization Export Tool

A Python-based command-line tool to export GitHub organization data including users, teams, team memberships, and organizational relationships. Supports both JSON and CSV export formats.

## Features

- 🏢 **Export Organization Data**: Users, teams, and team memberships
- 🌳 **Team Hierarchies**: Shows parent-child team relationships
- 📊 **Multiple Formats**: Export in JSON (hierarchical) or CSV (flat) formats
- 🔐 **Secure Authentication**: Token-based authentication with secure input prompts
- 📈 **Progress Tracking**: Real-time progress indicators for large exports
- ⚡ **Rate Limit Handling**: Automatic rate limit detection and handling
- 🔍 **Detailed Logging**: Comprehensive logging with configurable levels
- 🌐 **GitHub Enterprise Support**: Works with GitHub.com and GitHub Enterprise Server

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- A GitHub Personal Access Token

### Setup

1. **Clone or navigate to this directory**:
   ```bash
   cd github-export-tool
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Make the script executable** (optional, Unix/Linux/macOS):
   ```bash
   chmod +x export_tool.py
   ```

## GitHub Token Setup

You'll need a GitHub Personal Access Token (PAT) with appropriate permissions.

### Creating a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Organization Export Tool")
4. Select the following scopes:

#### Required Scopes

| Scope | Purpose |
|-------|---------|
| `read:org` | Read organization membership, teams, and team memberships |
| `read:user` | Read user profile data |

#### Optional Scopes

| Scope | Purpose |
|-------|---------|
| `admin:org` | Required for detailed team data (if not available, `read:org` provides basic info) |

5. Click "Generate token" and **copy the token immediately** (you won't see it again)

### Using the Token

There are two ways to provide your token:

#### Option 1: Environment Variable (Recommended)
```bash
export GITHUB_TOKEN=ghp_your_token_here
```

#### Option 2: Command-line Argument
```bash
python export_tool.py --org my-org --token ghp_your_token_here
```

#### Option 3: Interactive Prompt
If you don't provide a token via environment variable or command-line, the tool will securely prompt you for it.

## Usage

### Basic Usage

Export organization data in JSON format:
```bash
python export_tool.py --org my-organization
```

### Export in CSV Format

Export data as CSV files (one per entity type):
```bash
python export_tool.py --org my-organization --format csv
```

### Export Both Formats

Export data in both JSON and CSV formats:
```bash
python export_tool.py --org my-organization --format both
```

### Custom Output Directory

Specify a custom output directory:
```bash
python export_tool.py --org my-organization --output ./my-exports
```

### GitHub Enterprise Server

Use with GitHub Enterprise Server:
```bash
python export_tool.py \
  --org my-organization \
  --api-url https://github.company.com/api/v3
```

### Advanced Options

Full command with all options:
```bash
python export_tool.py \
  --org my-organization \
  --format both \
  --output ./exports \
  --api-url https://api.github.com \
  --log-level DEBUG \
  --log-file export.log
```

## Command-Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--org` | GitHub organization name (required) | - |
| `--format` | Export format: `json`, `csv`, or `both` | `json` |
| `--output` | Output directory for exports | `./exports` |
| `--api-url` | GitHub API URL (for GitHub Enterprise) | `https://api.github.com` |
| `--token` | GitHub personal access token | (prompts or uses env var) |
| `--log-level` | Logging level: DEBUG, INFO, WARNING, ERROR, CRITICAL | `INFO` |
| `--log-file` | Optional log file path | - |
| `--no-banner` | Suppress banner output | `false` |

## Output Formats

### JSON Format

The JSON export creates a single file with hierarchical data:

```json
{
  "organization": {
    "id": 12345,
    "login": "my-org",
    "name": "My Organization",
    "description": "Organization description",
    "email": "contact@example.com",
    "location": "San Francisco, CA",
    "created_at": "2020-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "members": [
    {
      "id": 67890,
      "login": "john-doe",
      "name": "John Doe",
      "email": "john@example.com",
      "type": "User",
      "company": "My Company",
      "location": "New York, NY",
      "created_at": "2019-01-01T00:00:00Z"
    }
  ],
  "teams": [
    {
      "id": 11111,
      "name": "Engineering",
      "slug": "engineering",
      "description": "Engineering team",
      "privacy": "closed",
      "permission": "push",
      "parent_id": null,
      "parent_name": null,
      "members_count": 15,
      "repos_count": 30
    },
    {
      "id": 22222,
      "name": "Frontend",
      "slug": "frontend",
      "description": "Frontend team",
      "privacy": "closed",
      "permission": "push",
      "parent_id": 11111,
      "parent_name": "Engineering",
      "members_count": 8,
      "repos_count": 10
    }
  ],
  "team_memberships": [
    {
      "team_id": 11111,
      "team_name": "Engineering",
      "user_id": 67890,
      "user_login": "john-doe",
      "user_name": "John Doe",
      "role": "member"
    }
  ],
  "team_hierarchy": {
    "root_teams": [
      {
        "id": 11111,
        "name": "Engineering",
        "children": [
          {
            "id": 22222,
            "name": "Frontend",
            "children": []
          }
        ]
      }
    ]
  },
  "statistics": {
    "total_members": 50,
    "total_teams": 10,
    "total_memberships": 75
  }
}
```

**Filename**: `{org_name}_export_{timestamp}.json`

### CSV Format

The CSV export creates separate files for each entity type:

#### 1. Organization Info
**Filename**: `{org_name}_organization_{timestamp}.csv`

| id | login | name | description | email | location | created_at | updated_at |
|----|-------|------|-------------|-------|----------|------------|------------|
| 12345 | my-org | My Organization | Org description | contact@example.com | San Francisco, CA | 2020-01-01T00:00:00Z | 2024-01-01T00:00:00Z |

#### 2. Members
**Filename**: `{org_name}_members_{timestamp}.csv`

| id | login | name | email | type | site_admin | company | location | bio | created_at | updated_at |
|----|-------|------|-------|------|------------|---------|----------|-----|------------|------------|
| 67890 | john-doe | John Doe | john@example.com | User | false | My Company | New York, NY | Bio text | 2019-01-01T00:00:00Z | 2024-01-01T00:00:00Z |

#### 3. Teams
**Filename**: `{org_name}_teams_{timestamp}.csv`

| id | name | slug | description | privacy | permission | parent_id | parent_name | members_count | repos_count | created_at | updated_at |
|----|------|------|-------------|---------|------------|-----------|-------------|---------------|-------------|------------|------------|
| 11111 | Engineering | engineering | Engineering team | closed | push | null | null | 15 | 30 | 2020-01-01T00:00:00Z | 2024-01-01T00:00:00Z |
| 22222 | Frontend | frontend | Frontend team | closed | push | 11111 | Engineering | 8 | 10 | 2021-01-01T00:00:00Z | 2024-01-01T00:00:00Z |

#### 4. Team Memberships
**Filename**: `{org_name}_team_memberships_{timestamp}.csv`

| team_id | team_name | user_id | user_login | user_name | role |
|---------|-----------|---------|------------|-----------|------|
| 11111 | Engineering | 67890 | john-doe | John Doe | member |

## Error Handling

The tool handles various error scenarios:

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid or expired token | Generate a new token with correct permissions |
| `403 Forbidden` | Insufficient permissions | Add required scopes to your token |
| `404 Not Found` | Organization doesn't exist or no access | Check organization name and token permissions |
| `Rate limit exceeded` | Too many API requests | Tool will wait automatically, or try again later |

### Troubleshooting

1. **Verify your token has correct permissions**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Click on your token to view its scopes
   - Ensure `read:org` and `read:user` are selected

2. **Check organization access**:
   - Ensure you're a member of the organization
   - Verify the organization name is correct

3. **Enable debug logging**:
   ```bash
   python export_tool.py --org my-org --log-level DEBUG --log-file debug.log
   ```

## Rate Limits

GitHub API has rate limits:
- **Authenticated requests**: 5,000 requests per hour
- **GraphQL API**: 5,000 points per hour

The tool:
- Monitors rate limits automatically
- Waits when approaching limits
- Shows remaining requests in output

For large organizations, consider:
- Exporting during off-peak hours
- Using a token with higher rate limits (GitHub Apps)

## Examples

See the `examples/` directory for sample output files:
- `sample_export.json` - Sample JSON export
- `sample_members.csv` - Sample members CSV
- `sample_teams.csv` - Sample teams CSV
- `sample_memberships.csv` - Sample team memberships CSV

## Project Structure

```
github-export-tool/
├── README.md                  # This file
├── requirements.txt           # Python dependencies
├── export_tool.py            # Main entry point
├── src/                      # Source code modules
│   ├── github_client.py      # GitHub API client
│   ├── exporters.py          # JSON/CSV export logic
│   └── utils.py              # Helper functions
└── examples/                 # Sample output files
    ├── sample_export.json
    ├── sample_members.csv
    ├── sample_teams.csv
    └── sample_memberships.csv
```

## Security Considerations

- **Never commit tokens to version control**
- Use environment variables or secure prompts for tokens
- Rotate tokens regularly
- Use tokens with minimal required permissions
- Consider using GitHub Apps for production use

## Contributing

Contributions are welcome! Areas for improvement:
- GraphQL API support for better performance
- Additional export formats (YAML, XML)
- Filtering options (specific teams, date ranges)
- Repository data export
- Member role information
- Audit log export

## License

This tool is provided as-is for use with GitHub organizations. Ensure you have appropriate permissions before exporting organization data.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review GitHub API documentation: https://docs.github.com/en/rest
3. Enable debug logging for detailed error information

## Version History

- **v1.0.0** - Initial release
  - User export
  - Team export
  - Team membership export
  - Organization info export
  - JSON and CSV formats
  - Rate limit handling
  - Progress indicators
