import { useMemo, useState } from 'react'
import {
  AGENTES_FISICOS,
  ARTICULACION_FILTROS,
  CAMPO_PRESETS,
  CARDIO_PRESETS,
  CONTEXTOS_RUTINA,
  MOVILIDAD_PRESETS,
  QUICK_ROUTINE_FLOW,
  TIPOS_ITEM,
  getExerciseGroups,
  getExerciseOptions,
  getRoutineContext,
  getRoutineFocus,
  getRoutineFrequency,
  normalizeRoutineItems,
  summarizeItem,
} from './clinicalRoutineUtils.js'

const c = {
  ink: '#082B34', inkSoft: '#315F68', muted: '#789FAA', sky: '#2F9FB2', skyDark: '#176F82',
  mint: '#72CDB8', border: 'rgba(83,151,166,.30)', bg: '#F4FAFB', white: '#FFFFFF', danger: '#B91C1C',
}

const typeInfo = {
  movilidad: { title: 'Movilidad / entrada en calor', short: 'Movilidad', icon: '🟢', hint: 'Primer bloque: caminar, bici, elíptico o movilidad articular.', bg: '#EAFBF5', border: '#BFEEDC', color: '#13795B' },
  ejercicio: { title: 'Gimnasio / fuerza', short: 'Gimnasio', icon: '🏋️', hint: 'Ejercicios por articulación: tobillo, rodilla, cadera, columna, hombro, brazo y core.', bg: '#EFF8FF', border: '#B9E2F2', color: '#075985' },
  campo: { title: 'Trabajo en campo', short: 'Campo', icon: '🏃', hint: 'Pasadas, intermitentes, trote, fondo o cambios de ritmo.', bg: '#FFF9E8', border: '#F3DA90', color: '#7A5C00' },
  cardio: { title: 'Cardio', short: 'Cardio', icon: '🚴', hint: 'Bloque aeróbico por tiempo o intensidad.', bg: '#F1F5FF', border: '#C8D7FF', color: '#334E99' },
  agente: { title: 'Agente físico post rutina', short: 'Agente', icon: '🧊', hint: 'Hielo, calor o baños de contraste al finalizar.', bg: '#F0FDFF', border: '#BAE6F0', color: '#0E7490' },
  indicacion: { title: 'Indicación clínica', short: 'Indicación', icon: '📝', hint: 'Dolor permitido, técnica, cuidados o progresión semanal.', bg: '#F6F1FF', border: '#D8C7FF', color: '#5B21B6' },
}

const input = { width: '100%', borderRadius: 16, border: `1px solid ${c.border}`, background: '#fff', padding: '11px 13px', fontSize: 13, color: c.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const card = { background: 'rgba(255,255,255,.94)', border: `1px solid ${c.border}`, borderRadius: 26, boxShadow: '0 16px 44px rgba(13,53,64,.07)' }
const miniBtn = { border: `1px solid ${c.border}`, background: '#fff', borderRadius: 12, width: 31, height: 31, cursor: 'pointer', fontWeight: 900, color: c.ink }

function makeEmptyItem(tipo) {
  if (tipo === 'movilidad') return { tipo, bloque: 'movilidad', nombre: 'Bicicleta fija', duracion: '10 min', detalle: 'Entrada en calor suave' }
  if (tipo === 'cardio') return { tipo, bloque: 'gimnasio', nombre: 'Bicicleta fija', duracion: '10 min', intensidad: 'suave', detalle: '' }
  if (tipo === 'campo') return { tipo, bloque: 'campo', nombre: 'Intermitente', detalle: '8 x (30 seg rápido / 30 seg lento)' }
  if (tipo === 'agente') return { tipo, bloque: 'post', nombre: 'Hielo', duracion: '15 min', frecuencia: 'post entrenamiento', detalle: '' }
  if (tipo === 'indicacion') return { tipo, bloque: 'indicacion', texto: 'Repetir la rutina 2 a 3 veces antes del próximo control. No superar dolor 5/10.' }
  return { tipo: 'ejercicio', bloque: 'gimnasio', nombre: 'Ejercicio libre', series: '3', repeticiones: '10', segundos: '', pausa: '', indicacion: '' }
}

function inferSmartType(id) {
  if (id === 'movilidad') return 'movilidad'
  if (id === 'campo') return 'campo'
  if (id === 'agente') return 'agente'
  return 'ejercicio'
}

function WeeklyHeader({ rutina, frecuencia, setFrecuencia, focos, toggleFoco, itemsCount, onQuickAdd }) {
  return (
    <section style={{ ...card, padding: 18, background: 'linear-gradient(135deg, #FFFFFF 0%, #ECF8FA 100%)' }}>
      <div style={{ display: 'grid', gap: 15 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 260, flex: 1 }}>
            <div style={{ fontSize: 11, color: c.muted, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '.12em' }}>Después de la sesión</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 25, lineHeight: 1.05, color: c.ink, letterSpacing: '-.04em', fontWeight: 950 }}>{rutina?.nombre || 'Rutina semanal del paciente'}</h2>
            <div style={{ marginTop: 8, fontSize: 13, color: c.muted, lineHeight: 1.45 }}>Armá la rutina que el paciente va a repetir hasta el próximo control. Podés mezclar gimnasio, campo, movilidad y agentes físicos en el orden real.</div>
          </div>
          <div style={{ minWidth: 114, background: '#fff', border: `1px solid ${c.border}`, borderRadius: 20, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 950, color: c.ink, lineHeight: 1 }}>{itemsCount}</div>
            <div style={{ fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 4 }}>bloques</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: c.muted, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Repetición semanal</div>
            <select style={input} value={frecuencia} onChange={e => setFrecuencia(e.target.value)}>
              <option>2 veces antes del próximo control</option>
              <option>3 veces antes del próximo control</option>
              <option>2-3 veces antes del próximo control</option>
              <option>Día por medio hasta el próximo control</option>
              <option>Todos los días suave</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: c.muted, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Partes de la rutina</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {CONTEXTOS_RUTINA.map(ctx => {
                const active = focos.includes(ctx.id)
                return (
                  <button key={ctx.id} type="button" onClick={() => toggleFoco(ctx.id)} style={{ border: `1.5px solid ${active ? c.sky : c.border}`, background: active ? '#E9F7FA' : '#fff', borderRadius: 16, padding: '10px 8px', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <div style={{ fontSize: 18 }}>{ctx.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 950, color: active ? c.skyDark : c.ink }}>{ctx.label}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: c.muted, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>Carga rápida por flujo clínico</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 9 }}>
            {QUICK_ROUTINE_FLOW.map(step => (
              <button key={step.id} type="button" onClick={() => onQuickAdd(inferSmartType(step.id))} style={{ border: `1px solid ${c.border}`, background: '#fff', borderRadius: 18, padding: 12, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 12.5, fontWeight: 950, color: c.ink }}>{step.label}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: c.muted, lineHeight: 1.3 }}>{step.helper}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TypePicker({ activeType, setActiveType }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 9 }}>
      {TIPOS_ITEM.map(t => {
        const info = typeInfo[t.id]
        const active = activeType === t.id
        return (
          <button key={t.id} type="button" onClick={() => setActiveType(t.id)} style={{ border: `1.5px solid ${active ? info.border : c.border}`, background: active ? info.bg : '#fff', borderRadius: 18, padding: 12, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', boxShadow: active ? '0 10px 24px rgba(13,53,64,.08)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{info.icon}</span>
              <span style={{ fontSize: 12.5, fontWeight: 950, color: active ? info.color : c.ink }}>{info.short}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 10.5, color: c.muted, lineHeight: 1.3 }}>{info.hint}</div>
          </button>
        )
      })}
    </div>
  )
}

function ExerciseThumb({ item }) {
  if (item.images?.[0]) {
    return <img src={item.images[0]} alt={item.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', background: '#f8fafc', display: 'block' }} loading="lazy" />
  }
  return (
    <div style={{ width: '100%', aspectRatio: '1/1', background: 'linear-gradient(135deg,#E9F7FA,#FFFFFF)', display: 'grid', placeItems: 'center', color: c.skyDark, fontWeight: 950, fontSize: 24 }}>
      {item.group?.slice(0, 1) || 'R'}
    </div>
  )
}

function RegionChips({ region, setRegion }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 2px 9px', marginTop: 12 }}>
      {ARTICULACION_FILTROS.map(r => {
        const active = region === r.id
        return (
          <button key={r.id} type="button" onClick={() => setRegion(r.id)} style={{ flex: '0 0 auto', border: `1px solid ${active ? c.sky : c.border}`, background: active ? '#E9F7FA' : '#fff', color: active ? c.skyDark : c.inkSoft, borderRadius: 999, padding: '8px 11px', fontSize: 11.5, fontWeight: 950, cursor: 'pointer', fontFamily: 'inherit' }}>
            {r.emoji} {r.label}
          </button>
        )
      })}
    </div>
  )
}

function AddPanel({ preferredType = 'ejercicio', focos, onAdd, onClose }) {
  const [activeType, setActiveType] = useState(preferredType)
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('Todos')
  const [region, setRegion] = useState('Todos')
  const primaryContext = focos?.includes('gimnasio') ? 'gimnasio' : focos?.[0] || 'gimnasio'
  const groups = useMemo(() => getExerciseGroups(), [])
  const options = useMemo(() => getExerciseOptions(primaryContext, search, group, region).slice(0, search ? 90 : 36), [primaryContext, search, group, region])

  function addPreset(tipo, payload = {}) { onAdd({ ...makeEmptyItem(tipo), ...payload }) }

  return (
    <section style={{ ...card, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 13 }}>
        <div>
          <div style={{ fontSize: 11, color: c.muted, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '.1em' }}>Agregar bloque</div>
          <div style={{ fontSize: 19, fontWeight: 950, color: c.ink, marginTop: 3, letterSpacing: '-.03em' }}>Elegí por región o buscá directo</div>
        </div>
        <button type="button" onClick={onClose} style={{ ...miniBtn, width: 34, height: 34 }}>×</button>
      </div>
      <TypePicker activeType={activeType} setActiveType={setActiveType} />

      {activeType === 'movilidad' && <PresetGrid items={MOVILIDAD_PRESETS} icon="🟢" hint="Usalo como entrada en calor antes de fuerza/campo." onSelect={(nombre) => addPreset('movilidad', { nombre, duracion: nombre.includes('Movilidad') ? '8 min' : '10 min' })} />}
      {activeType === 'cardio' && <PresetGrid items={CARDIO_PRESETS} icon="🚴" hint="Bloque aeróbico por tiempo, intensidad o intervalos." onSelect={(nombre) => addPreset('cardio', { nombre })} />}
      {activeType === 'campo' && <PresetGrid items={CAMPO_PRESETS} icon="🏃" hint="Podés agregar campo en cualquier parte de la secuencia." onSelect={(nombre) => addPreset('campo', { nombre })} />}
      {activeType === 'agente' && <PresetGrid items={AGENTES_FISICOS} icon="🧊" hint="Post entrenamiento. Contraste queda precargado como 1 min frío / 3 min calor." onSelect={(nombre) => addPreset('agente', { nombre, duracion: nombre === 'Baño de contraste' ? '' : '15 min', detalle: nombre === 'Baño de contraste' ? '1 min frío / 3 min calor · 3 a 4 rondas' : '' })} />}
      {activeType === 'indicacion' && (
        <div style={{ marginTop: 15, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
          {['Repetir 2 a 3 veces antes del próximo control', 'No superar dolor 5/10', 'Priorizar técnica y control', 'Suspender si aumenta inflamación'].map(texto => (
            <button key={texto} type="button" onClick={() => addPreset('indicacion', { texto })} style={{ border: `1px solid ${c.border}`, background: '#fff', borderRadius: 18, padding: 14, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ fontSize: 20 }}>📝</div><div style={{ marginTop: 8, fontSize: 13, fontWeight: 950, color: c.ink }}>{texto}</div>
            </button>
          ))}
        </div>
      )}

      {activeType === 'ejercicio' && (
        <div style={{ marginTop: 15 }}>
          <RegionChips region={region} setRegion={setRegion} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(135px, 190px)', gap: 9 }}>
            <input style={input} value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar: sentadilla, isquios, rotación, hombro..." />
            <select style={input} value={group} onChange={e => setGroup(e.target.value)}>{groups.map(g => <option key={g}>{g}</option>)}</select>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: c.muted, fontWeight: 800 }}>Los ejercicios biarticulares aparecen en más de una región. Ej: isquios en rodilla y cadera, gemelos en tobillo y rodilla.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))', gap: 10, marginTop: 12, maxHeight: 380, overflowY: 'auto', paddingRight: 2 }}>
            {options.map(item => (
              <button key={`${item.group}-${item.name}`} type="button" onClick={() => addPreset('ejercicio', { nombre: item.name, group: item.group, imagen: item.images?.[0], series: '3', repeticiones: '10', segundos: '', pausa: '', indicacion: '' })} style={{ border: `1px solid ${c.border}`, background: '#fff', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit', boxShadow: '0 8px 18px rgba(13,53,64,.04)' }}>
                <ExerciseThumb item={item} />
                <div style={{ padding: '10px 11px 11px' }}>
                  <div style={{ fontSize: 12.2, fontWeight: 950, color: c.ink, lineHeight: 1.25, minHeight: 31 }}>{item.name}</div>
                  <div style={{ display: 'inline-flex', marginTop: 7, fontSize: 9.5, color: c.skyDark, background: '#E9F7FA', borderRadius: 999, padding: '4px 7px', fontWeight: 900 }}>{item.group}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function PresetGrid({ items, icon, hint, onSelect }) {
  return <div style={{ marginTop: 15 }}><div style={{ fontSize: 12, color: c.muted, marginBottom: 10 }}>{hint}</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>{items.map(nombre => <button key={nombre} type="button" onClick={() => onSelect(nombre)} style={{ border: `1px solid ${c.border}`, background: '#fff', borderRadius: 20, padding: 15, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 18px rgba(13,53,64,.04)' }}><div style={{ fontSize: 22 }}>{icon}</div><div style={{ marginTop: 8, fontSize: 14, fontWeight: 950, color: c.ink }}>{nombre}</div><div style={{ marginTop: 5, fontSize: 11, color: c.muted }}>Agregar y ajustar parámetros.</div></button>)}</div></div>
}

function RoutineItem({ item, index, update, remove, move }) {
  const info = typeInfo[item.tipo] || typeInfo.ejercicio
  const title = item.nombre || item.texto || info.short
  return (
    <div style={{ border: `1px solid ${info.border}`, background: `linear-gradient(135deg, ${info.bg} 0%, #FFFFFF 78%)`, borderRadius: 24, padding: 14, boxShadow: '0 10px 26px rgba(13,53,64,.05)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {item.imagen ? <img src={item.imagen} alt={item.nombre} style={{ width: 66, height: 66, objectFit: 'contain', background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,.06)', flexShrink: 0 }} /> : <div style={{ width: 66, height: 66, background: '#fff', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 27, flexShrink: 0, border: '1px solid rgba(0,0,0,.05)' }}>{info.icon}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: 10, color: info.color, background: '#fff', border: `1px solid ${info.border}`, borderRadius: 999, padding: '4px 8px', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '.05em' }}>{index + 1}. {info.short}</span>
              <div style={{ marginTop: 7, fontSize: 17, fontWeight: 950, color: c.ink, lineHeight: 1.18 }}>{title}</div>
              <div style={{ marginTop: 5, fontSize: 12, color: info.color, fontWeight: 850 }}>{summarizeItem(item)}</div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}><button type="button" onClick={() => move(index, -1)} style={miniBtn}>↑</button><button type="button" onClick={() => move(index, 1)} style={miniBtn}>↓</button><button type="button" onClick={() => remove(index)} style={{ ...miniBtn, color: c.danger }}>×</button></div>
          </div>

          {item.tipo === 'movilidad' && <div style={{ marginTop: 12, display: 'grid', gap: 9 }}><input style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value })} placeholder="Movilidad / entrada en calor" /><div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 8 }}><input style={input} value={item.duracion || ''} onChange={e => update(index, { duracion: e.target.value })} placeholder="Duración" /><input style={input} value={item.detalle || ''} onChange={e => update(index, { detalle: e.target.value })} placeholder="Detalle" /></div></div>}
          {item.tipo === 'ejercicio' && <div style={{ marginTop: 12, display: 'grid', gap: 9 }}><input style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value })} placeholder="Nombre del ejercicio" /><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(82px, 1fr))', gap: 8 }}><input style={input} value={item.series || ''} onChange={e => update(index, { series: e.target.value })} placeholder="Series" /><input style={input} value={item.repeticiones || ''} onChange={e => update(index, { repeticiones: e.target.value })} placeholder="Reps" /><input style={input} value={item.segundos || ''} onChange={e => update(index, { segundos: e.target.value })} placeholder="Seg" /><input style={input} value={item.pausa || ''} onChange={e => update(index, { pausa: e.target.value })} placeholder="Pausa" /></div><input style={input} value={item.indicacion || ''} onChange={e => update(index, { indicacion: e.target.value })} placeholder="Indicación técnica" /></div>}
          {item.tipo === 'cardio' && <div style={{ marginTop: 12, display: 'grid', gap: 9 }}><select style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value })}>{CARDIO_PRESETS.map(x => <option key={x}>{x}</option>)}</select><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}><input style={input} value={item.duracion || ''} onChange={e => update(index, { duracion: e.target.value })} placeholder="Duración" /><input style={input} value={item.intensidad || ''} onChange={e => update(index, { intensidad: e.target.value })} placeholder="Intensidad" /></div><input style={input} value={item.detalle || ''} onChange={e => update(index, { detalle: e.target.value })} placeholder="Detalle" /></div>}
          {item.tipo === 'campo' && <div style={{ marginTop: 12, display: 'grid', gap: 9 }}><select style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value })}>{CAMPO_PRESETS.map(x => <option key={x}>{x}</option>)}</select><textarea style={{ ...input, minHeight: 82, resize: 'vertical' }} value={item.detalle || ''} onChange={e => update(index, { detalle: e.target.value })} placeholder={'Ej: 6 x 40 m, volver caminando\n8 x (30 seg rápido / 30 seg lento)'} /></div>}
          {item.tipo === 'agente' && <div style={{ marginTop: 12, display: 'grid', gap: 9 }}><select style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value, detalle: e.target.value === 'Baño de contraste' ? '1 min frío / 3 min calor · 3 a 4 rondas' : item.detalle })}>{AGENTES_FISICOS.map(x => <option key={x}>{x}</option>)}</select><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><input style={input} value={item.duracion || ''} onChange={e => update(index, { duracion: e.target.value })} placeholder="Duración" /><input style={input} value={item.frecuencia || ''} onChange={e => update(index, { frecuencia: e.target.value })} placeholder="Frecuencia" /></div><input style={input} value={item.detalle || ''} onChange={e => update(index, { detalle: e.target.value })} placeholder="Detalle" /></div>}
          {item.tipo === 'indicacion' && <textarea style={{ ...input, marginTop: 12, minHeight: 82, resize: 'vertical' }} value={item.texto || ''} onChange={e => update(index, { texto: e.target.value })} placeholder="Indicación clínica" />}
        </div>
      </div>
    </div>
  )
}

export default function ClinicalRoutineEditor({ rutina, onChange }) {
  const [contexto, setContexto] = useState(getRoutineContext(rutina))
  const [frecuencia, setFrecuenciaState] = useState(getRoutineFrequency(rutina))
  const [focos, setFocos] = useState(getRoutineFocus(rutina))
  const [items, setItems] = useState(() => normalizeRoutineItems(rutina))
  const [addOpen, setAddOpen] = useState(false)
  const [preferredType, setPreferredType] = useState('ejercicio')

  function emit(nextItems = items, nextContexto = contexto, nextFrecuencia = frecuencia, nextFocos = focos) {
    setItems(nextItems); setContexto(nextContexto); setFrecuenciaState(nextFrecuencia); setFocos(nextFocos)
    onChange?.({ contexto: nextContexto, ejercicios: nextItems, frecuencia: nextFrecuencia, focos: nextFocos })
  }
  function setFrecuencia(next) { emit(items, contexto, next, focos) }
  function toggleFoco(id) { const next = focos.includes(id) ? focos.filter(x => x !== id) : [...focos, id]; emit(items, next[0] || contexto, frecuencia, next.length ? next : [id]) }
  function openAdd(type = 'ejercicio') { setPreferredType(type); setAddOpen(true) }
  function addItem(item) { emit([...items, item]); setAddOpen(false) }
  function updateItem(index, patch) { emit(items.map((it, i) => i === index ? { ...it, ...patch } : it)) }
  function removeItem(index) { emit(items.filter((_, i) => i !== index)) }
  function moveItem(index, dir) { const target = index + dir; if (target < 0 || target >= items.length) return; const copy = [...items]; const [it] = copy.splice(index, 1); copy.splice(target, 0, it); emit(copy) }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <WeeklyHeader rutina={rutina} frecuencia={frecuencia} setFrecuencia={setFrecuencia} focos={focos} toggleFoco={toggleFoco} itemsCount={items.length} onQuickAdd={openAdd} />
      {addOpen && <AddPanel preferredType={preferredType} focos={focos} onAdd={addItem} onClose={() => setAddOpen(false)} />}
      <section style={{ ...card, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div><div style={{ fontSize: 18, fontWeight: 950, color: c.ink, letterSpacing: '-.02em' }}>Secuencia semanal</div><div style={{ fontSize: 12, color: c.muted, marginTop: 4 }}>Podés mezclar gimnasio y campo en cualquier orden: gym → campo → gym → agente físico.</div></div>
          <button type="button" onClick={() => openAdd('ejercicio')} style={{ border: `1px solid ${c.border}`, background: '#fff', color: c.skyDark, borderRadius: 16, padding: '10px 13px', fontWeight: 950, fontFamily: 'inherit', cursor: 'pointer' }}>+ Agregar bloque</button>
        </div>
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {items.length === 0 && <div style={{ border: `1px dashed ${c.border}`, background: '#f8fafc', borderRadius: 22, padding: 26, textAlign: 'center', color: c.muted, fontSize: 13 }}><div style={{ fontSize: 26, marginBottom: 8 }}>✨</div><div style={{ fontWeight: 950, color: c.ink }}>Todavía no hay bloques</div><div style={{ marginTop: 4 }}>Arrancá con movilidad y después agregá gimnasio, campo y agentes físicos.</div></div>}
          {items.map((item, i) => <RoutineItem key={`${item.tipo}-${i}`} item={item} index={i} update={updateItem} remove={removeItem} move={moveItem} />)}
        </div>
      </section>
    </div>
  )
}
