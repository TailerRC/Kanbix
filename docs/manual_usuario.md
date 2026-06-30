# 📘 Manual de Flujo Completo para el Agente IA: Sistema Kanbix

> Guía para el desarrollo modular de la plataforma Web, basada en el orden lógico de las metodologías ágiles y los contratos definidos en el directorio `docs/contratos`.

---

## 🏗️ Fase 1: Autenticación e Identidad

> *La Llave de Entrada* — El Agente IA debe validar el acceso al sistema antes de permitir cualquier interacción con los espacios de trabajo.

**Contrato:** `modulo1_auth_usuarios.md`

### Flujo y lógica

El usuario se registra, inicia sesión o recupera su contraseña. El sistema genera la sesión y extrae la Matriz de Roles y Permisos del usuario (definida globalmente en `matriz_roles_permisos.md`).

**Resultado esperado:** Una vez autenticado con éxito, el sistema redirige automáticamente al usuario a la pantalla de gestión de espacios (Fase 2).

---

## 🏢 Fase 2: Estructuración del Negocio

> *Proyectos y Equipos* — El Agente IA debe construir el contenedor principal donde operará el equipo.

**Contrato:** `modulo2_proyectos.md`

### Flujo y lógica

**Creación del espacio:** El usuario administrador crea un Proyecto / Espacio de Trabajo (ej. *Equipo Jerzy*).

**Onboarding del equipo:** Al crear el proyecto, el sistema gatilla el flujo de invitaciones con las siguientes opciones:
- Copiar un enlace directo de acceso.
- Ingresar correos electrónicos para invitar compañeros.
- Omitir el paso e ir directo al área de trabajo.

**Selector de espacios:** El sistema renderiza una pantalla inicial donde el usuario ve la lista de proyectos disponibles y selecciona el espacio donde desea trabajar.

---

## 🗺️ Fase 3: Orquestación de la Barra de Navegación

Una vez que el usuario selecciona un Espacio de Trabajo, el Agente IA renderiza la interfaz principal. Cada pestaña de la barra de navegación consume sus contratos de la siguiente manera:

---

### 1️⃣ Resumen — Dashboard General

**Contrato:** `modulo6_reportes.md`

Renderiza las tarjetas de métricas rápidas (tareas creadas, actualizadas, por vencer) y el gráfico de torta de estado para dar un vistazo rápido del progreso actual del espacio.

---

### 2️⃣ Backlog — La Bodega y los Sprints

**Contrato:** sección de Sprints de `modulo2_proyectos.md`

Muestra la lista de espera de tareas. Permite crear bloques de tiempo (Sprint 0, Sprint 1, Sprint 2) y arrastrar ítems del Backlog general hacia el Sprint activo para iniciar el ciclo de trabajo de dos semanas.

---

### 3️⃣ Tablero — La Mesa de Trabajo Diaria

**Contratos:**
- `modulo3_tableros_tareas.md` — Estructura de tarjetas, campos como Prioridad y columnas Kanban.
- `modulo4_planificacion.md` — Asignación de responsables, estimaciones y arrastre entre columnas.

Es el contenedor dinámico del Sprint activo. El Agente debe programar la funcionalidad **Drag & Drop** (arrastrar y soltar) y habilitar la ventana modal lateral para ver y editar los detalles de una tarea al hacer clic sobre ella.

Flujo de columnas: `Por Hacer → En Curso → Finalizado`

---

### 4️⃣ Calendario — Referencia de Plazos

**Contrato:** datos de `modulo3_tableros_tareas.md`

Muestra una vista de almanaque mensual. Toma las tareas sin fecha del panel lateral derecho y permite arrastrarlas hacia un día del calendario para asignarles automáticamente una fecha de vencimiento.

---

### 5️⃣ Cronograma — Planificación a Largo Plazo (Gantt)

**Contrato:** manejado de forma nativa por las vistas de tiempo del sistema.

Lista todas las actividades a la izquierda con su estado y responsable. A la derecha, dibuja barras de tiempo horizontales a lo largo de los meses para definir la duración estimada del trabajo.

| Color | Estado |
|-------|--------|
| 🔘 Gris | Por hacer |
| 🔵 Azul | En curso |
| 🟢 Verde | Finalizado |

---

### 6️⃣ Documentos — El Muro de Conocimiento

**Contrato:** contexto almacenado por el equipo y archivos de apoyo.

Renderiza un editor de texto o visor de documentos donde el equipo puede almacenar minutas de reuniones, guías técnicas o documentación del proyecto.

---

### 7️⃣ Informes — Cierre y Métricas de Scrum

**Contrato:** sección de analítica de `modulo6_reportes.md`

Se activa con el botón **"Completar Sprint"** ejecutado desde el Tablero. Renderiza:
- Gráfico de evolución — **Burndown Chart**
- Gráfico de trabajo hecho — **Burnup Chart**
- Velocidad del equipo — **Velocity Chart**

> ⚠️ El Agente debe renderizar los datos o restringir accesos de edición según la `matriz_roles_permisos.md` del usuario en sesión.

---

## 📈 Fase 4: El Ciclo de Vida Infinito

> *Flujo de Cierre* — El Agente IA debe programar la lógica del botón **"Completar Sprint"** en el Tablero.

Al vencer el plazo, el sistema:

1. Calcula las tareas finalizadas y pendientes.
2. Abre una ventana modal que pregunta el destino de las tareas inconclusas.
3. Envía lo incompleto al Backlog general o al nuevo Sprint pre-creado (ej. Sprint 1) en la pestaña Backlog.
4. Genera los registros de métricas en la pestaña Informes.
5. Reinicia el ciclo desde la Fase 2.

---

## 💡 Instrucción Final para el Agente IA

> Agente, utiliza este manual como tu mapa de ruta de negocio (*Storyline*). Cada módulo que construyas en código debe respetar la interfaz de usuario de la barra de navegación descrita aquí, leyendo estrictamente la lógica de datos especificada en cada archivo `.md` de la carpeta `contratos` para asegurar la cohesión completa del clon de Jira.