# Project Startup & Troubleshooting Guide

This guide provides step-by-step instructions to start the Medical Terminology Project (Backend, Frontend, and ML Service) and how to resolve common errors.

## 🚀 Quick Start (One-Click)

If you are on Windows, you can simply run the `start_all.bat` file located in the root directory.
1. Double-click `start_all.bat`.
2. This will open three separate command windows for the ML Service, Backend, and Frontend.

---

## 🛠️ Manual Startup Steps

If you prefer to start services individually or if the batch script fails, follow these steps.

### 1. ML Service (Python)
**Directory:** `ML_SERVICE`

**Prerequisites:**
- Python 3.10+ installed.
- Dependencies installed: `pip install -r requirements.txt`

**Start Command:**
```powershell
cd ML_SERVICE
python main.py
```
*Note: If you have a specific Python version or virtual environment, ensure you use the correct python executable (e.g., `.\venv\Scripts\python.exe main.py`).*

### 2. Backend (Node.js)
**Directory:** `BACKEND`

**Prerequisites:**
- Node.js installed.
- Dependencies installed: `npm install`
- MongoDB and PostgreSQL (if used) running.

**Start Command:**
```powershell
cd BACKEND
npm start
```
*Runs on Port 5000 by default.*

### 3. Frontend (React/Vite)
**Directory:** `FRONTEND`

**Prerequisites:**
- Node.js installed.
- Dependencies installed: `npm install`

**Start Command:**
```powershell
cd FRONTEND
npm run dev
```
*Runs on http://localhost:5173 by default.*

---

## ⚠️ Troubleshooting Common Errors

### 1. "Address already in use" / Port Conflicts
**Error:** `EADDRINUSE: address already in use :::5000` or similar.
**Cause:** Another instance of the server is already running or the port is blocked.
**Solution:**
1. Open a terminal.
2. Find the process ID (PID) using the port:
   ```powershell
   netstat -ano | findstr :5000
   ```
3. Kill the process:
   ```powershell
   taskkill /PID <PID> /F
   ```
   *(Replace `<PID>` with the number found in step 2)*

### 2. Python "ModuleNotFoundError"
**Error:** `ModuleNotFoundError: No module named 'fastapi'` (or other modules).
**Cause:** Dependencies are not installed in the current Python environment.
**Solution:**
1. Navigate to `ML_SERVICE`.
2. Install requirements:
   ```powershell
   pip install -r requirements.txt
   ```

### 3. MongoDB Connection Failed
**Error:** `MongoNetworkError: failed to connect to server` or `MongooseServerSelectionError`.
**Cause:** MongoDB is not running, or the connection string in `.env` is incorrect/IP blocked.
**Solution:**
1. Check `BACKEND/.env` file. Ensure `MONGODB_URI` is correct.
2. If using MongoDB Atlas (Cloud), check if your IP address is whitelisted in the Atlas dashboard.
3. If using local MongoDB, ensure the service is running.

### 4. Frontend "Network Error" / API Calls Failing
**Error:** The frontend loads, but search or chat features don't work.
**Cause:** The Backend or ML Service is not running, or the Frontend is pointing to the wrong URL.
**Solution:**
1. Ensure **both** Backend and ML Service are running without errors.
2. Check the browser console (F12) for error messages.
3. Verify `FRONTEND/.env` (if exists) or API configuration matches the backend URL (usually `http://localhost:5000`).

### 5. "python" is not recognized
**Error:** `'python' is not recognized as an internal or external command...`
**Cause:** Python is not added to your system PATH.
**Solution:**
- Reinstall Python and check "Add Python to PATH" during installation.
- OR use the full path to python.exe (e.g., `C:\Python310\python.exe`).
