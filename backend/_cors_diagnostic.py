"""
Temporary CORS diagnostic endpoint — REMOVE AFTER DIAGNOSIS.

Returns the server's actual ALLOWED_ORIGINS list and whether the custom
RegexCORSMiddleware is loaded. This proves which version of the code
is actually running on the Azure App Service.
"""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()


@router.get("/api/_cors-diag")
def cors_diagnostic():
    """
    Diagnostic endpoint: returns what the running server believes
    its CORS configuration is. Compare this against the source code
    to confirm deployment.
    """
    from .main import ALLOWED_ORIGINS

    try:
        from .cors import RegexCORSMiddleware

        middleware_loaded = True
    except Exception:
        middleware_loaded = False

    return {
        "allowed_origins": ALLOWED_ORIGINS,
        "regex_middleware_loaded": middleware_loaded,
        "pr_preview_in_list": "https://icy-river-0d05cf50f-1.eastus2.7.azurestaticapps.net" in ALLOWED_ORIGINS,
        "note": "TEMPORARY — remove after CORS diagnosis",
    }
