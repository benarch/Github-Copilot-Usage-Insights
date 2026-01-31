"""
Export functionality for GitHub data in JSON and CSV formats.
"""

import json
import csv
import logging
from typing import Dict, Any, List
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)


class JSONExporter:
    """Export data in JSON format."""
    
    def __init__(self, output_dir: str = "./exports"):
        """
        Initialize JSON exporter.
        
        Args:
            output_dir: Directory to save export files
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"JSON exporter initialized with output directory: {output_dir}")
    
    def export(self, data: Dict[str, Any], org_name: str) -> str:
        """
        Export data to JSON file.
        
        Args:
            data: Data dictionary to export
            org_name: Organization name (used in filename)
            
        Returns:
            Path to exported file
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{org_name}_export_{timestamp}.json"
        filepath = self.output_dir / filename
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"JSON export completed: {filepath}")
            return str(filepath)
        except Exception as e:
            logger.error(f"Failed to export JSON: {e}")
            raise


class CSVExporter:
    """Export data in CSV format."""
    
    def __init__(self, output_dir: str = "./exports"):
        """
        Initialize CSV exporter.
        
        Args:
            output_dir: Directory to save export files
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"CSV exporter initialized with output directory: {output_dir}")
    
    def export(self, data: Dict[str, Any], org_name: str) -> List[str]:
        """
        Export data to CSV files (separate file for each entity type).
        
        Args:
            data: Data dictionary to export
            org_name: Organization name (used in filename)
            
        Returns:
            List of paths to exported files
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        exported_files = []
        
        # Export members
        if "members" in data and data["members"]:
            filepath = self._export_members(data["members"], org_name, timestamp)
            exported_files.append(filepath)
        
        # Export teams
        if "teams" in data and data["teams"]:
            filepath = self._export_teams(data["teams"], org_name, timestamp)
            exported_files.append(filepath)
        
        # Export team memberships
        if "team_memberships" in data and data["team_memberships"]:
            filepath = self._export_memberships(data["team_memberships"], org_name, timestamp)
            exported_files.append(filepath)
        
        # Export organization info
        if "organization" in data:
            filepath = self._export_organization(data["organization"], org_name, timestamp)
            exported_files.append(filepath)
        
        logger.info(f"CSV export completed: {len(exported_files)} files created")
        return exported_files
    
    def _export_members(self, members: List[Dict[str, Any]], org_name: str, timestamp: str) -> str:
        """Export members to CSV."""
        filename = f"{org_name}_members_{timestamp}.csv"
        filepath = self.output_dir / filename
        
        if not members:
            logger.warning("No members to export")
            return str(filepath)
        
        fieldnames = [
            "id", "login", "name", "email", "type", "site_admin",
            "company", "location", "bio", "created_at", "updated_at"
        ]
        
        try:
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(members)
            
            logger.info(f"Exported {len(members)} members to {filepath}")
            return str(filepath)
        except Exception as e:
            logger.error(f"Failed to export members CSV: {e}")
            raise
    
    def _export_teams(self, teams: List[Dict[str, Any]], org_name: str, timestamp: str) -> str:
        """Export teams to CSV."""
        filename = f"{org_name}_teams_{timestamp}.csv"
        filepath = self.output_dir / filename
        
        if not teams:
            logger.warning("No teams to export")
            return str(filepath)
        
        fieldnames = [
            "id", "name", "slug", "description", "privacy", "permission",
            "parent_id", "parent_name", "members_count", "repos_count",
            "created_at", "updated_at"
        ]
        
        try:
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(teams)
            
            logger.info(f"Exported {len(teams)} teams to {filepath}")
            return str(filepath)
        except Exception as e:
            logger.error(f"Failed to export teams CSV: {e}")
            raise
    
    def _export_memberships(self, memberships: List[Dict[str, Any]], org_name: str, timestamp: str) -> str:
        """Export team memberships to CSV."""
        filename = f"{org_name}_team_memberships_{timestamp}.csv"
        filepath = self.output_dir / filename
        
        if not memberships:
            logger.warning("No team memberships to export")
            return str(filepath)
        
        fieldnames = [
            "team_id", "team_name", "user_id", "user_login", "user_name", "role"
        ]
        
        try:
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(memberships)
            
            logger.info(f"Exported {len(memberships)} team memberships to {filepath}")
            return str(filepath)
        except Exception as e:
            logger.error(f"Failed to export memberships CSV: {e}")
            raise
    
    def _export_organization(self, org_data: Dict[str, Any], org_name: str, timestamp: str) -> str:
        """Export organization info to CSV."""
        filename = f"{org_name}_organization_{timestamp}.csv"
        filepath = self.output_dir / filename
        
        fieldnames = [
            "id", "login", "name", "description", "email", "location",
            "created_at", "updated_at"
        ]
        
        try:
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerow(org_data)
            
            logger.info(f"Exported organization info to {filepath}")
            return str(filepath)
        except Exception as e:
            logger.error(f"Failed to export organization CSV: {e}")
            raise


class Exporter:
    """Main exporter class that handles both JSON and CSV formats."""
    
    def __init__(self, output_dir: str = "./exports"):
        """
        Initialize exporter.
        
        Args:
            output_dir: Directory to save export files
        """
        self.json_exporter = JSONExporter(output_dir)
        self.csv_exporter = CSVExporter(output_dir)
    
    def export(self, data: Dict[str, Any], org_name: str, format: str = "json") -> Any:
        """
        Export data in specified format.
        
        Args:
            data: Data dictionary to export
            org_name: Organization name
            format: Export format ('json' or 'csv')
            
        Returns:
            Path(s) to exported file(s)
        """
        if format.lower() == "json":
            return self.json_exporter.export(data, org_name)
        elif format.lower() == "csv":
            return self.csv_exporter.export(data, org_name)
        else:
            raise ValueError(f"Unsupported export format: {format}")
