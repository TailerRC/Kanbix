# Kanbix

Sistema Kanban desarrollado bajo el enfoque **Spec-Driven Development (SDD)**.

Stack: **React + TypeScript** (frontend) · **FastAPI + Python** (backend) · **MongoDB Atlas** (base de datos)

---

## Estructura del repositorio

```
kanbix/
├── docs/               # Especificaciones (reglas de negocio, RF, RNF, OpenAPI, etc.)
├── kanban-backend/     # API en FastAPI
└── kanban-frontend/    # SPA en React + Vite + TypeScript
```

---

## 1. Requisitos previos

Cada integrante necesita instalado en su máquina:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) v18 o superior (incluye npm)
- [Python](https://www.python.org/) 3.11+ (recomendado 3.11 o 3.12; si usas 3.14 puede haber problemas de compilación con algunas librerías)
- Un editor de código (VS Code recomendado)

> **El `MONGO_URI` de MongoDB Atlas te lo comparte por separado quien creó el cluster** (ver sección 5). No está en el repositorio por seguridad.

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/<usuario>/kanbix.git
cd kanbix
```

---

## 3. Levantar el Backend (FastAPI)

```bash
cd kanban-backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows (PowerShell):
.\venv\Scripts\Activate


# Instalar dependencias
pip install -r requirements.txt

# Crear archivo de variables de entorno
copy .env.example .env   # Windows
```

Abre `.env` y completa con los valores reales que te compartieron (ver sección 5):

```
MONGO_URI=<el que te compartieron por el grupo>
JWT_SECRET_KEY=<cualquier texto largo, debe ser el mismo para todos>
```

Levantar el servidor:

```bash
uvicorn app.main:app --reload
```

Verifica que funciona:
- API: http://localhost:8000
- Documentación interactiva (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/health → debe responder `{"status":"ok"}`

En la consola también debe aparecer: `✅ Conectado a MongoDB Atlas`

---

## 4. Levantar el Frontend (React + Vite)

En **otra terminal** (deja el backend corriendo en la primera):

```bash
cd kanban-frontend

npm install

copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux
```

El `.env` ya viene con el valor correcto por defecto:
```
VITE_API_URL=http://localhost:8000
```

Levantar el servidor de desarrollo:

```bash
npm run dev
```

Abre el navegador en: http://localhost:5173

Si todo está bien conectado, verás un recuadro verde: **"✅ Conectado al backend"**. Si sale en rojo, revisa que el backend siga corriendo en la otra terminal.

---

## 5. Variables sensibles (MONGO_URI y JWT_SECRET_KEY)

Estos valores **no se suben a GitHub** (están en `.gitignore`). El responsable del cluster de MongoDB Atlas debe compartir por un canal privado del equipo (WhatsApp, Discord, etc.) lo siguiente:

```
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET_KEY=una-clave-larga-acordada-por-el-equipo
```

> Importante: todos deben usar el **mismo** `JWT_SECRET_KEY`, si no, los tokens generados por un compañero no funcionarán al ser validados por otro.

---

## 6. Documentación de especificaciones (SDD)

Toda la documentación formal del proyecto vive en `docs/`:

- `docs/reglas-negocio/` — Reglas de negocio (RN-01 a RN-30)
- `docs/requerimientos/` — Requerimientos funcionales y no funcionales
- `docs/casos-uso/` — Casos de uso del sistema
- `docs/trazabilidad/` — Matriz de trazabilidad RF vs Casos de Uso
- `docs/escenarios-calidad/` — Escenarios de calidad (estímulo-respuesta)
- `docs/openapi/` — Contratos OpenAPI por módulo (fuente de verdad para los endpoints)

Antes de implementar un módulo, revisa su contrato OpenAPI correspondiente en `docs/openapi/`.

---

## Equipo

| Código | Integrante |
|---|---|
| 202310515 | Chacón Uscamaita, Rodrigo Alessandro |
| 202310518 | Caballero Medina, Gianfranco |
| 202311402 | Carrasco Pariona, Jerzy Ramon |
| 202211321 | Villon Nieto, Piero Alexander |
| 202210525 | Meneses Meléndez, Allisson Leandra |
| 202311383 | Cuadros Malaga, Diego Tomas |

**Curso:** Arquitectura y Evolución de Software
**Profesor:** Gipsy Miguel Ángel Arrunátegui Angulo
**Universidad Ricardo Palma — 2026-I**