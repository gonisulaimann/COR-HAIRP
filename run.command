#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
#  run.command — UN OCHA AI Command Center 1-Click Launcher
#  Double-click in Finder to launch the Streamlit application.
# ═══════════════════════════════════════════════════════════════════════

# Resolve the directory containing this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   UN OCHA AI Command Center — Launching …                  ║"
echo "║   Borno State Humanitarian Operations                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Activate virtual environment
if [ -f ".venv/bin/activate" ]; then
    echo "→ Activating virtual environment …"
    source .venv/bin/activate
else
    echo "⚠  .venv not found — using system Python"
fi

# Launch Streamlit
echo "→ Starting Streamlit server …"
echo "→ URL: http://localhost:8501"
echo ""

exec streamlit run hairp_app/app.py \
    --server.headless true \
    --server.port 8501 \
    --browser.gatherUsageStats false \
    --theme.base "dark" \
    --theme.primaryColor "#009EDB" \
    --theme.backgroundColor "#0D1B2A" \
    --theme.secondaryBackgroundColor "#1B2838" \
    --theme.textColor "#E0E6ED"
