# Diseño Visual — Kanbix

> Documento generado por Claude · Versión 2.0 · Actualizado con referencia visual tipo dashboard (paleta, layout y patrones de tarjetas) · Para revisión del equipo

---

## 1. Paleta de Colores

Se actualiza la paleta para adoptar un lenguaje visual tipo "dashboard SaaS" (fondo gris muy claro + tarjetas blancas flotantes + acento negro/grafito para acciones primarias), conservando el violeta como color de marca para usos puntuales (logo, columna "Revisión/QA").

| Rol | Nombre | Hex |
|-----|--------|-----|
| Acción primaria (botones, sidebar activo) | Grafito | `#111827` |
| Acción primaria hover | Grafito oscuro | `#1F2937` |
| Marca (logo, acentos puntuales) | Violeta Kanbix | `#6366F1` |
| Background (fondo general) | Gris frío clarísimo | `#F4F5F7` |
| Surface (tarjetas, contenedores) | Blanco | `#FFFFFF` |
| Borde general | Gris línea | `#E5E7EB` |
| Texto primario | Gris carbón | `#111827` |
| Texto secundario | Gris medio | `#6B7280` |
| Texto muted | Gris claro | `#9CA3AF` |
| Error | Rojo | `#DC2626` |
| Error (fondo badge) | Rojo suave | `#FEE2E2` |
| Warning | Ámbar | `#D97706` |
| Warning (fondo badge) | Ámbar suave | `#FEF3C7` |
| Success | Verde | `#16A34A` |
| Success (fondo badge) | Verde suave | `#DCFCE7` |
| Info | Azul | `#2563EB` |
| Info (fondo badge) | Azul suave | `#DBEAFE` |

### Colores de columnas Kanban (también usados como acentos de datos en gráficos/stat cards)

| Columna | Color dot | Hex |
|---------|-----------|-----|
| Backlog | Gris | `#94A3B8` |
| Por hacer | Azul | `#3B82F6` |
| En progreso | Ámbar | `#F59E0B` |
| Revisión / QA | Violeta | `#8B5CF6` |
| Completado | Verde | `#10B981` |

### Prioridad de tarjetas (borde izquierdo)

| Nivel | Color | Hex |
|-------|-------|-----|
| Alta | Rojo | `#EF4444` |
| Media | Ámbar | `#F59E0B` |
| Baja | Azul | `#3B82F6` |
| Sin definir | Borde estándar | `#E5E7EB` |

---

## 2. Tipografía

- **Fuente principal**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
  - Pesos usados: `400` (texto cuerpo), `500` (labels, subtítulos), `600` (títulos de sección), `700` (headings), `800` (números grandes en stat cards / métricas destacadas — nuevo, inspirado en la referencia visual)
  - Por qué: moderna, geométrica sin ser fría, excelente legibilidad a tamaños pequeños, y soporta bien el contraste "número gigante en bold / label pequeño en gris" que se usa en las stat cards

- **Fuente monospace** (IDs de ticket, snippets de código): [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
  - Peso: `400`

### Escala tipográfica

| Rol | Tamaño | Peso | Uso |
|-----|--------|------|-----|
| Metric (nuevo) | 36–40px | 800 | Números protagonistas en stat cards / métricas destacadas |
| Display | 24px | 700 | Títulos de página |
| Heading 1 | 20px | 600 | Títulos de sección |
| Heading 2 | 16px | 600 | Títulos de columna / título de tarjeta |
| Body | 14px | 400 | Texto de tarjetas |
| Label | 13px | 500 | Metadata, badges |
| Caption | 11px | 400 | IDs de ticket, timestamps, "From last week" style |
| Mono | 12px | 400 | IDs, código |

### Import para el proyecto

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400&display=swap');
```

```css
:root {
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

---

## 3. Layout General

**Sidebar izquierda + navbar superior**, ahora especificado con el detalle de la referencia visual (topbar con búsqueda + sidebar con ítem activo en "pill" sólido).

### Estructura de zonas

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] Kanbix     [🔍 Buscar tareas...]      [🔔] [⚙] [Avatar ▾] │ 64px
├──────────┬─────────────────────────────────────────────────────────┤
│          │                                                       │
│ SIDEBAR  │                ÁREA DE CONTENIDO                      │
│ blanco   │     (stat cards · gráfico semanal · tabla · panel)    │
│ 240px    │                                                       │
│          │                                                       │
└──────────┴─────────────────────────────────────────────────────────┘
```

### Topbar — detalle de zonas

- **Izquierda**: logo Kanbix (ícono + texto bold).
- **Centro**: barra de búsqueda global ("Buscar tareas, sprints, miembros..."), fondo gris clarísimo (`--color-bg`), forma "pill" (`border-radius: 999px`), ícono de lupa a la derecha del input.
- **Derecha**: ícono de notificaciones (con badge de punto rojo si hay novedades), ícono de configuración rápida, y bloque de usuario (avatar circular + nombre en bold + rol/equipo en gris debajo, ej. "Gianfranco — Project Manager").

### Sidebar — items de navegación

```
[●] Kanbix (logo)
──────────────────
[▣] Tablero          ← ítem activo: fondo grafito (#111827), texto blanco, pill redondeado
 ▸  Backlog                                                    (24)
 ▸  Sprint actual
 ▸  Reportes
──────────────────
SOPORTE
 ▸  Ayuda
 ▸  Configuración
──────────────────
┌──────────────────────┐
│  💡 Optimiza tu       │   ← tarjeta promocional/CTA
│  próximo sprint con   │      (igual a la card de "Build future
│  IA                   │      wealth" del dashboard de referencia)
│  [ Probar ahora ]     │
└──────────────────────┘
──────────────────
[⏏] Cerrar sesión   (rojo, separado al final)
```

- El ítem de menú **activo** usa fondo sólido grafito (`#111827`) en forma de pill que envuelve ícono + texto, igual que el tratamiento del dashboard de referencia (ahí era "Dashboard" en negro).
- Los ítems con conteo (ej. "Backlog 24", "Pendientes de revisión 3") muestran un badge numérico circular pequeño a la derecha, fondo rosado/rojo suave si requiere atención, gris suave si es informativo.
- Tarjeta promocional al final de la sidebar: blanco, borde sutil, ilustración simple, texto corto + botón negro pill — mismo patrón que la card "Build future wealth" de la referencia, pero reutilizada para sugerencias de producto (ej. "Genera tu reporte de sprint con IA").

### Comportamiento responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| ≥ 1280px | Sidebar expandida (240px) + contenido |
| 768–1279px | Sidebar colapsada (iconos 64px) + contenido |
| < 768px | Sidebar oculta, navbar con hamburger menu |

---

## 4. Logo / Marca

- **Tipo**: Ícono + texto ("Kanbix"), ícono dentro de un círculo o cuadrado redondeado de color, igual al tratamiento "logo en burbuja" del dashboard de referencia.
- **Ícono**: una `K` estilizada con el trazo diagonal convertido en flecha de progreso, o alternativamente tres barras verticales de alturas distintas (columnas del tablero).
- **Texto**: `Kanbix`, sentence case, nunca todo mayúsculas, peso 700.
- **Color del logo**:
  - Sobre fondo claro (topbar/sidebar blanca): violeta primario `#6366F1` o grafito `#111827`.
  - Sobre fondo oscuro: blanco `#FFFFFF`.

### Variantes

| Variante | Uso |
|----------|-----|
| Logo completo (ícono + "Kanbix") | Sidebar expandida, topbar, landing page |
| Solo ícono | Sidebar colapsada, favicon, app icon |

### Tratamiento tipográfico del nombre

- Fuente: Plus Jakarta Sans 700, `letter-spacing: -0.02em`.

---

## 5. Modo Oscuro / Claro

**Ambos modos con toggle**, manteniendo el mismo lenguaje de tarjetas y pills.

### Paleta modo oscuro

| Rol | Hex modo oscuro |
|-----|-----------------|
| Background general | `#0F172A` |
| Surface (tarjetas) | `#1E293B` |
| Surface elevada (modales) | `#334155` |
| Borde | `#334155` |
| Texto primario | `#F1F5F9` |
| Texto secundario | `#94A3B8` |
| Texto muted | `#64748B` |
| Acción primaria (sidebar activo) | `#F8FAFC` con texto `#0F172A` (invierte el contraste grafito) |
| Marca (violeta) | `#818CF8` |

> Los colores semánticos y los acentos de categoría (azul/verde/ámbar/violeta) mantienen el mismo Hex; solo cambia el fondo del badge/chip a una versión más opaca/oscura.

### Implementación sugerida (Tailwind)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
}
```

### Persistencia

Guardar preferencia en `localStorage` y respetar `prefers-color-scheme` en la primera visita.

---

## 6. Patrones de Componentes (estilo dashboard)

Esta sección traduce los patrones visuales del dashboard de referencia (Finova) al contenido real de Kanbix. **Se toma el diseño y la paleta, no la información** — cada componente se reescribe con datos de gestión de tareas/sprints.

### 6.1 Stat cards (fila de 4 tarjetas)

Fila superior del contenido principal. Cada tarjeta blanca, `border-radius: 20px`, contiene:

- Label pequeño gris arriba (ej. "Tareas totales", "Completadas", "En progreso", "Vencidas")
- Número grande en bold/800 debajo (ej. `128`)
- Badge de tendencia abajo a la izquierda: pill verde con flecha ↑ y `%` (ej. "+12% vs. semana pasada") o pill rojo con ↓
- Mini-indicador circular o de barra a la derecha, con el color de categoría correspondiente (azul/verde/ámbar/violeta) y un % de avance

### 6.2 Tarjeta "Resumen semanal" (Overview / gráfico de barras)

Tarjeta grande (2/3 del ancho). Header con título + leyenda de colores (puntos: Creadas / Completadas / En progreso) + selector "Semanal ▾". Debajo, gráfico de barras agrupadas por día (Lun–Dom), barras con esquinas redondeadas tipo cápsula, alternando relleno sólido y relleno con **patrón de rayas diagonales** (para diferenciar series sin saturar de color). Tooltips tipo pill oscuro flotando sobre los picos ("Día pico").

### 6.3 Tarjeta de métrica destacada (Big Number Card)

Tarjeta lateral (1/3 del ancho), ej. **"Tasa de cumplimiento del sprint"**:

- Número gigante en bold (ej. `87%`)
- Texto secundario al lado (ej. "26 de 30 historias completadas")
- Barra de progreso horizontal gruesa debajo
- Badge de tendencia verde (ej. "+15% vs. sprint anterior")
- Dos botones abajo: uno outline ("Ver detalle") y uno relleno negro ("Ver reporte")

### 6.4 Tabla "Historial de actividad"

Reemplaza "Transaction History". Header con título + dropdown de filtro ("Semanal ▾"). Columnas con íconos de orden (flechitas): `ID`, `Fecha`, `Tipo de evento`, `Estado`, `Responsable`. Filas con buen padding vertical, badges de estado tipo pill (`Completado` verde suave, `En progreso` ámbar suave, `Bloqueado` rojo suave).

### 6.5 Panel "Distribución de tareas"

Reemplaza "Expense Breakdown". Filas horizontales por estado o por miembro del equipo, cada una con:

- Ícono en cuadrado redondeado de color (mismo color que la columna Kanban correspondiente)
- Cantidad (ej. `18 tareas`)
- Barra de progreso con relleno de rayas diagonales
- Porcentaje del total
- Mini-tag con el nombre de la categoría/columna

### 6.6 Botones

Dos variantes constantes, ambas en pill shape (`border-radius: 999px`):

- **Primario**: fondo grafito `#111827`, texto blanco, hover `#1F2937`
- **Secundario/outline**: fondo transparente, borde `#E5E7EB`, texto `#111827`

### 6.7 Reglas globales de estilo

- **Bordes redondeados everywhere**: tarjetas `16–24px`, botones/badges/inputs `999px` (pill).
- **Sombras muy sutiles**: `0 1px 3px rgba(0,0,0,0.06)`, casi flat design.
- **Padding interno generoso** en cada tarjeta (mínimo `24px`), nunca apretado.
- **Iconografía**: line icons delgados y consistentes, dentro de contenedores cuadrados redondeados cuando acompañan datos.

### 6.8 Patrón de rayas diagonales (CSS)

Recurso visual recurrente para diferenciar series de datos sin agregar más colores.

```css
.stripe-pattern {
  background-image: repeating-linear-gradient(
    45deg,
    var(--stripe-color) 0px,
    var(--stripe-color) 2px,
    transparent 2px,
    transparent 6px
  );
}
```

---

## 7. Referencias Visuales

### Referencias principales

| App | Qué tomar | Por qué aplica a Kanbix |
|-----|-----------|--------------------------|
| **Dashboard tipo fintech (referencia de imagen)** | Paleta gris claro + blanco + acento grafito, tarjetas redondeadas, stat cards con badge de tendencia, patrón de rayas diagonales, sidebar con pill activo | Define la dirección visual actual del proyecto: dashboard limpio, denso en datos, con jerarquía numérica fuerte (ideal para métricas de sprint/velocity) |
| **Linear.app** | Layout sidebar + navbar, tipografía densa, shortcuts de teclado, estados de ticket | Estándar actual de herramientas de gestión modernas |
| **Notion** | Sidebar jerárquica, superficie limpia | Referencia de workspace sin sobrecarga visual |
| **GitHub Projects** | Columnas Kanban, chips de label, avatares de asignado | Misma audiencia técnica, misma función |

### Qué NO queremos

- ~~Trello~~: demasiado colorido, poco denso, orientado a no-técnicos
- ~~Jira~~: sobrecargado, anticuado, UX pesada
- ~~Asana~~: tipografía muy grande, desperdicio de espacio

### Principio de diseño Kanbix

> **"La información al frente, la UI al fondo."**
> El tablero y las métricas son el protagonista. La interfaz (tarjetas blancas, pills, rayas diagonales) existe para organizarlas con claridad, no para decorarlas.

---

## 8. Tokens CSS (referencia para desarrollo)

```css
:root {
  /* Colores base */
  --color-primary: #111827;
  --color-primary-hover: #1F2937;
  --color-brand: #6366F1;
  --color-bg: #F4F5F7;
  --color-surface: #FFFFFF;
  --color-border: #E5E7EB;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  --color-error: #DC2626;
  --color-error-bg: #FEE2E2;
  --color-warning: #D97706;
  --color-warning-bg: #FEF3C7;
  --color-success: #16A34A;
  --color-success-bg: #DCFCE7;
  --color-info: #2563EB;
  --color-info-bg: #DBEAFE;

  /* Acentos de categoría / columnas */
  --color-backlog: #94A3B8;
  --color-todo: #3B82F6;
  --color-in-progress: #F59E0B;
  --color-review: #8B5CF6;
  --color-done: #10B981;

  /* Tipografía */
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Radios */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 999px;

  /* Sombras */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-modal: 0 10px 25px rgba(0,0,0,0.12);

  /* Layout */
  --sidebar-width: 240px;
  --sidebar-collapsed: 64px;
  --navbar-height: 64px;
}

/* Modo oscuro */
[data-theme="dark"] {
  --color-bg: #0F172A;
  --color-surface: #1E293B;
  --color-border: #334155;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
  --color-brand: #818CF8;
}
```

---

## 9. Checklist de aprobación del equipo

- [ ] Paleta de colores — ¿grafito `#111827` como acción primaria + violeta `#6366F1` reservado para marca?
- [ ] Tipografía — ¿Plus Jakarta Sans con peso 800 para números grandes en stat cards?
- [ ] Layout — ¿topbar con búsqueda centrada + sidebar con pill activo grafito?
- [ ] Stat cards — ¿qué 4 métricas van en la fila superior? (propuesta: Tareas totales / Completadas / En progreso / Vencidas)
- [ ] Tarjeta de métrica destacada — ¿"Tasa de cumplimiento del sprint" o "Velocity" como protagonista?
- [ ] Patrón de rayas diagonales — ¿aprobado como recurso recurrente en gráficos y barras de progreso?
- [ ] Modo oscuro — ¿implementar desde el inicio o agregar en v2?

---

*Próximo paso sugerido: maquetar estos componentes (stat card, tarjeta de gráfico, tabla, panel de distribución) en Figma o directamente en código, antes de tocar las pantallas reales del tablero.