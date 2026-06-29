## 1. Documentación de diseño visual

- [x] 1.1 Crear `docs/diseno_visual.md` con paleta de colores, tipografía, layout, modo oscuro y tokens de diseño
- [x] 1.2 Actualizar `docs/README.md` para incluir `diseno_visual.md` en el índice

## 2. Tema MUI

- [x] 2.1 Crear `src/shared/theme/theme.ts` con `lightTheme` y `darkTheme` (paleta, tipografía, componentes)
- [x] 2.2 Agregar Google Fonts en `index.html` (Plus Jakarta Sans + JetBrains Mono)
- [x] 2.3 Instalar `lucide-react` para iconografía

## 3. Layouts reutilizables

- [x] 3.1 Crear `src/shared/layout/AuthLayout.tsx` (panel violeta + formulario)
- [x] 3.2 Crear `src/shared/layout/AppLayout.tsx` (sidebar 220px + navbar 56px + contenido)

## 4. Integración en la app

- [x] 4.1 Agregar ThemeProvider + CssBaseline + modo oscuro en `App.tsx`
- [x] 4.2 Envolver rutas protegidas con AppLayout

## 5. Rediseño de páginas de auth

- [x] 5.1 Rediseñar `LoginPage.tsx` con AuthLayout, iconos, toggle de contraseña
- [x] 5.2 Rediseñar `RegisterPage.tsx` con AuthLayout, iconos, toggle de contraseña

## 6. Skills y documentación de agente

- [x] 6.1 Crear skill `sdd-visual-design` en `.opencode/skills/`, `.claude/skills/` y `.agents/skills/`
- [x] 6.2 Actualizar `sdd-docs` en las 3 ubicaciones para referenciar diseño visual y `sdd-visual-design`
- [x] 6.3 Actualizar `AGENTS.md` con guía de ejecución + referencia a diseño visual

## 7. Verificación

- [x] 7.1 Verificar que `npx tsc --noEmit` compila sin errores
- [x] 7.2 Test visual con Playwright: login page, register page, flujo completo, dashboard con sidebar
