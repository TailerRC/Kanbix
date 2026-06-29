---
name: sdd-visual-design
description: >
  Sistema de diseño visual de Kanbix. Se activa SIEMPRE antes de codificar
  cualquier módulo con componentes frontend en kanban-frontend/src/features/*,
  o cuando se discute UI, componentes, layout o estilos visuales.
---

# sdd-visual-design — Diseño Visual Kanbix

## Regla de Oro

> **No escribas código frontend sin haber leído `docs/diseno_visual.md`.**

El diseño visual está documentado y es la fuente de verdad para colores, tipografía, layout y componentes. Si hay duda entre el código y el doc, el doc gana.

---

## Pasos Obligatorios

Antes de codificar o modificar cualquier componente frontend:

1. **Leer `docs/diseno_visual.md`** — entender paleta de colores, tipografía, layout general, modo oscuro/claro y tokens de diseño.
2. **Verificar que el tema MUI** (`src/shared/theme/theme.ts`) esté actualizado con los valores del doc.
3. **Aplicar los tokens CSS** (`--color-*`, `--font-*`, `--radius-*`, `--shadow-*`, `--sidebar-*`, `--navbar-*`) definidos en `docs/diseno_visual.md` § 7.
4. **Respetar el layout general** definido en `docs/diseno_visual.md` § 3 (sidebar + navbar para páginas autenticadas, AuthLayout para login/register).
5. **Soportar modo oscuro** usando el toggle via `data-theme` o el ThemeProvider de MUI.

---

## Resumen Visual Rápido

| Elemento | Valor |
|----------|-------|
| Color primario | `#6366F1` (light) / `#818CF8` (dark) |
| Tipografía | Plus Jakarta Sans (sans) + JetBrains Mono (mono) |
| Layout autenticado | Sidebar (220px) + Navbar (56px) + contenido |
| Layout auth | Panel izquierdo violeta + formulario derecho |
| Modo oscuro | Soportado con toggle + localStorage |
| Radius | `8px` (md) / `12px` (lg) |
| Sombra card | `0 1px 3px rgba(0,0,0,0.08)` |

---

## Componentes Disponibles

### Layouts (en `src/shared/layout/`)

| Componente | Uso |
|------------|-----|
| `AuthLayout` | Login, Register y cualquier página no autenticada |
| `AppLayout` | Sidebar + Navbar + contenido para páginas autenticadas |

### Tema (en `src/shared/theme/`)

| Archivo | Contenido |
|---------|-----------|
| `theme.ts` | `lightTheme` y `darkTheme` listos para MUI ThemeProvider |

---

## Referencia

- Documento completo: `docs/diseno_visual.md`
- Tema MUI: `kanban-frontend/src/shared/theme/theme.ts`
- Layouts: `kanban-frontend/src/shared/layout/AuthLayout.tsx`, `kanban-frontend/src/shared/layout/AppLayout.tsx`
