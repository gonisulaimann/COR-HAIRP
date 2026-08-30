"""
COR-HARP Custom CORS Middleware
===============================

Extends Starlette's CORSMiddleware to add regex-based origin matching.
This is necessary because:

1. Azure Static Web Apps generates a NEW preview URL for every PR:
   - Production:  https://icy-river-0d05cf50f.7.azurestaticapps.net
   - PR previews: https://icy-river-0d05cf50f-<N>.<region>.7.azurestaticapps.net

2. The built-in allow_origin_regex parameter may not be available or may
   not work correctly in all Starlette/FastAPI versions (particularly when
   Azure Oryx resolves dependency versions differently than expected).

3. This middleware manually checks the Origin header against both a static
   allowlist AND a compiled regex pattern, ensuring all current and future
   PR preview domains are covered without hardcoding each one.
"""

from __future__ import annotations

import re
from typing import Pattern, Sequence

from starlette.middleware.cors import CORSMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send


class RegexCORSMiddleware(CORSMiddleware):
    """
    CORS middleware with added regex-based origin matching.

    Accepts all parameters of the standard CORSMiddleware, plus an
    additional `allow_origin_regex` string parameter that is compiled
    into a regex and checked against the request Origin header when
    the Origin is not found in the static allow_origins list.
    """

    def __init__(
        self,
        app: ASGIApp,
        allow_origins: Sequence[str] = (),
        allow_methods: Sequence[str] = ("GET",),
        allow_headers: Sequence[str] = (),
        allow_credentials: bool = False,
        allow_origin_regex: str | None = None,
        expose_headers: Sequence[str] = (),
        max_age: int = 600,
    ) -> None:
        super().__init__(
            app,
            allow_origins=allow_origins,
            allow_methods=allow_methods,
            allow_headers=allow_headers,
            allow_credentials=allow_credentials,
            expose_headers=expose_headers,
            max_age=max_age,
        )
        # Compile the regex pattern for PR preview origin matching.
        # Stored as a compiled Pattern for fast matching on every request.
        self._origin_regex: Pattern[str] | None = (
            re.compile(allow_origin_regex) if allow_origin_regex else None
        )

    def is_allowed_origin(self, origin: str) -> bool:
        """
        Check if the given Origin header value is allowed.

        First checks the static allow_origins list (fast string comparison).
        If not found, falls back to the compiled regex pattern (for dynamic
        Azure SWA PR preview URLs that change with every PR).
        """
        # Fast path: check the static list (handles production + localhost)
        if origin in self.allow_origins:
            return True

        # Slow path: regex match for PR preview URLs
        if self._origin_regex and self._origin_regex.fullmatch(origin):
            return True

        return False
