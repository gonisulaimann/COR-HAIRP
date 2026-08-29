#!/bin/bash
# COR-HARP Azure startup script
# Oryx builds the virtualenv during deployment.
# This script activates it and launches gunicorn on the port Azure assigns.

cd /home/site/wwwroot

# Activate the virtual environment (Oryx creates it at antenv/)
if [ -f "antenv/bin/activate" ]; then
    source antenv/bin/activate
elif [ -f "server/antenv/bin/activate" ]; then
    source server/antenv/bin/activate
fi

exec gunicorn --bind=0.0.0.0:${PORT:-8000} --timeout 600 -k uvicorn.workers.UvicornWorker backend.main:app
