# ADR-001: SDD como metodología de desarrollo

**Estado:** Aceptado · **Fecha:** 2026-06-21

---

## Contexto

El curso exige una metodología estructurada que garantice trazabilidad entre especificación e implementación. Las alternativas consideradas fueron:

- **Code-first**: escribir código primero y generar documentación después (ej: FastAPI generate OpenAPI)
- **TDD (Test-Driven Development)**: escribir pruebas primero, después código
- **SDD (Spec-Driven Development)**: escribir especificaciones formales primero, después código

## Decisión

Se adopta **SDD** como metodología central. El orden de los artefactos es:

```
Reglas de negocio → Requerimientos funcionales → Casos de uso → Contratos API → Código
```

Cada fase produce artefactos que la siguiente consume. El código es el *último* eslabón. FastAPI genera OpenAPI automáticamente desde el código, pero ese OpenAPI es un *byproduct* de verificación, no la especificación fuente.

## Consecuencias

### Positivas
- Total trazabilidad: cada endpoint se rastrea a un contrato, un caso de uso y una regla de negocio
- El equipo puede revisar y aprobar especificaciones antes de escribir una línea de código
- La IA (OpenCode) puede consumir los markdowns directamente como spec para generar código consistente

### Negativas
- Más trabajo upfront antes de ver código funcionando
- Si una especificación cambia, hay que actualizar los artefactos anteriores antes de tocar código
- El equipo necesita disciplina para no saltarse fases
