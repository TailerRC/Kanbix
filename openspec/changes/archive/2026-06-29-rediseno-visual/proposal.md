## Why

El login y registro de Kanbix utilizan MUI sin personalizar: fondo blanco genérico, botón azul por defecto, sin identidad visual. La app necesita un sistema de diseño profesional (paleta violeta, tipografía, layout sidebar+navbar, modo oscuro) antes de escalar a los módulos de tablero, proyectos y reportes.

## What Changes

- Crear tema MUI personalizado con paleta violeta Kanbix (`#6366F1`)
- Agregar tipografía Plus Jakarta Sans (sans) + JetBrains Mono (mono)
- Rediseñar LoginPage con panel lateral de branding y formulario centrado
- Rediseñar RegisterPage coherente con LoginPage
- Crear AuthLayout reutilizable para páginas no autenticadas
- Crear AppLayout con sidebar (220px, colapsable) + navbar (56px) para páginas autenticadas
- Agregar soporte de modo oscuro/claro con persistencia en localStorage y respeto a `prefers-color-scheme`
- Instalar lucide-react como sistema de iconografía
- Documentar el diseño visual en `docs/diseno_visual.md`
- Crear skill `sdd-visual-design` para que futuros módulos frontend apliquen el diseño

## Capabilities

### New Capabilities
- `visual-design`: Sistema de diseño visual de Kanbix (tema MUI, layout, modo oscuro)

### Modified Capabilities
- `user-auth`: LoginPage y RegisterPage rediseñadas con el nuevo sistema de diseño

## Impact

- **Frontend**: `src/shared/theme/theme.ts` (nuevo), `src/shared/layout/AuthLayout.tsx` (nuevo), `src/shared/layout/AppLayout.tsx` (nuevo), `src/App.tsx` (modificado con ThemeProvider + CssBaseline + modo oscuro), `src/features/auth/pages/LoginPage.tsx` (rediseñado), `src/features/auth/pages/RegisterPage.tsx` (rediseñado), `index.html` (Google Fonts + lang=es + title)
- **Dependencias**: +`lucide-react`
- **Docs**: +`docs/diseno_visual.md`
- **Skills**: +`.opencode/skills/sdd-visual-design/`, +`.claude/skills/sdd-visual-design/`, +`.agents/skills/sdd-visual-design/`
- **AGENTS.md**: actualizado con guía de ejecución y referencia a visual design
- **sdd-docs**: actualizado en las 3 ubicaciones para referenciar diseño visual
