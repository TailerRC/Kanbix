"""Modelo del Módulo 6.

Los reportes son de solo lectura: agregan datos de las colecciones `tasks`,
`sprints` y `projects`. No mantienen colección propia (salvo `reports` opcional
para snapshots de sprints cerrados, no requerido por los contratos actuales).
"""
# Mapeo de columnas por defecto a los buckets del reporte de carga (RN-20).
DONE_STATUSES = {"Done"}
IN_PROGRESS_STATUSES = {"In Progress", "In Review"}
TODO_STATUSES = {"Backlog", "To Do"}
