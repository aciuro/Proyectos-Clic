# RehabilitaPlus — Contexto integral del proyecto

Este documento resume el estado del proyecto, la intención clínica de la app, las decisiones de UX/UI y los cambios principales realizados. Está pensado para que cualquier persona externa pueda entrar al repositorio y entender rápidamente qué se está construyendo y por qué.

---

## 1. Qué es RehabilitaPlus

RehabilitaPlus es una aplicación web para uso clínico de kinesiología. Tiene dos experiencias principales:

1. **Portal profesional / kinesiólogo**
   - Lo usa el kinesiólogo para administrar pacientes, sesiones, rutinas clínicas, agenda, notas y cuenta.
   - Usuario profesional principal: `augustociuro@gmail.com`.

2. **Portal paciente**
   - Lo usa cada paciente para ver indicaciones, rutinas y seguimiento.
   - Todos los usuarios que no sean el kinesiólogo/admin deben entrar como pacientes, salvo que el backend indique otro rol.

La app está pensada para uso mobile-first: pacientes desde celular y kinesiólogo desde iPad o escritorio.

---

## 2. Regla de roles

Se agregó una regla explícita en el frontend:

- `augustociuro@gmail.com` se trata como kinesiólogo/profesional.
- Usuarios con `rol: admin` también entran al portal profesional.
- El resto entra al portal paciente.

Esto está en:

```txt
kinesiologia/client/src/kine/KineApp.jsx
```

---

## 3. Filosofía de diseño actual

La app se está llevando hacia un estilo:

- clínico moderno
- minimalista
- mobile-first
- tipo app, no panel web pesado
- con navegación inferior tanto para paciente como para profesional
- cards blancas, bordes suaves, sombras sutiles
- acento turquesa/verde azulado
- flujo simple y rápido para uso real en consultorio

Se agregó una capa visual global en:

```txt
kinesiologia/client/src/kine/premium-refresh.css
```

Este archivo aplica una primera base de diseño premium global: fondos, cards, botones, inputs, navegación inferior y ajustes visuales generales.

---

## 4. Navegación profesional

Antes el profesional tenía un menú lateral. Se modificó para que sea similar al portal paciente:

- header superior compacto
- contenido centrado tipo app
- navegación inferior
- opciones principales abajo
- opciones secundarias como chips arriba

Opciones principales actuales del profesional:

- Inicio
- Pacientes
- Agenda
- Rutinas
- Cuenta

Opciones secundarias:

- Biblioteca
- Notas

Archivo principal:

```txt
kinesiologia/client/src/kine/KineApp.jsx
```

---

## 5. Rutinas clínicas: objetivo principal

La parte más importante del proyecto actualmente es **Rutinas clínicas**.

La lógica clínica real del kinesiólogo es:

1. El paciente viene a sesión.
2. Se registra qué se hizo en la sesión:
   - MEP
   - punción seca
   - masoterapia
   - electro
   - otros agentes o técnicas
3. Al terminar la sesión, el kinesiólogo arma o actualiza la rutina semanal.
4. El paciente repite esa rutina 2 o 3 veces antes de volver al próximo control.
5. En la próxima sesión, el kinesiólogo vuelve a ajustar la rutina.

Por eso la rutina no debe sentirse como una simple biblioteca de ejercicios. Debe sentirse como la continuación natural de la sesión clínica.

---

## 6. Rutina clínica unificada

Se decidió que la rutina sea una sola secuencia, no varias pantallas separadas.

Una rutina puede mezclar:

- movilidad / entrada en calor
- gimnasio / fuerza
- campo
- cardio
- agentes físicos post entrenamiento
- indicaciones clínicas

Ejemplo real de secuencia permitida:

```txt
Movilidad de cadera
Bicicleta fija 10 min
Camilla cuádriceps 4x8
Intermitentes 8 x 30/30
Peso muerto 4x8
Hielo 15 min
Indicación: no superar dolor 5/10
```

Importante: la rutina puede tener gimnasio y campo mezclados en cualquier orden. No debe ser “primero todo gimnasio y después todo campo” necesariamente.

Archivos clave:

```txt
kinesiologia/client/src/kine/ClinicalRoutinePatientPage.jsx
kinesiologia/client/src/kine/ClinicalRoutineEditor.jsx
kinesiologia/client/src/kine/clinicalRoutineUtils.js
```

---

## 7. Flujo actual del editor de rutina

El editor de rutina incluye:

### Frecuencia semanal

Opciones:

- 2 veces antes del próximo control
- 3 veces antes del próximo control
- 2-3 veces antes del próximo control
- día por medio hasta el próximo control
- todos los días suave

### Partes de la rutina

Se pueden seleccionar:

- Gimnasio
- Campo
- Casa

Esto no bloquea el orden; solo indica qué partes va a tener la rutina.

### Carga rápida por flujo clínico

Bloques rápidos:

1. Entrada en calor
2. Gimnasio / fuerza
3. Campo
4. Post entrenamiento

La idea es que el kinesiólogo no tenga que abrir un menú enorme cada vez, sino cargar rápido por intención clínica.

---

## 8. Tipos de bloque dentro de una rutina

Actualmente existen estos tipos:

- `movilidad`
- `ejercicio`
- `campo`
- `cardio`
- `agente`
- `indicacion`

### Movilidad

Usada como entrada en calor o movilidad específica.

Ejemplos:

- Caminar
- Bicicleta fija
- Elíptico
- Movilidad de tobillo
- Movilidad de rodilla
- Movilidad de cadera
- Movilidad lumbar
- Movilidad torácica
- Movilidad de hombro
- Activación escapular
- Activación de glúteo

### Gimnasio / fuerza

Ejercicios con carga, máquina, polea, mancuerna, barra, banda o peso corporal.

### Campo

Ejemplos:

- Pasadas
- Intermitente
- Trote
- Fondo
- Cambios de ritmo
- Trabajo técnico
- Aceleraciones
- Desaceleraciones

### Agentes físicos post entrenamiento

Opciones:

- Hielo
- Calor
- Baño de contraste

Baño de contraste queda precargado como:

```txt
1 min frío / 3 min calor · 3 a 4 rondas
```

---

## 9. Biblioteca de ejercicios por articulación / región

La selección de ejercicios se está simplificando para que sea más clínica y rápida.

Se agregaron filtros por regiones grandes:

- Tobillo / pie
- Rodilla
- Cadera
- Lumbar
- Dorsal / torácica
- Hombro / escápula
- Brazo / codo
- Core

Importante: se contempla que algunos músculos son biarticulares y que un ejercicio puede aparecer en más de una región.

Ejemplos:

- Isquiosurales: rodilla + cadera
- Recto femoral: rodilla + cadera
- Gemelos: tobillo + rodilla
- Psoas: cadera + lumbar
- Dorsal ancho: hombro + dorsal
- Tríceps largo: brazo + hombro
- Ejercicios de estabilidad: también pueden aparecer en core

La lógica está en:

```txt
kinesiologia/client/src/kine/clinicalRoutineUtils.js
```

La biblioteca base está en:

```txt
kinesiologia/client/src/kine/exerciseLibrary.js
```

Se agregaron ejercicios clínicos extra sin depender de imágenes para que la selección sea más completa.

---

## 10. Problema de scroll en iPad / Safari

Se detectó que al abrir el editor de rutina como modal, al intentar scrollear hacia abajo se movía la pantalla de fondo en lugar del pop-up.

Se aplicaron fixes para:

- bloquear el scroll de la página de fondo
- hacer que el scroll ocurra dentro del editor
- mejorar comportamiento táctil en iPad/Safari
- usar `overscrollBehavior`, `WebkitOverflowScrolling` y `touchAction: pan-y`

Archivo:

```txt
kinesiologia/client/src/kine/ClinicalRoutinePatientPage.jsx
```

---

## 11. Pantalla de Rutinas clínicas

Se rediseñó para que sea más compacta y premium:

- header más ordenado
- menos espacio vacío
- card de motivo de consulta
- botón `+ Nueva rutina`
- empty state más claro
- cards de rutinas más modernas

Archivo:

```txt
kinesiologia/client/src/kine/ClinicalRoutinePatientPage.jsx
```

---

## 12. Conexión desde detalle del paciente

Se agregó un puente para que desde el detalle del paciente se use el flujo nuevo de Rutinas clínicas.

Antes había un modal viejo de “Rutina domiciliaria” que era confuso.

Se creó/intervino:

```txt
kinesiologia/client/src/kine/PatientClinicalRoutineBridge.jsx
```

Objetivo:

- mostrar acceso a Rutinas clínicas desde el paciente
- interceptar botones viejos de agregar rutina
- redirigir al editor nuevo
- evitar que el usuario caiga en la pantalla vieja

---

## 13. Deploy

El proyecto está conectado a Railway.

Puede haber deploy automático al hacer commits en `main`.

Para verificar si un cambio está deployado:

1. Ir a Railway.
2. Abrir el servicio correspondiente.
3. Ver la pestaña Deployments.
4. Confirmar que el commit activo coincida con el último commit de GitHub.

También puede haber cache fuerte en Safari/iPad. Para probar cambios recientes se suelen usar URLs con query string, por ejemplo:

```txt
https://rehabilitaplus.com/kine?v=test-nuevo
```

---

## 14. Commits relevantes recientes

Algunos cambios importantes realizados:

```txt
feat: rediseñar editor de rutinas clinicas premium
feat: usar puente de rutinas clinicas en detalle de paciente
fix: bloquear modal viejo de rutina domiciliaria
style: agregar refresh visual premium global
style: aplicar refresh visual premium en app
style: forzar refresh visual visible
feat: unificar portal profesional con navegacion inferior
style: pulir pantalla de rutinas clinicas profesional
feat: ampliar modelo de rutina clinica semanal
feat: rediseñar flujo semanal de rutina clinica
fix: bloquear scroll de fondo en modal de rutina
feat: sectorizar biblioteca por articulacion
feat: simplificar selector por articulacion
fix: mejorar scroll tactil del editor de rutina
```

---

## 15. Prioridades pendientes

Orden sugerido de trabajo futuro:

1. Unificar visualmente todas las pantallas restantes.
2. Rediseñar a fondo el detalle del paciente como ficha clínica moderna.
3. Conectar el fin de sesión con creación/actualización de rutina.
4. Mejorar aún más la biblioteca clínica de ejercicios.
5. Mejorar portal paciente: rutina del día, check de ejercicios, dolor antes/después, feedback.
6. Agregar templates clínicos:
   - LCA
   - hombro
   - tendinopatías
   - lumbar
   - esguince de tobillo
   - retorno al deporte
7. Agregar copiar/duplicar rutinas.
8. Agregar progresiones automáticas.
9. Agregar vista previa “como lo ve el paciente”.
10. Agregar botón claro de enviar/activar rutina para paciente.

---

## 16. Concepto clínico a respetar

La app debe ayudar a que el kinesiólogo haga esto rápido:

```txt
Paciente → registrar sesión → actualizar rutina semanal → guardar → paciente repite 2/3 veces → próximo control
```

La prioridad es reducir fricción clínica, no solo agregar funciones.

La rutina debe ser:

- rápida de crear
- fácil de editar en cada sesión
- visualmente clara
- completa
- flexible
- mezclando gimnasio/campo/casa cuando corresponda
- entendible para el paciente

---

## 17. Notas para nuevos desarrolladores

Antes de modificar Rutinas clínicas, revisar estos archivos:

```txt
kinesiologia/client/src/kine/ClinicalRoutinePatientPage.jsx
kinesiologia/client/src/kine/ClinicalRoutineEditor.jsx
kinesiologia/client/src/kine/clinicalRoutineUtils.js
kinesiologia/client/src/kine/exerciseLibrary.js
kinesiologia/client/src/kine/PatientClinicalRoutineBridge.jsx
```

No volver a introducir el flujo viejo de “Rutina domiciliaria” como flujo principal.

La experiencia principal debe ser **Rutinas clínicas unificadas**.

---

## 18. Estado general

La app ya tiene una base funcional. El foco actual es transformarla en una herramienta clínica premium:

- más consistente visualmente
- más rápida de usar en consultorio
- mejor adaptada a iPad/celular
- con flujo real de sesión → rutina → seguimiento
