@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo       Kanbix - Script de Setup y Run      
echo ==========================================
echo/

:: 1. Backend Setup
echo [1/3] Verificando entorno del Backend...
cd kanban-backend

if exist ".venv" (
    echo El entorno virtual ya existe.
    goto backend_done
)

echo No se encontro el entorno virtual. Creando .venv...
python -m venv .venv
if errorlevel 1 (
    echo [ERROR] No se pudo crear el entorno virtual. Asegurate de tener Python instalado y en tu PATH.
    goto error
)

echo Entorno virtual creado. Instalando dependencias...
call .venv\Scripts\activate
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de dependencias del Backend.
    goto error
)

:backend_done
if not exist ".env" (
    if exist ".env.example" (
        echo Copiando .env.example a .env...
        copy .env.example .env
        echo [WARN] Se creo el archivo .env a partir de .env.example. Recuerda configurar tus credenciales de MongoDB Atlas.
    )
)
cd ..

:: 2. Frontend Setup
echo/
echo [2/3] Verificando entorno del Frontend...
cd kanban-frontend

if exist "node_modules" (
    echo Las dependencias del Frontend ya estan instaladas.
    goto frontend_done
)

echo No se encontro la carpeta node_modules. Instalando dependencias...
call npm install
if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de dependencias del Frontend (npm install).
    goto error
)

:frontend_done
cd ..

:: 3. Ejecucion de Servidores
echo/
echo [3/3] Iniciando servidores en ventanas separadas...

:: Levantar Backend
echo Levantando Backend (FastAPI en puerto 8000)...
start "Kanbix Backend" cmd /k "cd kanban-backend && call .venv\Scripts\activate && python -m uvicorn app.main:app --reload --port 8000"

:: Levantar Frontend
echo Levantando Frontend (Vite en puerto 5173)...
start "Kanbix Frontend" cmd /k "cd kanban-frontend && npm run dev"

echo/
echo ==========================================
echo ¡Todo listo! Los servidores estan corriendo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo ==========================================
goto end

:error
echo/
echo [ERROR] Hubo un problema al configurar el proyecto.
pause
exit /b 1

:end
pause
