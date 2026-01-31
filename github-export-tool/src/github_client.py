"""
GitHub API client for exporting organization data.
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from github import Github, GithubException, RateLimitExceededException
from github.Organization import Organization
from github.Team import Team
from github.NamedUser import NamedUser
import time

logger = logging.getLogger(__name__)


class GitHubClient:
    """Client for interacting with GitHub API."""
    
    def __init__(self, token: str, base_url: str = "https://api.github.com"):
        """
        Initialize GitHub client.
        
        Args:
            token: GitHub personal access token
            base_url: GitHub API base URL (for GitHub Enterprise)
        """
        self.token = token
        self.base_url = base_url
        
        # Initialize PyGithub client
        if base_url == "https://api.github.com":
            self.github = Github(token)
        else:
            self.github = Github(base_url=base_url, login_or_token=token)
        
        logger.info(f"Initialized GitHub client with base URL: {base_url}")
    
    def validate_token(self) -> bool:
        """
        Validate the GitHub token by making a test API call.
        
        Returns:
            True if token is valid, False otherwise
        """
        try:
            user = self.github.get_user()
            logger.info(f"Token validated successfully for user: {user.login}")
            return True
        except GithubException as e:
            logger.error(f"Token validation failed: {e}")
            return False
    
    def get_rate_limit(self) -> Dict[str, Any]:
        """
        Get current rate limit information.
        
        Returns:
            Dictionary with rate limit information
        """
        rate_limit = self.github.get_rate_limit()
        return {
            "core": {
                "limit": rate_limit.core.limit,
                "remaining": rate_limit.core.remaining,
                "reset": rate_limit.core.reset.isoformat()
            }
        }
    
    def _handle_rate_limit(self):
        """Handle rate limiting by waiting if necessary."""
        rate_limit = self.github.get_rate_limit()
        if rate_limit.core.remaining < 10:
            reset_time = rate_limit.core.reset
            current_time = datetime.now(reset_time.tzinfo)
            wait_seconds = (reset_time - current_time).total_seconds() + 10
            if wait_seconds > 0:
                logger.warning(f"Rate limit low. Waiting {wait_seconds:.0f} seconds...")
                time.sleep(wait_seconds)
    
    def get_organization(self, org_name: str) -> Optional[Organization]:
        """
        Get organization by name.
        
        Args:
            org_name: Organization name
            
        Returns:
            Organization object or None if not found
        """
        try:
            org = self.github.get_organization(org_name)
            logger.info(f"Retrieved organization: {org_name}")
            return org
        except GithubException as e:
            logger.error(f"Failed to get organization {org_name}: {e}")
            return None
    
    def get_organization_members(self, org_name: str) -> List[Dict[str, Any]]:
        """
        Get all members of an organization.
        
        Args:
            org_name: Organization name
            
        Returns:
            List of member dictionaries
        """
        org = self.get_organization(org_name)
        if not org:
            return []
        
        members = []
        try:
            for member in org.get_members():
                self._handle_rate_limit()
                member_data = {
                    "id": member.id,
                    "login": member.login,
                    "name": member.name,
                    "email": member.email,
                    "type": member.type,
                    "site_admin": member.site_admin,
                    "company": member.company,
                    "location": member.location,
                    "bio": member.bio,
                    "created_at": member.created_at.isoformat() if member.created_at else None,
                    "updated_at": member.updated_at.isoformat() if member.updated_at else None
                }
                members.append(member_data)
                logger.debug(f"Retrieved member: {member.login}")
            
            logger.info(f"Retrieved {len(members)} members from {org_name}")
            return members
        except GithubException as e:
            logger.error(f"Failed to get members: {e}")
            return []
    
    def get_organization_teams(self, org_name: str) -> List[Dict[str, Any]]:
        """
        Get all teams in an organization.
        
        Args:
            org_name: Organization name
            
        Returns:
            List of team dictionaries with hierarchy information
        """
        org = self.get_organization(org_name)
        if not org:
            return []
        
        teams = []
        try:
            for team in org.get_teams():
                self._handle_rate_limit()
                
                # Get parent team info if exists
                parent_id = None
                parent_name = None
                try:
                    parent = team.parent
                    if parent:
                        parent_id = parent.id
                        parent_name = parent.name
                except (AttributeError, GithubException):
                    pass
                
                team_data = {
                    "id": team.id,
                    "name": team.name,
                    "slug": team.slug,
                    "description": team.description,
                    "privacy": team.privacy,
                    "permission": team.permission,
                    "parent_id": parent_id,
                    "parent_name": parent_name,
                    "members_count": team.members_count,
                    "repos_count": team.repos_count,
                    "created_at": team.created_at.isoformat() if team.created_at else None,
                    "updated_at": team.updated_at.isoformat() if team.updated_at else None
                }
                teams.append(team_data)
                logger.debug(f"Retrieved team: {team.name}")
            
            logger.info(f"Retrieved {len(teams)} teams from {org_name}")
            return teams
        except GithubException as e:
            logger.error(f"Failed to get teams: {e}")
            return []
    
    def get_team_memberships(self, org_name: str) -> List[Dict[str, Any]]:
        """
        Get all team memberships (which users belong to which teams).
        
        Args:
            org_name: Organization name
            
        Returns:
            List of membership dictionaries
        """
        org = self.get_organization(org_name)
        if not org:
            return []
        
        memberships = []
        try:
            for team in org.get_teams():
                self._handle_rate_limit()
                team_id = team.id
                team_name = team.name
                
                try:
                    for member in team.get_members():
                        self._handle_rate_limit()
                        membership_data = {
                            "team_id": team_id,
                            "team_name": team_name,
                            "user_id": member.id,
                            "user_login": member.login,
                            "user_name": member.name,
                            "role": "member"  # PyGithub doesn't expose role easily
                        }
                        memberships.append(membership_data)
                        logger.debug(f"Retrieved membership: {member.login} in {team_name}")
                except GithubException as e:
                    logger.warning(f"Failed to get members for team {team_name}: {e}")
            
            logger.info(f"Retrieved {len(memberships)} team memberships from {org_name}")
            return memberships
        except GithubException as e:
            logger.error(f"Failed to get team memberships: {e}")
            return []
    
    def get_full_export_data(self, org_name: str) -> Dict[str, Any]:
        """
        Get complete export data for an organization.
        
        Args:
            org_name: Organization name
            
        Returns:
            Dictionary with all organization data
        """
        logger.info(f"Starting full export for organization: {org_name}")
        
        org = self.get_organization(org_name)
        if not org:
            return {}
        
        # Get basic org info
        org_data = {
            "id": org.id,
            "login": org.login,
            "name": org.name,
            "description": org.description,
            "email": org.email,
            "location": org.location,
            "created_at": org.created_at.isoformat() if org.created_at else None,
            "updated_at": org.updated_at.isoformat() if org.updated_at else None
        }
        
        # Get all data
        members = self.get_organization_members(org_name)
        teams = self.get_organization_teams(org_name)
        memberships = self.get_team_memberships(org_name)
        
        # Build team hierarchy
        team_hierarchy = self._build_team_hierarchy(teams)
        
        return {
            "organization": org_data,
            "members": members,
            "teams": teams,
            "team_memberships": memberships,
            "team_hierarchy": team_hierarchy,
            "statistics": {
                "total_members": len(members),
                "total_teams": len(teams),
                "total_memberships": len(memberships)
            }
        }
    
    def _build_team_hierarchy(self, teams: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Build hierarchical team structure.
        
        Args:
            teams: List of team dictionaries
            
        Returns:
            Nested dictionary representing team hierarchy
        """
        # Create lookup dictionaries
        teams_by_id = {team["id"]: team.copy() for team in teams}
        
        # Initialize children lists
        for team in teams_by_id.values():
            team["children"] = []
        
        # Build hierarchy
        root_teams = []
        for team in teams_by_id.values():
            if team["parent_id"] is None:
                root_teams.append(team)
            else:
                parent = teams_by_id.get(team["parent_id"])
                if parent:
                    parent["children"].append(team)
        
        return {
            "root_teams": root_teams
        }
    
    def close(self):
        """Close the GitHub client connection."""
        logger.info("Closing GitHub client")
