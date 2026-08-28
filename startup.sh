#!/bin/bash
# COR-HARP Azure startup script
# Creates venv on first boot if not present, then launches gunicorn

cd /home/site/wwwroot

VENV_DIR="/home/site/wwwroot/antenv"

if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
    source "$VENV_DIR/bin/activate"
    pip install --no-cache-dir -r requirements.txt
else
    source "$VENV_DIR/bin/activate"
fi

exec gunicorn --bind=0.0.0.0 --timeout 600 -k uvicorn.workers.UvicornWorker backend.main:app
