#!/bin/bash
# Script to delete old branches from the repository
# This script will delete all branches except 'main' and the current working branch

set -e

echo "================================================================"
echo "Branch Cleanup Script for GitHub-Copilot-Usage-Insights"
echo "================================================================"
echo ""
echo "This script will delete the following branches from the remote repository:"
echo ""

# List of branches to delete
branches_to_delete=(
    "container"
    "copilot/add-ai-chatbot-agent"
    "copilot/add-copilot-seats-view"
    "copilot/add-github-copilot-integration"
    "copilot/add-github-export-tool"
    "copilot/add-team-usage-report-page"
    "copilot/fix-29985769-1145060471-3d22a403-533a-4231-ba2c-189bc9958005"
    "copilot/implement-ndjson-ingestion-pipeline"
    "dependabot/npm_and_yarn/api/npm_and_yarn-aa68fbd092"
    "feature-4"
    "feature-chatbot-agent"
    "feature-code-quality-security"
    "feature-enhancements"
    "feature-visual-refinements"
    "main-1"
    "test-chat-agent-interactions"
    "testing-file-fetch"
)

# Display branches to be deleted
for branch in "${branches_to_delete[@]}"; do
    echo "  - $branch"
done

echo ""
echo "Total branches to delete: ${#branches_to_delete[@]}"
echo ""

# Ask for confirmation
read -p "Are you sure you want to delete these branches? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo "Deleting branches..."
echo ""

# Counter for successful deletions
deleted_count=0
failed_count=0

# Delete each branch
for branch in "${branches_to_delete[@]}"; do
    echo -n "Deleting branch '$branch'... "
    if git push origin --delete "$branch" 2>/dev/null; then
        echo "✓ Success"
        ((deleted_count++))
    else
        echo "✗ Failed (may already be deleted or doesn't exist)"
        ((failed_count++))
    fi
done

echo ""
echo "================================================================"
echo "Cleanup Summary:"
echo "  Successfully deleted: $deleted_count branches"
echo "  Failed/Not found: $failed_count branches"
echo "================================================================"
echo ""
echo "Remaining branches (fetching current state from remote):"
git ls-remote --heads origin | awk '{print $2}' | sed 's|refs/heads/||' | sort
echo ""
