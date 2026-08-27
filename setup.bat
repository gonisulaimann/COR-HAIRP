@echo off
REM ============================================================
REM COR-HARP — One-Command Collaborator Setup (Windows)
REM ============================================================

echo ============================================================
echo   COR-HARP ^| Humanitarian AI Resource Predictor
echo   Collaborator Setup Script
echo ============================================================
echo.

REM -- 1. Python venv --
if not exist ".venv" (
    echo [1/6] Creating Python virtual environment...
    python -m venv .venv
) else (
    echo [1/6] Virtual environment already exists.
)

echo [2/6] Activating venv and installing dependencies...
call .venv\Scripts\activate.bat
pip install -r hairp_app\requirements.txt --quiet
pip install -r backend\requirements.txt --quiet

REM -- 2. Check for .env --
if not exist "hairp_app\.env" (
    echo [3/6] Creating .env template...
    (
        echo # COR-HARP Environment Variables
        echo SENDGRID_API_KEY=your_sendgrid_api_key_here
        echo SENDGRID_SENDER_EMAIL=noreply@cor-harp.org
        echo SENDGRID_SENDER_NAME=COR-HARP / UN OCHA
        echo OTP_EXPIRY_SECONDS=300
        echo VALIDECT_HOST=validect-email-verification-v1.p.rapidapi.com
        echo VALIDECT_KEY=your_validect_key_here
        echo OPENSKY_CLIENT_ID=your_opensky_id_here
        echo OPENSKY_CLIENT_SECRET=your_opensky_secret_here
    ) > hairp_app\.env
    echo   - Edit hairp_app\.env with your own API keys.
) else (
    echo [3/6] .env file already exists.
)

REM -- 3. Install frontend --
echo [4/6] Installing React frontend dependencies...
if exist "frontend" (
    cd frontend
    if exist "package.json" (
        call npm install --silent 2>nul
    )
    cd ..
) else (
    echo   WARNING: frontend\ directory not found.
)

REM -- 4. Check data --
echo [5/6] Checking data files...
if not exist "data:" (
    echo   WARNING: data:\ directory not found. Creating...
    mkdir "data:"
)

REM -- 5. Check model --
echo [6/6] Checking LSTM model...
if exist "hairp_app\models\born_lstm.pth" (
    echo   Trained model found.
) else (
    echo   WARNING: No trained model. Train with: cd hairp_app ^&^& python train_lstm.py
)

echo.
echo ============================================================
echo   Setup complete!
echo ============================================================
echo.
echo   To run the Streamlit app:
echo     call .venv\Scripts\activate.bat
echo     cd hairp_app ^&^& streamlit run app.py
echo.
echo   To run the new architecture:
echo     Terminal 1: uvicorn backend.main:app --reload --port 8000
echo     Terminal 2: cd frontend ^&^& npm run dev
echo.
echo   API docs: http://localhost:8000/docs
echo   Frontend: http://localhost:3000
echo.
pause
