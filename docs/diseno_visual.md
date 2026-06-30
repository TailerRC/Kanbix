# Diseño Visual — Kanbix

> Documento generado por Claude · Versión 1.0 · Para revisión del equipo

---

## 1. Paleta de Colores

La paleta se basa en un violeta profundo como color primario (moderno, diferente al azul corporativo de Jira/Linear, y con buena legibilidad). Los estados semánticos usan colores estándar para reducir la curva de aprendizaje.

| Rol | Nombre | Hex |
|-----|--------|-----|
| Primario (brand) | Violeta Kanbix | `#6366F1` |
| Primario hover | Violeta profundo | `#4F46E5` |
| Secundario | Lavanda suave | `#EEF2FF` |
| Background (fondo general) | Gris frío | `#F8FAFC` |
| Surface (tarjetas, contenedores) | Blanco | `#FFFFFF` |
| Borde general | Gris línea | `#E2E8F0` |
| Texto primario | Gris carbón | `#0F172A` |
| Texto secundario | Gris medio | `#64748B` |
| Texto muted | Gris claro | `#94A3B8` |
| Error | Rojo | `#EF4444` |
| Error (fondo) | Rojo suave | `#FEF2F2` |
| Warning | Ámbar | `#F59E0B` |
| Warning (fondo) | Ámbar suave | `#FFFBEB` |
| Success | Verde | `#10B981` |
| Success (fondo) | Verde suave | `#ECFDF5` |
| Info | Azul | `#3B82F6` |
| Info (fondo) | Azul suave | `#EFF6FF` |

### Colores de columnas Kanban

| Columna | Color dot | Hex |
|---------|-----------|-----|
| Backlog | Gris | `#94A3B8` |
| Por hacer | Azul | `#3B82F6` |
| En progreso | Ámbar | `#F59E0B` |
| Revisión / QA | Violeta | `#6366F1` |
| Completado | Verde | `#10B981` |

### Prioridad de tarjetas (borde izquierdo)

| Nivel | Color | Hex |
|-------|-------|-----|
| Alta | Rojo | `#EF4444` |
| Media | Ámbar | `#F59E0B` |
| Baja | Azul | `#3B82F6` |
| Sin definir | Borde estándar | `#E2E8F0` |

---

## 2. Tipografía

- **Fuente principal**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
  - Pesos usados: `400` (texto cuerpo), `500` (labels, subtítulos), `600` (títulos de sección), `700` (headings principales)
  - Por qué: moderna, geométrica sin ser fría, excelente legibilidad a tamaños pequeños (ideal para tarjetas Kanban con texto denso), y diferente del Inter que usan Notion/Linear

- **Fuente monospace** (para IDs de ticket, snippets de código): [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
  - Peso: `400`
  - Por qué: está en Google Fonts, es legible a 11–12px, y refuerza el perfil técnico de Kanbix

### Escala tipográfica

| Rol | Tamaño | Peso | Uso |
|-----|--------|------|-----|
| Display | 24px | 700 | Títulos de página |
| Heading 1 | 20px | 600 | Títulos de sección |
| Heading 2 | 16px | 600 | Títulos de columna |
| Body | 14px | 400 | Texto de tarjetas |
| Label | 13px | 500 | Metadata, badges |
| Caption | 11px | 400 | IDs de ticket, timestamps |
| Mono | 12px | 400 | IDs, código |

### Import para el proyecto

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap');
```

```css
:root {
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

---

## 3. Layout General

**Opción elegida: Ambos — sidebar izquierda + navbar superior** (tipo Slack/Notion)

### Justificación

- La **sidebar izquierda** aloja la navegación entre proyectos/equipos y persiste siempre visible. En un Kanban esto es crítico: el usuario necesita cambiar de proyecto sin perder contexto.
- La **navbar superior** contiene acciones del contexto actual: nombre del sprint, filtros, búsqueda, avatar del usuario, notificaciones.
- Esta combinación permite escalar la app sin sacrificar espacio en el tablero.

### Estructura de zonas

```
┌──────────────────────────────────────────────────────────┐
│  NAVBAR  │ Kanbix    Sprint 7 ▾   [Filtros] [+ Historia] │ 56px
├──────────┼───────────────────────────────────────────────┤
│          │                                               │
│ SIDEBAR  │            ÁREA DE CONTENIDO                  │
│          │                                               │
│ 220px    │        (tablero, backlog, reportes)           │
│          │                                               │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

### Sidebar — items de navegación

```
Kanbix (logo)
────────────
▸ Tablero
▸ Backlog
▸ Sprint actual
▸ Reportes
────────────
PROYECTOS
  + Kanbix v2
  + Mezzanine
────────────
  [avatar] Gianfranco
  Configuración
```

### Comportamiento responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| ≥ 1280px | Sidebar expandida (220px) + contenido |
| 768–1279px | Sidebar colapsada (iconos 56px) + contenido |
| < 768px | Sidebar oculta, navbar con hamburger menu |

---

## 4. Logo / Marca

### Decisiones

- **Tipo**: Ícono + texto ("Kanbix")
- **Ícono**: Una `K` estilizada con el trazo diagonal convertido en una línea de progreso (→), sugiriendo movimiento de izquierda a derecha como las tarjetas en un tablero Kanban. Alternativa más simple: tres barras verticales de alturas distintas (representando columnas del tablero).
- **Texto**: `Kanbix` — sentence case, nunca todo mayúsculas
- **Color del logo**:
  - Sobre fondo claro: violeta primario `#6366F1`
  - Sobre fondo oscuro (sidebar oscura, splash): blanco `#FFFFFF`
  - Versión monocromática disponible para documentos

### Variantes

| Variante | Uso |
|----------|-----|
| Logo completo (ícono + "Kanbix") | Sidebar expandida, landing page |
| Solo ícono | Sidebar colapsada, favicon, app icon |
| Solo texto | Navbar si el ícono ya está visible |

### Tratamiento tipográfico del nombre

- Fuente: Plus Jakarta Sans 700
- Tracking: `letter-spacing: -0.02em` (apretado, más moderno)
- `Kanbix` — no `KANBIX`, no `kanbix`

---

## 5. Modo Oscuro / Claro

**Opción elegida: Ambos modos con toggle**

### Justificación

El público objetivo son desarrolladores que trabajan en entornos oscuros. Forzar solo modo claro reduciría la percepción de calidad del producto. El costo de implementación con Tailwind CSS es mínimo si se configura desde el inicio con `darkMode: 'class'`.

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
| Primario (brand) | `#818CF8` (violeta más claro para contraste) |
| Primario hover | `#6366F1` |

> Los colores semánticos (error, warning, success, info) mantienen los mismos Hex; solo cambia el fondo del badge/chip.

### Implementación sugerida (Tailwind)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

```jsx
// Toggle en navbar
<button onClick={() => document.documentElement.classList.toggle('dark')}>
  {isDark ? <SunIcon /> : <MoonIcon />}
</button>
```

### Persistencia

Guardar preferencia en `localStorage` y respetar `prefers-color-scheme` en la primera visita.

---

## 6. Referencias Visuales

### Referencias principales

| App | Qué tomar | Por qué aplica a Kanbix |
|-----|-----------|--------------------------|
| **Linear.app** | Layout sidebar + navbar, tipografía densa, shortcuts de teclado, estados de ticket | Es el estándar actual de herramientas de gestión modernas. Kanbix debería sentirse en esa liga. |
| **Notion** | Sidebar jerárquica, superficie limpia, fondo casi blanco | Referencia de cómo hacer un workspace sin sobrecarga visual. |
| **GitHub Projects** | Columnas Kanban, chips de label, avatares de asignado | Misma audiencia técnica, misma función. |
| **Vercel Dashboard** | Uso del violeta/azul sobre fondo muy claro, cards con borde sutil | Paleta similar a la elegida. Demuestra que el violeta funciona en dashboards. |

### Qué NO queremos

- ~~Trello~~: Demasiado colorido, poco denso, orientado a no-técnicos
- ~~Jira~~: Sobrecargado, anticuado, UX pesada
- ~~Asana~~: Tipografía muy grande, desperdicio de espacio

### Principio de diseño Kanbix

> **"La información al frente, la UI al fondo."**
> El tablero es el protagonista. La interfaz existe para servirlo, no para decorarlo.

---

## 7. Componentes clave (tokens de referencia para desarrollo)

```css
:root {
  /* Colores */
  --color-primary: #6366F1;
  --color-primary-hover: #4F46E5;
  --color-secondary: #EEF2FF;
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-text-primary: #0F172A;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  --color-success: #10B981;
  --color-info: #3B82F6;

  /* Tipografía */
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Espaciado */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Sombras */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-modal: 0 10px 25px rgba(0,0,0,0.12);

  /* Layout */
  --sidebar-width: 220px;
  --sidebar-collapsed: 56px;
  --navbar-height: 56px;
}

/* Modo oscuro */
[data-theme="dark"] {
  --color-bg: #0F172A;
  --color-surface: #1E293B;
  --color-border: #334155;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
  --color-primary: #818CF8;
}
```

---

## 8. Checklist de aprobación del equipo

Antes de iniciar la implementación, el equipo debe revisar y aprobar:

- [ ] Paleta de colores — ¿el violeta `#6366F1` como brand?
- [ ] Tipografía — ¿Plus Jakarta Sans está bien o prefieren Inter/Poppins?
- [ ] Layout — ¿sidebar + navbar o solo navbar?
- [ ] Logo — ¿ícono + texto o solo texto por ahora?
- [ ] Modo oscuro — ¿implementar desde el inicio o agregar en v2?
- [ ] ¿Alguna referencia visual adicional del equipo?

---

*Próximo paso sugerido: diseño de componentes atómicos (botones, badges, inputs, cards) en Figma o directamente en código con Storybook.*
