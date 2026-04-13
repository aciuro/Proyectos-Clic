# Plan De Limpieza Del Repo De Kinesiologia

## Objetivo

Dejar una sola ruta canonica para la app web de kinesiologia, reducir duplicados, aclarar que corre realmente en Railway y preparar el proyecto para seguir agregando features sin confusiones.

## Diagnostico actual

Hoy el repo mezcla al menos tres capas:

- `src/` + `client/` como ruta canonica documentada para la app web.
- `kinesiologia/` como snapshot o copia de trabajo documentada.
- legado del bot de WhatsApp / Google Sheets en el mismo repositorio.

Esto genera riesgo real de editar archivos que no impactan la app que se ve en produccion.

## Objetivo tecnico concreto

1. Definir una sola app web viva.
2. Confirmar un solo entrypoint para backend y frontend.
3. Confirmar un solo flujo de build y deploy.
4. Mover o archivar todo lo duplicado.
5. Actualizar documentacion para que coincida con la realidad.

## Decision propuesta

### Ruta canonica funcional

Mantener como ruta canonica:

- `src/`
- `client/`

### Ruta legacy / snapshot

Tratar `kinesiologia/` como una de estas dos opciones:

- opcion A: snapshot archivado y de solo referencia
- opcion B: fuente temporal de migracion hasta copiar lo util a la ruta canonica

Mientras no se termine la migracion, no deberian hacerse features nuevas en `kinesiologia/`.

## Fases del trabajo

## Fase 1 - Inventario y congelamiento

### Acciones

- listar archivos clave en `src/`, `client/` y `kinesiologia/`
- marcar cuales son usados por Railway hoy
- marcar cuales son usados por el backend principal hoy
- congelar cambios en la carpeta duplicada salvo migraciones necesarias

### Entregable

- mapa corto de archivos: canonicos, legacy, dudosos

## Fase 2 - Unificacion del entrypoint

### Acciones

- confirmar que `src/index.js` es el servidor principal
- confirmar desde donde se sirve `client/dist`
- confirmar si Railway corre la app desde root o desde `kinesiologia/`
- dejar documentado un solo entrypoint operativo

### Resultado esperado

- que editar `client/src/kine/*` impacte siempre en la app real

## Fase 3 - Migracion de codigo util desde `kinesiologia/`

### Acciones

- revisar que cambios de PostgreSQL / Railway existen solo en `kinesiologia/`
- copiar a la ruta canonica solamente lo necesario
- evitar copiar basura o snapshots completos

### Resultado esperado

- que la ruta canonica tenga todo lo necesario para correr local y en Railway

## Fase 4 - Limpieza de frontend

### Acciones

- unificar el layout admin en la ruta canonica
- unificar el portal paciente en la ruta canonica
- revisar imports para que no apunten a copias
- dejar una sola implementacion para cada pantalla principal

### Pantallas a priorizar

- `KineApp.jsx`
- `Dashboard.jsx`
- `PortalPaciente.jsx`
- `Ejercicios.jsx`
- `Agenda.jsx`
- `PacienteDetalle.jsx`

## Fase 5 - Limpieza de backend y DB

### Acciones

- revisar diferencias entre `src/kine-db.js` y `kinesiologia/kine-db.js`
- llevar la compatibilidad real de base de datos a una sola implementacion
- revisar paths de uploads para usar una sola estrategia con `DATA_DIR`
- revisar seeds destructivos de ejercicios

### Resultado esperado

- una sola capa de persistencia mantenible

## Fase 6 - Railway y deploy

### Acciones

- dejar un solo `Dockerfile` valido para la app real
- confirmar variables requeridas
- probar build limpio
- probar persistencia despues de redeploy

## Fase 7 - Archivo o eliminacion de duplicados

### Opcion conservadora

- mover `kinesiologia/` a `legacy/kinesiologia_snapshot/`
- dejar un README adentro explicando que es una referencia historica

### Opcion agresiva

- eliminar `kinesiologia/` despues de validar que nada de produccion la usa

## Fase 8 - Documentacion final

### Acciones

- reescribir `README.md`
- actualizar la guia del proyecto
- dejar instrucciones de desarrollo y deploy reales

## Riesgos principales

- romper Railway si hoy depende de archivos dentro de `kinesiologia/`
- romper PostgreSQL si la compatibilidad real quedo solo en el snapshot
- tocar el frontend equivocado y creer que no funciona
- mantener seeds destructivos y perder datos reales

## Orden recomendado de ejecucion

1. confirmar entrypoint real y deploy real
2. comparar `src/` vs `kinesiologia/`
3. mover cambios utiles a la ruta canonica
4. cambiar app para usar solo la ruta canonica
5. archivar o eliminar duplicados
6. recien despues seguir con rediseño y features nuevas

## Criterio de cierre

El repo se considera limpio cuando:

- existe una sola ruta oficial para frontend y backend web
- Railway deploya desde esa misma ruta
- la documentacion coincide con lo que realmente corre
- no hay copias activas de `KineApp`, DB o rutas web en carpetas paralelas
- cualquier cambio visual en la ruta canonica se refleja en la app real
