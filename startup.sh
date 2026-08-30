#!/bin/bash
# ──────────────────────────────────────────────────────────────
# COR-HARP — Azure App Service Startup Script
# ──────────────────────────────────────────────────────────────
#
# This script is executed by Azure App Service on every cold start.
# Azure Oryx builds the Python virtualenv during deployment and
# installs it at antenv/. This script activates it and launches
# gunicorn with the Uvicorn worker for async FastAPI support.
#
# Environment Variables:
#   PORT           — Azure-assigned port (default: 8000)
#   WEBSITE_SITE   — Azure App Service name
#   SCM_DO_BUILD   — Set to true to trigger Oryx build on deploy
#
# Application Root: /home/site/wwwroot (Azure default)

set -e

cd /home/site/wwwroot

# Activate the virtual environment (Oryx creates it at antenv/)
if [ -f "antenv/bin/activate" ]; then
    source antenv/bin/activate
elif [ -f "server/antenv/bin/activate" ]; then
    source server/antenv/bin/activate
fi

# Launch gunicorn with Uvicorn workers for async FastAPI support
exec gunicorn \
    --bind=0.0.0.0:${PORT:-8000} \
    --timeout 600 \
    --workers 2 \
    -k uvicorn.workers.UvicornWorker \
    backend.main:app
