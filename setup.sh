#!/bin/bash
# ============================================================
# COR-HARP — One-Command Collaborator Setup (Mac/Linux)
# ============================================================
set -e

echo "============================================================"
echo "  COR-HARP | Humanitarian AI Resource Predictor"
echo "  Collaborator Setup Script"
echo "============================================================"
echo ""

# ── 1. Python venv ──
if [ ! -d ".venv" ]; then
  echo "[1/6] Creating Python virtual environment..."
  python3 -m venv .venv
else
  echo "[1/6] Virtual environment already exists."
fi

echo "[2/6] Activating venv and installing backend dependencies..."
source .venv/bin/activate
pip install -r hairp_app/requirements.txt --quiet
pip install -r backend/requirements.txt --quiet

# ── 2. Check for .env ──
if [ ! -f "hairp_app/.env" ]; then
  echo "[3/6] Creating .env template..."
  cat > hairp_app/.env << 'ENVEOF'
# COR-HARP Environment Variables
# Fill in your own API keys below

# SendGrid (email OTP)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_SENDER_EMAIL=noreply@cor-harp.org
SENDGRID_SENDER_NAME=COR-HARP Humanitarian AI
OTP_EXPIRY_SECONDS=300

# Validect (email verification)
VALIDECT_HOST=validect-email-verification-v1.p.rapidapi.com
VALIDECT_KEY=your_validect_key_here

# OpenSky (flight tracking)
OPENSKY_CLIENT_ID=your_opensky_id_here
OPENSKY_CLIENT_SECRET=your_opensky_secret_here
ENVEOF
  echo "  → Edit hairp_app/.env with your own API keys."
else
  echo "[3/6] .env file already exists."
fi

# ── 3. Install frontend ──
echo "[4/6] Installing React frontend dependencies..."
if [ -d "frontend" ]; then
  cd frontend
  if command -v npm &> /dev/null; then
    npm install --silent 2>/dev/null || echo "  → npm install had warnings (non-critical)."
  elif command -v yarn &> /dev/null; then
    yarn install --silent 2>/dev/null || echo "  → yarn install had warnings (non-critical)."
  else
    echo "  ⚠ npm/yarn not found. Install Node.js from https://nodejs.org"
  fi
  cd ..
else
  echo "  ⚠ frontend/ directory not found."
fi

# ── 4. Check data files ──
echo "[5/6] Checking data files..."
DATA_DIR="data"
if [ -d "$DATA_DIR" ]; then
  COUNT=$(ls -1 "$DATA_DIR" 2>/dev/null | wc -l | tr -d ' ')
  echo "  → Found $COUNT files in $DATA_DIR/"
  if [ "$COUNT" -lt 2 ]; then
    echo "  ⚠ Expected data files may be missing. Place them in $DATA_DIR/"
  fi
else
  echo "  ⚠ data:/ directory not found. Create it and place dataset files inside."
  mkdir -p "$DATA_DIR"
fi

# ── 5. Check for trained model ──
echo "[6/6] Checking LSTM model..."
MODEL_FILE="hairp_app/models/borno_lstm.pth"
if [ -f "$MODEL_FILE" ]; then
  echo "  → Trained model found."
else
  echo "  ⚠ No trained model. Train with: cd hairp_app && python train_lstm.py"
fi

echo ""
echo "============================================================"
echo "  Setup complete!"
echo "============================================================"
echo ""
echo "  To run the ORIGINAL Streamlit app:"
echo "    source .venv/bin/activate"
echo "    cd hairp_app && streamlit run app.py"
echo ""
echo "  To run the NEW decoupled architecture:"
echo "    Terminal 1 (Backend):"
echo "      source .venv/bin/activate"
echo "      uvicorn backend.main:app --reload --port 8000"
echo ""
echo "    Terminal 2 (Frontend):"
echo "      cd frontend && npm run dev"
echo ""
echo "  API docs: http://localhost:8000/docs"
echo "  Frontend: http://localhost:3000"
echo ""
