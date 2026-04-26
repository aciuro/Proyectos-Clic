export const CLINICAL_ROUTINE_TEMPLATES = [
  { id: 'rotuliana-fase-1', title: 'Tendinopatía rotuliana - fase 1', region: 'Rodilla', goal: 'Analgesia y control de carga', frecuencia: '2-3 veces antes del próximo control', focos: ['gimnasio', 'casa'], resumen: 'Isométricos y fuerza inicial para tendón rotuliano.', items: [
    { tipo: 'movilidad', bloque: 'movilidad', nombre: 'Bicicleta fija', duracion: '8-10 min', detalle: 'Suave, sin aumentar dolor' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Spanish squat', series: '4', repeticiones: '30-45 seg', pausa: '60-90 seg', indicacion: 'Isométrico. Dolor permitido hasta 4/10 si baja al terminar' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Isométrico en camilla de cuádriceps a 60°', series: '4', repeticiones: '30-45 seg', pausa: '60-90 seg', indicacion: 'Tensión sostenida y controlada' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Extensión terminal de rodilla con banda', series: '3', repeticiones: '12-15', pausa: '45 seg', indicacion: 'Bloquear suave sin dolor punzante' },
    { tipo: 'agente', bloque: 'post', nombre: 'Hielo', duracion: '12-15 min', frecuencia: 'post entrenamiento', detalle: 'Si queda dolor o inflamación' },
    { tipo: 'indicacion', bloque: 'indicacion', texto: 'Evitar saltos y cambios de dirección esta semana. Controlar dolor al día siguiente.' },
  ]},
  { id: 'rotuliana-fase-2', title: 'Tendinopatía rotuliana - fase 2', region: 'Rodilla', goal: 'Fuerza progresiva y excéntricos', frecuencia: '2-3 veces antes del próximo control', focos: ['gimnasio'], resumen: 'Progresión de fuerza para cuádriceps y cadena posterior.', items: [
    { tipo: 'movilidad', bloque: 'movilidad', nombre: 'Bicicleta fija', duracion: '10 min', detalle: 'Entrada en calor' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Prensa bilateral', series: '3', repeticiones: '10-12', pausa: '75 seg', indicacion: 'Rango cómodo, controlando rodilla' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Camilla de cuádriceps: subir con dos y bajar con una', series: '3', repeticiones: '8-10', pausa: '75 seg', indicacion: 'Bajada lenta de 3-4 segundos' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Step down excéntrico', series: '3', repeticiones: '8 por lado', pausa: '60 seg', indicacion: 'Bajar lento, pelvis estable' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Peso muerto rumano bilateral', series: '3', repeticiones: '10', pausa: '75 seg', indicacion: 'Cadena posterior, espalda neutra' },
    { tipo: 'agente', bloque: 'post', nombre: 'Hielo', duracion: '12-15 min', frecuencia: 'post entrenamiento', detalle: 'Si queda molestia' },
  ]},
  { id: 'tobillo-esguince-inicial', title: 'Esguince de tobillo - fase inicial', region: 'Tobillo / pie', goal: 'Movilidad, activación y propiocepción', frecuencia: 'Todos los días suave', focos: ['casa'], resumen: 'Movilidad y control inicial sin impacto.', items: [
    { tipo: 'movilidad', bloque: 'movilidad', nombre: 'Movilidad de tobillo en pared', duracion: '3-4 min', detalle: 'Sin dolor fuerte, buscar dorsiflexión' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Tibial anterior con banda', series: '3', repeticiones: '12-15', pausa: '30 seg', indicacion: 'Movimiento lento' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Eversión de tobillo con banda', series: '3', repeticiones: '12-15', pausa: '30 seg', indicacion: 'Controlar recorrido' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Inversión de tobillo con banda', series: '3', repeticiones: '12-15', pausa: '30 seg', indicacion: 'Sin dolor lateral fuerte' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Balance unipodal', series: '4', repeticiones: '20-30 seg', pausa: '30 seg', indicacion: 'Cerca de una pared para seguridad' },
    { tipo: 'agente', bloque: 'post', nombre: 'Hielo', duracion: '12-15 min', frecuencia: 'si hay inflamación', detalle: '' },
  ]},
  { id: 'tobillo-retorno-campo', title: 'Esguince de tobillo - retorno al campo', region: 'Tobillo / pie', goal: 'Fuerza, pliometría y cambios de dirección', frecuencia: '2-3 veces antes del próximo control', focos: ['gimnasio', 'campo'], resumen: 'Progresión hacia trote, saltos y estabilidad dinámica.', items: [
    { tipo: 'movilidad', bloque: 'movilidad', nombre: 'Bicicleta fija', duracion: '8 min', detalle: 'Entrada en calor' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Elevación de talones unilateral', series: '3', repeticiones: '12', pausa: '45 seg', indicacion: 'Subir completo y controlar bajada' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Balance unipodal con alcance', series: '3', repeticiones: '6-8 alcances', pausa: '45 seg', indicacion: 'Control de rodilla y pelvis' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Saltos pogo bilaterales', series: '3', repeticiones: '15-20 seg', pausa: '60 seg', indicacion: 'Rebote corto, sin dolor' },
    { tipo: 'campo', bloque: 'campo', nombre: 'Intermitente', detalle: '6-8 x (30 seg trote / 30 seg caminata). Sin cambios bruscos todavía.' },
    { tipo: 'indicacion', bloque: 'indicacion', texto: 'Si aparece inestabilidad o dolor mayor a 5/10, bajar intensidad y avisar.' },
  ]},
  { id: 'lumbar-control-motor', title: 'Dolor lumbar - control motor', region: 'Lumbar / core', goal: 'Control, tolerancia y estabilidad', frecuencia: 'Día por medio hasta el próximo control', focos: ['casa', 'gimnasio'], resumen: 'Rutina base de estabilidad lumbopélvica.', items: [
    { tipo: 'movilidad', bloque: 'movilidad', nombre: 'Movilidad lumbar', duracion: '4-5 min', detalle: 'Suave, sin forzar rango' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'McGill curl up', series: '3', repeticiones: '6-8', pausa: '30 seg', indicacion: 'Mantener neutro, sin tirar del cuello' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Bird dog', series: '3', repeticiones: '6-8 por lado', pausa: '30 seg', indicacion: 'Evitar rotación de pelvis' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Dead bug', series: '3', repeticiones: '8 por lado', pausa: '30 seg', indicacion: 'Costillas abajo, control respiratorio' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Pallof press', series: '3', repeticiones: '20-30 seg por lado', pausa: '45 seg', indicacion: 'Anti-rotación' },
    { tipo: 'indicacion', bloque: 'indicacion', texto: 'No buscar fatiga máxima. La prioridad es control y tolerancia.' },
  ]},
  { id: 'hombro-manguito-base', title: 'Hombro - manguito rotador base', region: 'Hombro / escápula', goal: 'Rotadores, escápula y tolerancia', frecuencia: '2-3 veces antes del próximo control', focos: ['casa', 'gimnasio'], resumen: 'Base de manguito rotador y control escapular.', items: [
    { tipo: 'movilidad', bloque: 'movilidad', nombre: 'Movilidad de hombro', duracion: '5 min', detalle: 'Sin dolor punzante' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Rotación externa hombro isométrica', series: '4', repeticiones: '20-30 seg', pausa: '30 seg', indicacion: 'Codo pegado al cuerpo' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Rotación externa hombro con banda', series: '3', repeticiones: '12-15', pausa: '45 seg', indicacion: 'Controlar escápula' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Serrato punch', series: '3', repeticiones: '12-15', pausa: '45 seg', indicacion: 'Protracción controlada' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Face pull con banda', series: '3', repeticiones: '12', pausa: '45 seg', indicacion: 'Codos altos, sin compensar cuello' },
    { tipo: 'agente', bloque: 'post', nombre: 'Hielo', duracion: '10-12 min', frecuencia: 'si queda dolor', detalle: '' },
  ]},
  { id: 'cadera-gluteo-medio', title: 'Cadera - glúteo medio / control frontal', region: 'Cadera', goal: 'Control pélvico y abductores', frecuencia: '2-3 veces antes del próximo control', focos: ['gimnasio', 'casa'], resumen: 'Glúteo medio, control de pelvis y estabilidad unilateral.', items: [
    { tipo: 'movilidad', bloque: 'movilidad', nombre: 'Movilidad de cadera', duracion: '5 min', detalle: 'Rango cómodo' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Clamshell', series: '3', repeticiones: '12-15', pausa: '30 seg', indicacion: 'Pelvis quieta' },
    { tipo: 'ejercicio', bloque: 'casa', nombre: 'Abducción de cadera lateral', series: '3', repeticiones: '12', pausa: '30 seg', indicacion: 'Pie levemente hacia abajo' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Caminata lateral con banda', series: '3', repeticiones: '10 pasos por lado', pausa: '45 seg', indicacion: 'Rodillas alineadas' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Peso muerto rumano unilateral', series: '3', repeticiones: '8 por lado', pausa: '60 seg', indicacion: 'Pelvis estable' },
    { tipo: 'indicacion', bloque: 'indicacion', texto: 'Priorizar control antes que carga. No dejar caer la pelvis.' },
  ]},
  { id: 'retorno-running-base', title: 'Retorno al running - base', region: 'Campo', goal: 'Tolerancia progresiva al impacto', frecuencia: '2 veces antes del próximo control', focos: ['gimnasio', 'campo'], resumen: 'Fuerza + intermitente suave para volver a correr.', items: [
    { tipo: 'movilidad', bloque: 'movilidad', nombre: 'Bicicleta fija', duracion: '8-10 min', detalle: 'Entrada en calor' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Elevación de talones unilateral', series: '3', repeticiones: '12 por lado', pausa: '45 seg', indicacion: 'Controlar bajada' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Step down excéntrico', series: '3', repeticiones: '8 por lado', pausa: '60 seg', indicacion: 'Rodilla alineada' },
    { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Peso muerto rumano unilateral', series: '3', repeticiones: '8 por lado', pausa: '60 seg', indicacion: 'Control de pelvis' },
    { tipo: 'campo', bloque: 'campo', nombre: 'Intermitente', detalle: '10 x (1 min trote suave / 1 min caminata). Mantener dolor ≤ 3/10.' },
    { tipo: 'agente', bloque: 'post', nombre: 'Hielo', duracion: '12 min', frecuencia: 'si hay molestia', detalle: '' },
  ]},
]

export function getTemplateById(id) {
  return CLINICAL_ROUTINE_TEMPLATES.find(t => t.id === id) || null
}
