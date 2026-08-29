#!/bin/bash
# COR-HARP Azure startup script
# Oryx builds the virtualenv during deployment.
# This script activates it and launches gunicorn on the port Azure assigns.

cd /home/site/wwwroot
source antenv/bin/activate
exec gunicorn --bind=0.0.0.0:${PORT:-8000} --timeout 600 -k uvicorn.workers.UvicornWorker backend.main:app
