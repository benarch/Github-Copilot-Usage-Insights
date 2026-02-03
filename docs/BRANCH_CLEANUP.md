# Branch Cleanup Documentation

## Overview
This document describes the process for cleaning up old branches in the GitHub-Copilot-Usage-Insights repository.

## Branches Identified for Removal
The following branches have been identified as old/obsolete and should be removed, keeping only the `main` branch:

1. `container`
2. `copilot/add-ai-chatbot-agent`
3. `copilot/add-copilot-seats-view`
4. `copilot/add-github-copilot-integration`
5. `copilot/add-github-export-tool`
6. `copilot/add-team-usage-report-page`
7. `copilot/fix-29985769-1145060471-3d22a403-533a-4231-ba2c-189bc9958005`
8. `copilot/implement-ndjson-ingestion-pipeline`
9. `dependabot/npm_and_yarn/api/npm_and_yarn-aa68fbd092`
10. `feature-4`
11. `feature-chatbot-agent`
12. `feature-code-quality-security`
13. `feature-enhancements`
14. `feature-visual-refinements`
15. `main-1`
16. `test-chat-agent-interactions`
17. `testing-file-fetch`

**Total: 17 branches to be removed**

## Methods for Branch Deletion

### Method 1: Using GitHub Actions Workflow (Recommended)
A GitHub Actions workflow has been created at `.github/workflows/cleanup-old-branches.yml`.

**Steps:**
1. Go to the repository on GitHub
2. Click on the "Actions" tab
3. Select "Cleanup Old Branches" workflow from the left sidebar
4. Click "Run workflow" button
5. Confirm and run

The workflow will automatically delete all the specified branches.

### Method 2: Using the Bash Script
A bash script has been provided at `scripts/delete-old-branches.sh`.

**Steps:**
```bash
# From the repository root
./scripts/delete-old-branches.sh
```

**Note:** This method requires proper Git authentication and push permissions.

### Method 3: Manual Deletion via Git Command Line
If you prefer to delete branches manually:

```bash
# Delete a single branch
git push origin --delete branch-name

# Or delete multiple branches at once
git push origin --delete branch1 branch2 branch3
```

### Method 4: Manual Deletion via GitHub UI
1. Go to the repository on GitHub
2. Click on "branches" (showing the branch count)
3. For each branch to delete:
   - Find the branch in the list
   - Click the trash icon on the right side
   - Confirm deletion

## Verification
After deletion, verify that only the `main` branch remains (plus any active working branches):

```bash
git ls-remote --heads origin
```

Expected output should show only `main` and any active development branches.

## Notes
- The `main` branch is protected and will not be deleted
- Any currently active working branches (like PR branches) are excluded from deletion
- Deleted branches can be restored from the GitHub UI within a short time window if needed
