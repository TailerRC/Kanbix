---
name: sdd-visual-design
description: >
  Sistema de diseño visual de Kanbix + Heurísticas de usabilidad Nielsen.
  Se activa SIEMPRE antes de codificar cualquier módulo con componentes
  frontend en kanban-frontend/src/features/*, o cuando se discute UI,
  componentes, layout o estilos visuales.
---

# sdd-visual-design — Diseño Visual + Usabilidad Kanbix

## Skills Requeridas

Esta skill DEBE cargarse junto con `nielsen-heuristics` para garantizar
que el diseño visual cumpla también con principios de usabilidad.

Antes de empezar, cargar:
1. **`nielsen-heuristics`** — 10 heurísticas de usabilidad de Jakob Nielsen
2. **Este archivo (`sdd-visual-design`)** — diseño visual de Kanbix

---

## Regla de Oro

> **No escribas código frontend sin haber leído `docs/diseno_visual.md`**
> **y sin verificar contra las heurísticas de Nielsen.**

El diseño visual y la usabilidad están documentados y son la fuente de verdad.

---

## Pasos Obligatorios

Antes de codificar o modificar cualquier componente frontend:

1. **Cargar la skill `nielsen-heuristics`** — tener presentes las 10 heurísticas.
2. **Leer `docs/diseno_visual.md`** — entender paleta, tipografía, layout, modo oscuro y tokens.
3. **Verificar que el tema MUI** (`src/shared/theme/theme.ts`) esté actualizado.
4. **Aplicar los tokens CSS** (`--color-*`, `--font-*`, `--radius-*`, etc.) de `docs/diseno_visual.md` § 7.
5. **Respetar el layout general** (AuthLayout para login/register, AppLayout para auth).
6. **Soportar modo oscuro** via ThemeProvider + `data-theme`.
7. **Evaluar cada componente nuevo** contra las heurísticas de Nielsen:
   - ¿El estado del sistema es visible? (H1)
   - ¿Usa lenguaje del usuario, no técnico? (H2)
   - ¿El usuario tiene control y libertad para deshacer? (H3)
   - ¿Es consistente con el resto de la interfaz? (H4)
   - ¿Previene errores antes de que ocurran? (H5)
   - ¿Reconoce en vez de obligar a recordar? (H6)
   - ¿Es eficiente para usuarios avanzados? (H7)
   - ¿El diseño es estético y minimalista? (H8)
   - ¿Los errores son claros y ayudan a recuperarse? (H9)
   - ¿Hay ayuda y documentación accesible? (H10)

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

- Diseño visual completo: `docs/diseno_visual.md`
- Heurísticas de usabilidad: skill `nielsen-heuristics`
- Tema MUI: `kanban-frontend/src/shared/theme/theme.ts`
- Layouts: `kanban-frontend/src/shared/layout/`
