*Requerimientos No Funcionales (RNF) - Sistema Kanbix*

| **Id. RNF** | **Nombre del Requerimiento no funcional** | **Descripción** |
| --- | --- | --- |
| RNF-01 | Lenguaje de Interfaz | El sistema debe utilizar terminología técnica ágil estándar, incluyendo conceptos como Sprints, Backlog, Story Points, roles (Scrum Master) y columnas Kanban. |
| RNF-02 | Concurrencia de Usuarios | El backend debe soportar la operación simultánea de múltiples equipos de desarrollo concurrentes consultando métricas y actualizando estados en tiempo real. |
| RNF-03 | Disponibilidad de Sistema | La plataforma debe garantizar una disponibilidad del 99.5% bajo entornos cloud en Vercel y Railway las 24 horas del día. |
| RNF-04 | Compatibilidad Multiplataforma | El sistema web debe ser totalmente responsivo, compatible con navegadores modernos (Chrome, Firefox, Edge, Safari) y pantallas móviles. |
| RNF-05 | Seguridad | El sistema debe exigir tokens JWT con expiración automática, contraseñas cifradas mediante bcrypt y bloqueo temporal tras 5 intentos fallidos. |
| RNF-06 | Usabilidad e Interactividad | La interfaz debe ofrecer actualizaciones asíncronas en tiempo real vía WebSockets, tableros con arrastrar y soltar fluido, y gráficos legibles. |
| RNF-07 | Rendimiento | El backend debe responder a la carga de tableros y cálculos analíticos en menos de 1.5 segundos mediante pipelines de agregación asíncronos. |
| RNF-08 | Escalabilidad del Software | La arquitectura en capas debe permitir futuras integraciones externas con repositorios de código como GitHub o herramientas de gestión como Jira. |
