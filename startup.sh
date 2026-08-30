#!/bin/bash
# ──────────────────────────────────────────────────────────────
# COR-HARP — Azure App Service Startup Script
# ──────────────────────────────────────────────────────────────
#
# Azure Oryx auto-generates /opt/startup/startup.sh which:
#   1. Sets PYTHONPATH to include antenv/lib/python3.11/site-packages
#   2. Activates the virtualenv
#   3. Then calls THIS script
#
# Because Oryx already handles virtualenv activation and PATH,
# this script should NOT try to source antenv/bin/activate —
# that file may not exist in Oryx-managed venvs.
#
# We simply launch gunicorn directly using the system Python.
# Oryx's PYTHONPATH ensures antenv packages are importable.

cd /home/site/wwwroot

exec gunicorn \
    --bind=0.0.0.0:${PORT:-8000} \
    --timeout 600 \
    --workers 2 \
    -k uvicorn.workers.UvicornWorker \
    backend.main:app
