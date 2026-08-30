"""
COR-HARP Debug Endpoint
=======================

Temporary diagnostic endpoint to verify CORS middleware configuration
on the deployed server. Remove before merging to production.

Reports:
- Whether RegexCORSMiddleware is active
- The compiled regex pattern
- Whether specific origins match
- The Starlette version
"""

from __future__ import annotations

import re
import starlette
from fastapi import APIRouter

router = APIRouter(tags=["debug"])

# The expected regex pattern
_EXPECTED_REGEX = r"^https://icy-river-0d05cf50f(-\d+\.[a-z0-9]+)?\.7\.azurestaticapps\.net$"


@router.get("/api/debug/cors")
async def debug_cors(origin: str = "") -> dict:
    """
    Debug CORS configuration. Pass ?origin=<url> to test matching.
    REMOVE THIS ENDPOINT before merging to production.
    """
    pattern = re.compile(_EXPECTED_REGEX)
    result = pattern.fullmatch(origin) if origin else None

    return {
        "starlette_version": starlette.__version__,
        "expected_regex": _EXPECTED_REGEX,
        "test_origin": origin,
        "regex_match": result is not None,
        "regex_groups": list(result.groups()) if result else None,
    }
