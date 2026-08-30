"""
COR-HARP Backend
================

FastAPI REST API for the Conflict-Oriented Humanitarian AI Resource Predictor.

This package serves the React frontend with authenticated endpoints for
conflict forecasting, supply chain optimization, geospatial intelligence,
and user management across Borno State LGAs.

Modules
-------
main
    Application entry point, route definitions, and middleware configuration.
ml
    ML inference layer wrapping PyTorch LSTM and PuLP MILP solvers.
auth
    SQLite-backed authentication, OTP email verification, and role-based access.
schemas
    Pydantic request/response models enforcing API contract validation.

Running Locally
---------------
    uvicorn backend.main:app --reload --port 8000

Production (Azure)
------------------
    gunicorn -k uvicorn.workers.UvicornWorker backend.main:app

Version: 1.0.0
"""
