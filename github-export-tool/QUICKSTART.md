# Quick Start Guide

Get started with the GitHub Organization Export Tool in 5 minutes!

## Step 1: Install Dependencies

```bash
cd github-export-tool
pip install -r requirements.txt
```

## Step 2: Get Your GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `read:org` and `read:user`
4. Copy the generated token

## Step 3: Export Your Organization Data

### Option A: Using Environment Variable (Recommended)
```bash
export GITHUB_TOKEN=your_token_here
python export_tool.py --org your-organization-name
```

### Option B: Interactive Prompt
```bash
python export_tool.py --org your-organization-name
# You'll be prompted for your token
```

### Option C: Command-line Argument
```bash
python export_tool.py --org your-organization-name --token your_token_here
```

## Common Use Cases

### Export as CSV files
```bash
python export_tool.py --org your-org --format csv
```

### Export in both formats
```bash
python export_tool.py --org your-org --format both
```

### Custom output directory
```bash
python export_tool.py --org your-org --output ./my-exports
```

### GitHub Enterprise Server
```bash
python export_tool.py --org your-org --api-url https://github.company.com/api/v3
```

## Output

The tool will create export files in the `exports/` directory (or your custom output directory):

- **JSON format**: Single file with all data and relationships
- **CSV format**: Multiple files (one per entity type)

## Need Help?

See the full [README.md](README.md) for:
- Detailed documentation
- Troubleshooting guide
- Required token permissions
- Output format examples
