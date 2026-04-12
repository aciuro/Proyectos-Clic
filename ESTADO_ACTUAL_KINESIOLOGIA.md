# Estado Actual De Kinesiologia

Este documento resume, en orden simple, que se hizo en el proyecto y como esta funcionando hoy.

La idea es que la siguiente persona que entre no tenga que reconstruir toda la historia.

## 1. Que quedo funcionando

- El modulo web de kinesiologia levanta en Railway.
- La conexion a PostgreSQL de Railway funciona.
- El dashboard carga en la URL publica.
- El sistema crea el admin por defecto si no existe.
- El seed de ejercicios corre correctamente en el arranque.

## 2. Que se hizo en esta tanda

### Paso 1: documentar el mapa del proyecto

- Se agrego `GUIA_PROYECTO_KINESIOLOGIA.md`.
- La guia explica que parte del repo esta viva.
- La guia marca que `src/` y `client/` son la ruta canonica.
- La carpeta `kinesiologia/` quedo documentada como snapshot de trabajo y no como entrypoint principal.

### Paso 2: preparar el subproyecto `kinesiologia` para PostgreSQL

- Se agrego `pg` en `kinesiologia/package.json`.
- Se genero `kinesiologia/package-lock.json`.
- Se creo `kinesiologia/pg-sync.js`.
- Se creo `kinesiologia/pg-sync-worker.js`.
- Se adapto `kinesiologia/kine-db.js` para que use PostgreSQL cuando existe `DATABASE_URL`.

### Paso 3: corregir el schema para Postgres

- Se ordeno la creacion de tablas para que primero existan `usuarios` y `pacientes`.
- Luego se crean `lesiones`, `sesiones`, `ejercicios` y `paciente_ejercicios`.
- Despues se crean `motivos`, `evoluciones`, `estudios`, `turnos` y `documentos`.
- Se alinearon nombres que estaban desparejos:
  - `pagado`
  - `tecnicas_sesion`
  - `ejercicios_sesion`
  - `fecha_desde`
  - `imagen_url`
  - `descripcion` en lesiones

### Paso 4: arreglar el build de Railway

- Se actualizo `Dockerfile`.
- Ahora el build instala dependencias en el root.
- Tambien instala dependencias dentro de `kinesiologia/`.
- Eso resolvio el error de `Cannot find module 'pg'` dentro del contenedor.

### Paso 5: validar en Railway

- Se entro con `railway ssh -s kinesiologia`.
- Se verifico que `DATABASE_URL` estaba presente dentro del contenedor.
- Se ejecuto `require('./kine-db.js')`.
- Se confirmo que el esquema carga.
- Se confirmo que el admin se crea.
- Se confirmo que el seed de ejercicios termina.
- Se abrio la app en el navegador y el dashboard cargo sin errores.

## 3. Commits importantes

- `ff26794` - `feat: cerrar compatibilidad postgres en kinesiologia`
- `33f3284` - `fix: instalar dependencias de kinesiologia en la imagen`
- `20342b9` - `fix: ordenar schema postgres de kinesiologia`
- `0935b5a` - `feat: redisenar portal paciente responsive`
- `9c5f83d` - `feat: cambiar navegacion del portal paciente a Perfil/Turnos/Rutina/Saldo`

## 4. Como esta armado hoy

- El backend principal vive en `src/index.js`.
- La API de kinesiologia vive en `src/kine-routes.js`.
- El esquema SQLite original sigue en `src/kine-db.js`.
- El snapshot de trabajo de kinesiologia quedo en `kinesiologia/`.
- Railway usa el contenedor construido por `Dockerfile`.
- El volumen persistente sigue montado en `/data`.

## 5. Como verificar el sistema

### Local

```bash
node -e "require('./kinesiologia/kine-db.js'); console.log('kine-db ok')"
```

### Railway

```bash
railway ssh -s kinesiologia
cd /app/kinesiologia
node -e "require('./kine-db.js'); console.log('kine-db ok')"
```

### Verificaciones utiles

- Abrir el dashboard publico.
- Crear un paciente de prueba.
- Confirmar que queda guardado despues de un redeploy.
- Revisar que el portal de paciente siga abriendo bien.

## 6. Riesgos y notas

- El seed de ejercicios corre al arrancar el modulo.
- El admin por defecto se crea si no existe.
- Si se quiere cambiar la base a otra estrategia, conviene revisar primero `kinesiologia/kine-db.js`.
- Si se toca Docker, hay que recordar que Railway construye la imagen desde ese archivo.

## 7. Para seguir sin perder contexto

- Leer primero `GUIA_PROYECTO_KINESIOLOGIA.md`.
- Luego revisar este archivo.
- Si vas a tocar el modulo web, priorizar `src/` y `client/`.
- Si vas a tocar la version de trabajo de kinesiologia, revisar `kinesiologia/`.

