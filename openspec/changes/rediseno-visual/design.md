## Context

Kanbix usa MUI v9 como librería de componentes, pero sin personalización de tema: los colores, tipografía y espaciado son los defaults de Material UI. Las páginas de auth (login/register) son funcionales pero sin identidad visual. No existe un layout reutilizable para las páginas autenticadas. El proyecto no tiene modo oscuro.

El documento `docs/diseno_visual.md` ya fue creado y define: paleta violeta (`#6366F1`), tipografía Plus Jakarta Sans, layout sidebar+navbar (tipo Linear/Notion), modo oscuro y tokens CSS.

## Goals / Non-Goals

**Goals:**
- Tema MUI personalizado que refleje la paleta y tipografía de `docs/diseno_visual.md`
- Layout AuthLayout (panel violeta + formulario) para login/register
- Layout AppLayout (sidebar 220px + navbar 56px) para páginas autenticadas
- Modo oscuro con toggle, persistencia en localStorage y respeto a `prefers-color-scheme`
- Rediseño de LoginPage y RegisterPage usando AuthLayout
- Iconografía con lucide-react
- Skill sdd-visual-design para que futuros módulos apliquen el diseño

**Non-Goals:**
- Rediseño del dashboard (Home) — se deja con layout base pero sin contenido real
- Componentes atómicos (botones personalizados, badges, inputs) — se usa MUI con tema
- Animaciones o transiciones avanzadas
- Implementación del toggle de modo oscuro en la UI (solo infraestructura)

## Decisions

| Decisión | Opción elegida | Alternativas consideradas | Razón |
|----------|---------------|--------------------------|-------|
| Paleta | Violeta `#6366F1` | Azul corporativo (Jira/Linear) | Diferenciación visual, buena legibilidad, moderno |
| Tipografía | Plus Jakarta Sans | Inter (Linear), Poppins | Moderna, legible a tamaños pequeños, menos usada |
| Iconos | lucide-react | MUI Icons, Heroicons | Más moderna, tree-shakeable, misma vibra que Linear |
| Layout auth | Panel violeta + formulario | Formulario centrado solamente | Identidad visual desde el primer contacto |
| Layout app | Sidebar + Navbar | Solo navbar, solo sidebar | Sidebar para navegación persistente entre proyectos, navbar para contexto actual |
| Modo oscuro | ThemeProvider + localStorage | Solo CSS class | MUI ThemeProvider ya maneja paletas dark/light nativamente |
| Persistencia tema | localStorage + prefers-color-scheme | Solo localStorage | Mejor UX en primera visita (respeta preferencia del SO) |
| Mecanismo de toggle | `window.__toggleTheme()` | Context de React | Provisional hasta que se implemente el toggle UI en la navbar |

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| `lucide-react` agrega dependencia externa | Son iconos ligeros, tree-shakeable con Vite |
| Sidebar fija de 220px puede ser angosta en pantallas chicas | Colapsable a 56px (tablet) y oculta con hamburger (<768px) |
| Modo oscuro requiere verificar contraste en todos los colores semánticos | Los colores semánticos (error, warning, success) mantienen el mismo Hex en ambos modos; solo cambia el fondo del contenedor |
