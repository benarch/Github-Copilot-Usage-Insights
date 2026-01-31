"""
Utility functions for the GitHub export tool.
"""

import logging
import sys
import os
from typing import Optional
from getpass import getpass
from tqdm import tqdm


def setup_logging(log_level: str = "INFO", log_file: Optional[str] = None):
    """
    Setup logging configuration.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path
    """
    level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Setup console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    
    # Setup root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    root_logger.addHandler(console_handler)
    
    # Add file handler if specified
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    
    # Reduce noise from urllib3
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("github").setLevel(logging.WARNING)


def get_github_token() -> str:
    """
    Get GitHub token from environment or user input.
    
    Returns:
        GitHub personal access token
    """
    # First, try to get from environment variable
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    
    if token:
        logging.info("Using GitHub token from environment variable")
        return token
    
    # If not in environment, prompt user
    print("\n=== GitHub Authentication ===")
    print("Enter your GitHub Personal Access Token")
    print("(Token will not be displayed)")
    token = getpass("GitHub Token: ")
    
    if not token or not token.strip():
        raise ValueError("GitHub token is required")
    
    return token.strip()


def validate_org_name(org_name: str) -> bool:
    """
    Validate organization name format.
    
    Args:
        org_name: Organization name to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not org_name or not org_name.strip():
        return False
    
    # GitHub org names can contain alphanumeric characters and hyphens
    # and cannot start or end with a hyphen
    if org_name.startswith("-") or org_name.endswith("-"):
        return False
    
    # Check for valid characters
    for char in org_name:
        if not (char.isalnum() or char == "-"):
            return False
    
    return True


def validate_api_url(api_url: str) -> bool:
    """
    Validate GitHub API URL format.
    
    Args:
        api_url: API URL to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not api_url or not api_url.strip():
        return False
    
    # Must start with http:// or https://
    if not (api_url.startswith("http://") or api_url.startswith("https://")):
        return False
    
    return True


def print_banner():
    """Print tool banner."""
    banner = """
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           GitHub Organization Export Tool                 ║
║                                                           ║
║  Export users, teams, and organization relationships      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """
    print(banner)


def print_summary(data: dict):
    """
    Print export summary statistics.
    
    Args:
        data: Export data dictionary
    """
    print("\n" + "=" * 60)
    print("Export Summary")
    print("=" * 60)
    
    if "organization" in data:
        org = data["organization"]
        print(f"Organization: {org.get('name', org.get('login', 'N/A'))}")
    
    if "statistics" in data:
        stats = data["statistics"]
        print(f"\nTotal Members:      {stats.get('total_members', 0):>6}")
        print(f"Total Teams:        {stats.get('total_teams', 0):>6}")
        print(f"Total Memberships:  {stats.get('total_memberships', 0):>6}")
    
    print("=" * 60)


def create_progress_bar(total: int, desc: str = "Processing") -> tqdm:
    """
    Create a progress bar.
    
    Args:
        total: Total number of items
        desc: Description for the progress bar
        
    Returns:
        tqdm progress bar object
    """
    return tqdm(total=total, desc=desc, unit="item", ncols=80)


def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human-readable format.
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        Formatted size string
    """
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"


def print_exported_files(files: list):
    """
    Print information about exported files.
    
    Args:
        files: List of file paths
    """
    print("\n" + "=" * 60)
    print("Exported Files")
    print("=" * 60)
    
    for filepath in files:
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            print(f"✓ {filepath}")
            print(f"  Size: {format_file_size(size)}")
        else:
            print(f"✗ {filepath} (not found)")
    
    print("=" * 60)
