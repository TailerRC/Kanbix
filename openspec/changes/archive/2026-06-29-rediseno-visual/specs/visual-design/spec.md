# Visual Design

## ADDED Requirements

### Requirement: Tema MUI personalizado
El sistema SHALL aplicar un tema MUI personalizado con paleta violeta (`#6366F1` primario), tipografía Plus Jakarta Sans, border-radius 8px, y sombras definidas en `docs/diseno_visual.md`.

#### Scenario: Tema aplicado globalmente
- **WHEN** la aplicación carga cualquier página
- **THEN** los componentes MUI usan la paleta violeta, tipografía Plus Jakarta Sans, y border-radius 8px

#### Scenario: Tema sin errores de compilación
- **WHEN** se ejecuta `npx tsc --noEmit`
- **THEN** no hay errores de tipo en el archivo de tema

### Requirement: Layout no autenticado (AuthLayout)
El sistema SHALL mostrar un layout de dos paneles para login y registro: panel izquierdo violeta con branding ("Kanbix" + descripción), panel derecho con formulario centrado (max-width 400px). En móvil (< 768px) solo se muestra el formulario.

#### Scenario: Login en desktop muestra panel branding
- **WHEN** un usuario navega a `/login` en una pantalla ≥ 768px
- **THEN** se muestra un panel izquierdo violeta con "Kanbix" y una descripción

#### Scenario: Login en móvil oculta panel branding
- **WHEN** un usuario navega a `/login` en una pantalla < 768px
- **THEN** solo se muestra el formulario de login sin panel branding

### Requirement: Layout autenticado (AppLayout)
El sistema SHALL mostrar una sidebar izquierda (220px expandida, 56px colapsada) y una navbar superior (56px) para todas las páginas autenticadas. La sidebar incluye navegación (Tablero, Backlog, Sprint actual, Reportes), sección de proyectos, avatar del usuario y botón de cerrar sesión.

#### Scenario: Sidebar visible en desktop
- **WHEN** un usuario autenticado navega a cualquier ruta protegida en pantalla ≥ 1280px
- **THEN** se muestra la sidebar expandida (220px) con items de navegación

#### Scenario: Sidebar colapsa en tablet
- **WHEN** un usuario autenticado navega en una pantalla entre 768px y 1279px
- **THEN** la sidebar se muestra colapsada (56px) mostrando solo iconos

### Requirement: Modo oscuro
El sistema SHALL soportar modo oscuro y claro. La preferencia se persiste en `localStorage` y respeta `prefers-color-scheme` del SO en la primera visita.

#### Scenario: Modo oscuro por preferencia del SO
- **WHEN** un usuario visita por primera vez con `prefers-color-scheme: dark`
- **THEN** la aplicación carga en modo oscuro

#### Scenario: Persistencia de modo
- **WHEN** un usuario cambia de modo claro a oscuro y recarga la página
- **THEN** la aplicación mantiene el modo oscuro

### Requirement: LoginPage rediseñada
La página de login SHALL usar AuthLayout, incluir campo de email, campo de contraseña con toggle de visibilidad, botón "Ingresar" con icono, alerta de error, y enlace a registro.

#### Scenario: Login exitoso redirige a dashboard
- **WHEN** un usuario ingresa credenciales válidas y envía el formulario
- **THEN** es redirigido a `/` y se muestra el AppLayout

#### Scenario: Error de login muestra alerta
- **WHEN** un usuario ingresa credenciales inválidas
- **THEN** se muestra una alerta de error con el mensaje del backend

### Requirement: RegisterPage rediseñada
La página de registro SHALL usar AuthLayout, incluir campo de nombre completo, email, contraseña con helper text de validación, toggle de visibilidad, botón "Registrarse" con icono, alerta de error, y enlace a login.

#### Scenario: Registro exitoso redirige a login
- **WHEN** un usuario completa el registro exitosamente
- **THEN** es redirigido a `/login` con un mensaje de éxito

#### Scenario: Error de registro muestra alerta
- **WHEN** un usuario ingresa un email ya registrado
- **THEN** se muestra una alerta de error con el mensaje del backend

### Requirement: Skill sdd-visual-design
El sistema SHALL incluir una skill `sdd-visual-design` en `.opencode/skills/`, `.claude/skills/` y `.agents/skills/` que cargue `docs/diseno_visual.md` y verifique que los componentes frontend sigan el sistema de diseño.

#### Scenario: Skill existe en las 3 ubicaciones
- **WHEN** se inspecciona el proyecto
- **THEN** existe `sdd-visual-design/SKILL.md` en `.opencode/skills/`, `.claude/skills/` y `.agents/skills/`

#### Scenario: Skill referencia diseno_visual.md
- **WHEN** se lee la skill
- **THEN** instruye leer `docs/diseno_visual.md` antes de codificar frontend

### Requirement: docs/diseno_visual.md documentado
La documentación del sistema SHALL incluir `docs/diseno_visual.md` con paleta de colores, tipografía, layout, logo, modo oscuro y tokens de diseño.

#### Scenario: Archivo existe en docs/
- **WHEN** se lista `docs/`
- **THEN** existe `docs/diseno_visual.md`

#### Scenario: Contiene paleta de colores
- **WHEN** se lee `docs/diseno_visual.md`
- **THEN** incluye una tabla de colores con rol, nombre y Hex

### Requirement: AGENTS.md actualizado
El archivo `AGENTS.md` SHALL incluir una sección "Cómo ejecutar el proyecto" (backend + frontend), y referenciar el diseño visual en la metodología SDD y la tabla de skills.

#### Scenario: Guía de ejecución presente
- **WHEN** se lee `AGENTS.md`
- **THEN** incluye una sección "1b. Cómo Ejecutar el Proyecto"

#### Scenario: Skills de diseño referenciadas
- **WHEN** se lee `AGENTS.md`
- **THEN** las secciones 4 y 5 referencian `sdd-visual-design` y `docs/diseno_visual.md`
