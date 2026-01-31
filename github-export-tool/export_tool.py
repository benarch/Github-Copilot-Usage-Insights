#!/usr/bin/env python3
"""
GitHub Organization Export Tool

Export users, teams, team memberships, and organization relationships
from GitHub organizations in JSON or CSV format.
"""

import argparse
import sys
import os
import logging
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from github_client import GitHubClient
from exporters import Exporter
from utils import (
    setup_logging,
    get_github_token,
    validate_org_name,
    validate_api_url,
    print_banner,
    print_summary,
    print_exported_files
)

logger = logging.getLogger(__name__)


def parse_arguments():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Export GitHub organization data (users, teams, memberships)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Export organization data in JSON format
  python export_tool.py --org my-org --format json

  # Export organization data in CSV format
  python export_tool.py --org my-org --format csv

  # Use custom output directory
  python export_tool.py --org my-org --output ./my-exports

  # Use GitHub Enterprise Server
  python export_tool.py --org my-org --api-url https://github.company.com/api/v3

  # Use token from environment variable
  export GITHUB_TOKEN=ghp_xxxxx
  python export_tool.py --org my-org

Required GitHub Token Permissions:
  - read:org (Read organization membership)
  - read:user (Read user profile data)
  - admin:org (For full team data) or read:org (For basic team data)
        """
    )
    
    parser.add_argument(
        "--org",
        required=True,
        help="GitHub organization name"
    )
    
    parser.add_argument(
        "--format",
        choices=["json", "csv", "both"],
        default="json",
        help="Export format (default: json)"
    )
    
    parser.add_argument(
        "--output",
        default="./exports",
        help="Output directory for exports (default: ./exports)"
    )
    
    parser.add_argument(
        "--api-url",
        default="https://api.github.com",
        help="GitHub API URL (for GitHub Enterprise, default: https://api.github.com)"
    )
    
    parser.add_argument(
        "--token",
        help="GitHub personal access token (alternatively use GITHUB_TOKEN env var)"
    )
    
    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        default="INFO",
        help="Logging level (default: INFO)"
    )
    
    parser.add_argument(
        "--log-file",
        help="Optional log file path"
    )
    
    parser.add_argument(
        "--no-banner",
        action="store_true",
        help="Suppress banner output"
    )
    
    return parser.parse_args()


def main():
    """Main entry point."""
    args = parse_arguments()
    
    # Setup logging
    setup_logging(args.log_level, args.log_file)
    
    # Print banner
    if not args.no_banner:
        print_banner()
    
    try:
        # Validate inputs
        if not validate_org_name(args.org):
            logger.error(f"Invalid organization name: {args.org}")
            sys.exit(1)
        
        if not validate_api_url(args.api_url):
            logger.error(f"Invalid API URL: {args.api_url}")
            sys.exit(1)
        
        # Get GitHub token
        token = args.token if args.token else get_github_token()
        
        if not token:
            logger.error("GitHub token is required")
            sys.exit(1)
        
        # Initialize GitHub client
        logger.info(f"Connecting to GitHub API: {args.api_url}")
        client = GitHubClient(token, args.api_url)
        
        # Validate token
        print("\n🔐 Validating GitHub token...")
        if not client.validate_token():
            logger.error("GitHub token validation failed")
            logger.error("Please check your token and permissions")
            sys.exit(1)
        print("✓ Token validated successfully")
        
        # Check rate limit
        rate_limit = client.get_rate_limit()
        print(f"📊 Rate limit: {rate_limit['core']['remaining']}/{rate_limit['core']['limit']} remaining")
        
        # Export data
        print(f"\n📥 Exporting data from organization: {args.org}")
        print("This may take a few minutes for large organizations...")
        
        data = client.get_full_export_data(args.org)
        
        if not data:
            logger.error(f"Failed to export data from organization: {args.org}")
            sys.exit(1)
        
        # Print summary
        print_summary(data)
        
        # Export to file(s)
        exporter = Exporter(args.output)
        exported_files = []
        
        print(f"\n💾 Exporting to {args.format.upper()} format...")
        
        if args.format in ["json", "both"]:
            filepath = exporter.export(data, args.org, "json")
            exported_files.append(filepath)
            print(f"✓ JSON export completed")
        
        if args.format in ["csv", "both"]:
            filepaths = exporter.export(data, args.org, "csv")
            exported_files.extend(filepaths)
            print(f"✓ CSV export completed")
        
        # Print exported files
        print_exported_files(exported_files)
        
        # Check final rate limit
        final_rate_limit = client.get_rate_limit()
        print(f"\n📊 Final rate limit: {final_rate_limit['core']['remaining']}/{final_rate_limit['core']['limit']} remaining")
        
        print("\n✅ Export completed successfully!")
        
        # Close client
        client.close()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Export interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Export failed: {e}", exc_info=True)
        print(f"\n❌ Export failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
