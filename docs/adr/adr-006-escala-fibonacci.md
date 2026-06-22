# ADR-006: Escala Fibonacci para estimación de story points

**Estado:** Aceptado · **Fecha:** 2026-06-21

---

## Contexto

El Módulo 4 requiere estimar el esfuerzo de las tareas usando story points. Alternativas:

- **Escala lineal**: 1, 2, 3, 4, 5...
- **Escala Fibonacci**: 1, 2, 3, 5, 8, 13
- **T-shirt sizing**: XS, S, M, L, XL
- **Horas/días**: estimación en tiempo real

## Decisión

Se usa **escala Fibonacci (1, 2, 3, 5, 8, 13)** para story points, con validación en el backend (422 si el valor no está en la escala).

## Consecuencias

### Positivas
- La distancia creciente entre números refleja la incertidumbre natural: a mayor tamaño, menos precisión tenemos
- Desalienta discusiones sobre si es 4 o 5 (la escala salta de 3 a 5)
- Estándar en metodologías ágiles (Scrum), alineado con la terminología del proyecto
- Previene sobre-análisis en tareas grandes (si es >13, hay que dividir la tarea)

### Negativas
- El equipo necesita entender la escala (no es intuitiva para nuevos miembros)
- La validación en backend agrega una regla de negocio más (cada tarea debe tener story_points en {1,2,3,5,8,13})
- Las tareas muy pequeñas (menos de 1) o muy grandes (más de 13) no se pueden estimar directamente
