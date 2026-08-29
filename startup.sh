#!/bin/bash
# COR-HARP Azure startup script
# The build step installs all dependencies into antenv/ at build time.
# This script simply activates the venv and launches gunicorn.

cd /home/site/wwwroot
source antenv/bin/activate
exec gunicorn --bind=0.0.0.0 --timeout 600 -k uvicorn.workers.UvicornWorker backend.main:app
