import { useMemo, useState } from 'react'
import {
  CAMPO_PRESETS,
  CARDIO_PRESETS,
  CONTEXTOS_RUTINA,
  TIPOS_ITEM,
  getExerciseOptions,
  getRoutineContext,
  normalizeRoutineItems,
  summarizeItem,
} from './clinicalRoutineUtils.js'
import { exerciseLibrary } from './exerciseLibrary.js'

const c = {
  ink: '#0D3540',
  inkSoft: '#2A6070',
  muted: '#7AAAB8',
  sky: '#5BB8CC',
  skyDark: '#3A96AE',
  mint: '#7EC8B8',
  border: '#C0DDE5',
  bg: '#F3FBFD',
  white: '#FFFFFF',
  danger: '#B91C1C',
}

const typeInfo = {
  ejercicio: {
    title: 'Ejercicio de fuerza',
    short: 'Ejercicio',
    icon: '🏋️',
    hint: 'Máquina, polea, barra, mancuerna, banda o peso corporal.',
    bg: '#EEFDF5',
    border: '#BDEED3',
    color: '#166534',
  },
  cardio: {
    title: 'Cardio / entrada en calor',
    short: 'Cardio',
    icon: '🚴',
    hint: 'Bici, cinta, caminata, elíptico o bloques por tiempo.',
    bg: '#EFF8FF',
    border: '#B9E2F2',
    color: '#075985',
  },
  campo: {
    title: 'Trabajo en campo',
    short: 'Campo',
    icon: '🏃',
    hint: 'Pasadas, intermitentes, fondo, cambios de ritmo o trote.',
    bg: '#FFF9E8',
    border: '#F3DA90',
    color: '#7A5C00',
  },
  indicacion: {
    title: 'Indicación clínica',
    short: 'Indicación',
    icon: '📝',
    hint: 'Dolor permitido, técnica, hielo, cuidados o progresión.',
    bg: '#F6F1FF',
    border: '#D8C7FF',
    color: '#5B21B6',
  },
}

const input = {
  width: '100%',
  borderRadius: 16,
  border: '1px solid #dbe7eb',
  background: '#fff',
  padding: '11px 13px',
  fontSize: 13,
  color: c.ink,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const card = {
  background: 'rgba(255,255,255,.92)',
  border: '1px solid rgba(91,184,204,.22)',
  borderRadius: 26,
  boxShadow: '0 16px 44px rgba(13,53,64,.07)',
}

const miniBtn = {
  border: '1px solid #dbe7eb',
  background: '#fff',
  borderRadius: 11,
  width: 30,
  height: 30,
  cursor: 'pointer',
  fontWeight: 900,
  color: c.ink,
}

function makeEmptyItem(tipo) {
  if (tipo === 'cardio') return { tipo, nombre: 'Bicicleta fija', duracion: '10 min', intensidad: 'suave', detalle: '' }
  if (tipo === 'campo') return { tipo, nombre: 'Intermitente', detalle: '8 x (30 seg rápido / 30 seg lento)' }
  if (tipo === 'indicacion') return { tipo, texto: 'No superar dolor 5/10. Suspender si aumenta inflamación.' }
  return { tipo: 'ejercicio', nombre: 'Ejercicio libre', series: '3', repeticiones: '10', segundos: '', pausa: '', indicacion: '' }
}

function Header({ rutina, contexto, setContexto, itemsCount, onAdd }) {
  return (
    <section style={{ ...card, padding: 20, background: 'linear-gradient(135deg, #FFFFFF 0%, #F1FBFD 100%)' }}>
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 240 }}>
            <div style={{ fontSize: 11, color: c.muted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.11em' }}>Editor clínico</div>
            <h2 style={{ margin: '4px 0 0', fontSize: 25, lineHeight: 1.05, color: c.ink, letterSpacing: '-.03em' }}>{rutina?.nombre || 'Rutina clínica'}</h2>
            <div style={{ marginTop: 8, fontSize: 13, color: c.muted, lineHeight: 1.45 }}>Una sola rutina con fuerza, cardio, campo e indicaciones, en el orden exacto que verá el paciente.</div>
          </div>
          <button type="button" onClick={onAdd} style={{ border: 'none', background: `linear-gradient(135deg, ${c.sky} 0%, ${c.skyDark} 100%)`, color: '#fff', borderRadius: 18, padding: '13px 18px', fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 12px 28px rgba(58,150,174,.22)' }}>+ Agregar elemento</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'end' }}>
          <div>
            <div style={{ textAlign: 'center', fontSize: 11, color: c.muted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>Contexto de la rutina</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {CONTEXTOS_RUTINA.map(ctx => {
                const active = contexto === ctx.id
                return (
                  <button key={ctx.id} type="button" onClick={() => setContexto(ctx.id)} style={{ border: `1.5px solid ${active ? c.sky : '#dbe7eb'}`, background: active ? '#EFF9FC' : '#fff', borderRadius: 20, padding: '13px 10px', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit', boxShadow: active ? '0 10px 24px rgba(91,184,204,.14)' : 'none' }}>
                    <div style={{ fontSize: 20 }}>{ctx.emoji}</div>
                    <div style={{ marginTop: 5, fontSize: 14, fontWeight: 900, color: active ? c.skyDark : c.ink }}>{ctx.label}</div>
                    <div style={{ marginTop: 3, fontSize: 10.5, color: c.muted, lineHeight: 1.25 }}>{ctx.hint}</div>
                  </button>
                )
              })}
            </div>
          </div>
          <div style={{ minWidth: 112, background: '#fff', border: '1px solid #dbe7eb', borderRadius: 20, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: c.ink, lineHeight: 1 }}>{itemsCount}</div>
            <div style={{ fontSize: 10, color: c.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 4 }}>elementos</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TypePicker({ activeType, setActiveType }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
      {TIPOS_ITEM.map(t => {
        const info = typeInfo[t.id]
        const active = activeType === t.id
        return (
          <button key={t.id} type="button" onClick={() => setActiveType(t.id)} style={{ border: `1.5px solid ${active ? info.border : '#dbe7eb'}`, background: active ? info.bg : '#fff', borderRadius: 20, padding: 14, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', boxShadow: active ? '0 10px 26px rgba(13,53,64,.08)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 21 }}>{info.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: active ? info.color : c.ink }}>{info.short}</span>
            </div>
            <div style={{ marginTop: 7, fontSize: 11, color: c.muted, lineHeight: 1.35 }}>{info.hint}</div>
          </button>
        )
      })}
    </div>
  )
}

function AddPanel({ contexto, onAdd, onClose }) {
  const [activeType, setActiveType] = useState('ejercicio')
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('Todos')
  const groups = useMemo(() => ['Todos', ...exerciseLibrary.map(g => g.title)], [])
  const options = useMemo(() => getExerciseOptions(contexto, search, group), [contexto, search, group])

  function addPreset(tipo, payload = {}) {
    onAdd({ ...makeEmptyItem(tipo), ...payload })
  }

  return (
    <section style={{ ...card, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: c.muted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.1em' }}>Agregar a la rutina</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: c.ink, marginTop: 3 }}>Elegí qué querés cargar</div>
        </div>
        <button type="button" onClick={onClose} style={{ ...miniBtn, width: 34, height: 34 }}>×</button>
      </div>

      <TypePicker activeType={activeType} setActiveType={setActiveType} />

      {activeType === 'ejercicio' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(130px, 190px)', gap: 10 }}>
            <input style={input} value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ejercicio: sentadilla, camilla, peso muerto..." />
            <select style={input} value={group} onChange={e => setGroup(e.target.value)}>{groups.map(g => <option key={g}>{g}</option>)}</select>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: c.muted, fontWeight: 800 }}>{options.length} ejercicios disponibles según el contexto seleccionado.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(142px, 1fr))', gap: 11, marginTop: 12, maxHeight: 380, overflowY: 'auto', paddingRight: 2 }}>
            {options.map(item => (
              <button key={`${item.group}-${item.name}`} type="button" onClick={() => addPreset('ejercicio', { nombre: item.name, group: item.group, imagen: item.images?.[0], series: '3', repeticiones: '10', segundos: '', pausa: '', indicacion: '' })} style={{ border: '1px solid #dbe7eb', background: '#fff', borderRadius: 20, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit', boxShadow: '0 8px 18px rgba(13,53,64,.04)' }}>
                <img src={item.images?.[0]} alt={item.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', background: '#f8fafc', display: 'block' }} loading="lazy" />
                <div style={{ padding: '10px 11px 11px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 900, color: c.ink, lineHeight: 1.25, minHeight: 31 }}>{item.name}</div>
                  <div style={{ display: 'inline-flex', marginTop: 7, fontSize: 9.5, color: c.skyDark, background: '#EFF9FC', borderRadius: 999, padding: '4px 7px', fontWeight: 800 }}>{item.group}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeType === 'cardio' && (
        <PresetGrid items={CARDIO_PRESETS} icon="🚴" hint="Cargalo como entrada en calor, bloque continuo o intervalado." onSelect={(nombre) => addPreset('cardio', { nombre })} />
      )}

      {activeType === 'campo' && (
        <PresetGrid items={CAMPO_PRESETS} icon="🏃" hint="Ideal para pasadas, intermitentes, retorno al deporte y fondos." onSelect={(nombre) => addPreset('campo', { nombre })} />
      )}

      {activeType === 'indicacion' && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
          {['No superar dolor 5/10', 'Hielo 15 minutos al finalizar', 'Priorizar técnica y control', 'Suspender si aumenta inflamación'].map(texto => (
            <button key={texto} type="button" onClick={() => addPreset('indicacion', { texto })} style={{ border: '1px solid #dbe7eb', background: '#fff', borderRadius: 18, padding: 14, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ fontSize: 20 }}>📝</div>
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 900, color: c.ink }}>{texto}</div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function PresetGrid({ items, icon, hint, onSelect }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, color: c.muted, marginBottom: 10 }}>{hint}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {items.map(nombre => (
          <button key={nombre} type="button" onClick={() => onSelect(nombre)} style={{ border: '1px solid #dbe7eb', background: '#fff', borderRadius: 20, padding: 15, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 18px rgba(13,53,64,.04)' }}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 900, color: c.ink }}>{nombre}</div>
            <div style={{ marginTop: 5, fontSize: 11, color: c.muted }}>Agregar y ajustar tiempos, intensidad o pausas.</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function RoutineItem({ item, index, update, remove, move }) {
  const info = typeInfo[item.tipo] || typeInfo.ejercicio
  const title = item.nombre || item.texto || info.short

  return (
    <div style={{ border: `1px solid ${info.border}`, background: `linear-gradient(135deg, ${info.bg} 0%, #FFFFFF 78%)`, borderRadius: 24, padding: 14, boxShadow: '0 10px 26px rgba(13,53,64,.05)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {item.imagen ? <img src={item.imagen} alt={item.nombre} style={{ width: 70, height: 70, objectFit: 'contain', background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,.06)', flexShrink: 0 }} /> : <div style={{ width: 70, height: 70, background: '#fff', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, border: '1px solid rgba(0,0,0,.05)' }}>{info.icon}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: info.color, background: '#fff', border: `1px solid ${info.border}`, borderRadius: 999, padding: '4px 8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.05em' }}>{index + 1}. {info.short}</span>
              </div>
              <div style={{ marginTop: 7, fontSize: 17, fontWeight: 950, color: c.ink, lineHeight: 1.18 }}>{title}</div>
              <div style={{ marginTop: 5, fontSize: 12, color: info.color, fontWeight: 800 }}>{summarizeItem(item)}</div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button type="button" onClick={() => move(index, -1)} style={miniBtn}>↑</button>
              <button type="button" onClick={() => move(index, 1)} style={miniBtn}>↓</button>
              <button type="button" onClick={() => remove(index)} style={{ ...miniBtn, color: c.danger }}>×</button>
            </div>
          </div>

          {item.tipo === 'ejercicio' && (
            <div style={{ marginTop: 12, display: 'grid', gap: 9 }}>
              <input style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value })} placeholder="Nombre del ejercicio" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(82px, 1fr))', gap: 8 }}>
                <input style={input} value={item.series || ''} onChange={e => update(index, { series: e.target.value })} placeholder="Series" />
                <input style={input} value={item.repeticiones || ''} onChange={e => update(index, { repeticiones: e.target.value })} placeholder="Reps" />
                <input style={input} value={item.segundos || ''} onChange={e => update(index, { segundos: e.target.value })} placeholder="Seg" />
                <input style={input} value={item.pausa || ''} onChange={e => update(index, { pausa: e.target.value })} placeholder="Pausa" />
              </div>
              <input style={input} value={item.indicacion || ''} onChange={e => update(index, { indicacion: e.target.value })} placeholder="Indicación clínica o técnica" />
            </div>
          )}

          {item.tipo === 'cardio' && (
            <div style={{ marginTop: 12, display: 'grid', gap: 9 }}>
              <select style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value })}>{CARDIO_PRESETS.map(x => <option key={x}>{x}</option>)}</select>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                <input style={input} value={item.duracion || ''} onChange={e => update(index, { duracion: e.target.value })} placeholder="Duración: 10 min" />
                <input style={input} value={item.intensidad || ''} onChange={e => update(index, { intensidad: e.target.value })} placeholder="Intensidad" />
              </div>
              <input style={input} value={item.detalle || ''} onChange={e => update(index, { detalle: e.target.value })} placeholder="Ej: 10 min normal + 1x1 rápido/suave" />
            </div>
          )}

          {item.tipo === 'campo' && (
            <div style={{ marginTop: 12, display: 'grid', gap: 9 }}>
              <select style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value })}>{CAMPO_PRESETS.map(x => <option key={x}>{x}</option>)}</select>
              <textarea style={{ ...input, minHeight: 82, resize: 'vertical' }} value={item.detalle || ''} onChange={e => update(index, { detalle: e.target.value })} placeholder={'Ej: 6 x 40 m, volver caminando\n8 x (30 seg rápido / 30 seg lento)\nFondo 20 min zona 2'} />
            </div>
          )}

          {item.tipo === 'indicacion' && (
            <textarea style={{ ...input, marginTop: 12, minHeight: 82, resize: 'vertical' }} value={item.texto || ''} onChange={e => update(index, { texto: e.target.value })} placeholder="Ej: No superar dolor 5/10. Suspender si aumenta inflamación." />
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClinicalRoutineEditor({ rutina, onChange }) {
  const [contexto, setContexto] = useState(getRoutineContext(rutina))
  const [items, setItems] = useState(() => normalizeRoutineItems(rutina))
  const [addOpen, setAddOpen] = useState(false)

  function emit(nextItems = items, nextContexto = contexto) {
    setItems(nextItems)
    setContexto(nextContexto)
    onChange?.({ contexto: nextContexto, ejercicios: nextItems })
  }

  function addItem(item) {
    emit([...items, item])
    setAddOpen(false)
  }
  function updateItem(index, patch) { emit(items.map((it, i) => i === index ? { ...it, ...patch } : it)) }
  function removeItem(index) { emit(items.filter((_, i) => i !== index)) }
  function moveItem(index, dir) {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const copy = [...items]
    const [it] = copy.splice(index, 1)
    copy.splice(target, 0, it)
    emit(copy)
  }
  function changeContext(next) { emit(items, next) }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Header rutina={rutina} contexto={contexto} setContexto={changeContext} itemsCount={items.length} onAdd={() => setAddOpen(true)} />

      {addOpen && <AddPanel contexto={contexto} onAdd={addItem} onClose={() => setAddOpen(false)} />}

      <section style={{ ...card, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 950, color: c.ink, letterSpacing: '-.02em' }}>Secuencia de la rutina</div>
            <div style={{ fontSize: 12, color: c.muted, marginTop: 4 }}>Todo queda en una sola lista: fuerza, cardio, campo e indicaciones.</div>
          </div>
          <button type="button" onClick={() => setAddOpen(true)} style={{ border: '1px solid rgba(91,184,204,.35)', background: '#fff', color: c.skyDark, borderRadius: 16, padding: '10px 13px', fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer' }}>+ Agregar elemento</button>
        </div>
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {items.length === 0 && (
            <div style={{ border: '1px dashed #cbd5e1', background: '#f8fafc', borderRadius: 22, padding: 28, textAlign: 'center', color: c.muted, fontSize: 13 }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>✨</div>
              <div style={{ fontWeight: 900, color: c.ink }}>Todavía no hay elementos</div>
              <div style={{ marginTop: 4 }}>Tocá “Agregar elemento” para empezar con ejercicios, cardio, campo o indicaciones.</div>
            </div>
          )}
          {items.map((item, i) => <RoutineItem key={`${item.tipo}-${i}`} item={item} index={i} update={updateItem} remove={removeItem} move={moveItem} />)}
        </div>
      </section>
    </div>
  )
}
