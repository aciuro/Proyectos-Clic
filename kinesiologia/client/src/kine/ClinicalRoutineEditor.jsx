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
  ink: '#0D3540', muted: '#7AAAB8', sky: '#5BB8CC', skyDark: '#3A96AE',
  aqua: '#7EC8B8', border: '#C0DDE5', soft: '#F3FBFD', white: '#fff',
}

const tipoStyle = {
  ejercicio: { emoji: '🟩', bg: '#EEFDF5', border: '#BDEED3', color: '#166534' },
  cardio: { emoji: '🟦', bg: '#EFF8FF', border: '#B9E2F2', color: '#075985' },
  campo: { emoji: '🟨', bg: '#FFF9E8', border: '#F3DA90', color: '#7A5C00' },
  indicacion: { emoji: '🟪', bg: '#F6F1FF', border: '#D8C7FF', color: '#5B21B6' },
}

const input = {
  width: '100%', borderRadius: 14, border: '1px solid #dbe7eb', background: '#fff',
  padding: '10px 12px', fontSize: 13, color: c.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

function makeEmptyItem(tipo) {
  if (tipo === 'cardio') return { tipo, nombre: 'Bicicleta fija', duracion: '10 min', intensidad: 'suave', detalle: '' }
  if (tipo === 'campo') return { tipo, nombre: 'Intermitente', detalle: '8 x (30 seg rápido / 30 seg lento)' }
  if (tipo === 'indicacion') return { tipo, texto: 'No superar dolor 5/10' }
  return { tipo: 'ejercicio', nombre: 'Ejercicio libre', series: '3', repeticiones: '10', segundos: '', pausa: '', indicacion: '' }
}

function Header({ rutina, contexto, setContexto }) {
  return (
    <section style={{ background: '#fff', border: '1px solid rgba(91,184,204,0.22)', borderRadius: 22, padding: 16, boxShadow: '0 8px 24px rgba(13,53,64,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: c.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Contexto de la rutina</div>
          <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, color: c.ink }}>{rutina?.nombre || 'Rutina clínica'}</div>
          <div style={{ marginTop: 4, fontSize: 12, color: c.muted }}>Elegí una vez el contexto. La biblioteca se adapta a ese paciente.</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
        {CONTEXTOS_RUTINA.map(ctx => {
          const active = contexto === ctx.id
          return (
            <button key={ctx.id} type="button" onClick={() => setContexto(ctx.id)} style={{ border: `1.5px solid ${active ? c.sky : '#dbe7eb'}`, background: active ? '#EFF9FC' : '#fff', borderRadius: 18, padding: '12px 10px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ fontSize: 19 }}>{ctx.emoji}</div>
              <div style={{ marginTop: 5, fontSize: 13, fontWeight: 800, color: active ? c.skyDark : c.ink }}>{ctx.label}</div>
              <div style={{ marginTop: 2, fontSize: 10.5, color: c.muted, lineHeight: 1.25 }}>{ctx.hint}</div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function AddExerciseLibrary({ contexto, onAdd }) {
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('Todos')
  const groups = useMemo(() => ['Todos', ...exerciseLibrary.map(g => g.title)], [])
  const options = useMemo(() => getExerciseOptions(contexto, search, group), [contexto, search, group])

  return (
    <section style={{ background: '#fff', border: '1px solid rgba(91,184,204,0.22)', borderRadius: 22, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: c.ink }}>Biblioteca</div>
          <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>Ejercicios visuales filtrados por contexto.</div>
        </div>
        <div style={{ fontSize: 11, color: c.skyDark, background: '#EFF9FC', borderRadius: 999, padding: '6px 10px', fontWeight: 700 }}>{options.length} resultados</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 170px', gap: 8, marginTop: 12 }}>
        <input style={input} value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar: sentadilla, camilla, peso muerto..." />
        <select style={input} value={group} onChange={e => setGroup(e.target.value)}>{groups.map(g => <option key={g}>{g}</option>)}</select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: 9, marginTop: 12, maxHeight: 330, overflowY: 'auto', paddingRight: 2 }}>
        {options.map(item => (
          <button key={`${item.group}-${item.name}`} type="button" onClick={() => onAdd({ tipo: 'ejercicio', nombre: item.name, group: item.group, imagen: item.images?.[0], series: '3', repeticiones: '10', segundos: '', pausa: '', indicacion: '' })} style={{ border: '1px solid #dbe7eb', background: '#fff', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit' }}>
            <img src={item.images?.[0]} alt={item.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', background: '#f8fafc', display: 'block' }} loading="lazy" />
            <div style={{ padding: '8px 9px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: c.ink, lineHeight: 1.25 }}>{item.name}</div>
              <div style={{ fontSize: 10, color: c.muted, marginTop: 3 }}>{item.group}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function QuickAdd({ onAdd }) {
  return (
    <section style={{ background: '#fff', border: '1px solid rgba(91,184,204,0.22)', borderRadius: 22, padding: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: c.ink }}>+ Agregar ejercicio</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
        {TIPOS_ITEM.map(t => (
          <button key={t.id} type="button" onClick={() => onAdd(makeEmptyItem(t.id))} style={{ border: '1px solid #dbe7eb', background: '#fff', borderRadius: 16, padding: '12px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ fontSize: 20 }}>{t.emoji}</div>
            <div style={{ marginTop: 5, fontSize: 12, color: c.ink, fontWeight: 800 }}>{t.label}</div>
          </button>
        ))}
      </div>
    </section>
  )
}

function RoutineItem({ item, index, update, remove, move }) {
  const st = tipoStyle[item.tipo] || tipoStyle.ejercicio
  return (
    <div style={{ border: `1px solid ${st.border}`, background: st.bg, borderRadius: 20, padding: 12 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {item.imagen ? <img src={item.imagen} alt={item.nombre} style={{ width: 62, height: 62, objectFit: 'contain', background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,.06)', flexShrink: 0 }} /> : <div style={{ width: 62, height: 62, background: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{st.emoji}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: 11, color: st.color, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.06em' }}>{index + 1}. {item.tipo}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" onClick={() => move(index, -1)} style={miniBtn}>↑</button>
              <button type="button" onClick={() => move(index, 1)} style={miniBtn}>↓</button>
              <button type="button" onClick={() => remove(index)} style={{ ...miniBtn, color: '#b91c1c' }}>×</button>
            </div>
          </div>

          {item.tipo === 'ejercicio' && (
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              <input style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value })} placeholder="Nombre del ejercicio" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <input style={input} value={item.series || ''} onChange={e => update(index, { series: e.target.value })} placeholder="Series" />
                <input style={input} value={item.repeticiones || ''} onChange={e => update(index, { repeticiones: e.target.value })} placeholder="Reps" />
                <input style={input} value={item.segundos || ''} onChange={e => update(index, { segundos: e.target.value })} placeholder="Seg" />
                <input style={input} value={item.pausa || ''} onChange={e => update(index, { pausa: e.target.value })} placeholder="Pausa" />
              </div>
              <input style={input} value={item.indicacion || ''} onChange={e => update(index, { indicacion: e.target.value })} placeholder="Indicación: rango, dolor, técnica..." />
            </div>
          )}

          {item.tipo === 'cardio' && (
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              <select style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value })}>{CARDIO_PRESETS.map(x => <option key={x}>{x}</option>)}</select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input style={input} value={item.duracion || ''} onChange={e => update(index, { duracion: e.target.value })} placeholder="Duración: 10 min" />
                <input style={input} value={item.intensidad || ''} onChange={e => update(index, { intensidad: e.target.value })} placeholder="Intensidad" />
              </div>
              <input style={input} value={item.detalle || ''} onChange={e => update(index, { detalle: e.target.value })} placeholder="Ej: 10 min normal + 1x1 rápido/suave" />
            </div>
          )}

          {item.tipo === 'campo' && (
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              <select style={input} value={item.nombre || ''} onChange={e => update(index, { nombre: e.target.value })}>{CAMPO_PRESETS.map(x => <option key={x}>{x}</option>)}</select>
              <textarea style={{ ...input, minHeight: 76, resize: 'vertical' }} value={item.detalle || ''} onChange={e => update(index, { detalle: e.target.value })} placeholder={'Escribí libre: 6 x 40m, volver caminando\n8 x (30 seg rápido / 30 seg lento)\nFondo 20 min zona 2'} />
            </div>
          )}

          {item.tipo === 'indicacion' && (
            <textarea style={{ ...input, marginTop: 8, minHeight: 76, resize: 'vertical' }} value={item.texto || ''} onChange={e => update(index, { texto: e.target.value })} placeholder="Ej: No superar dolor 5/10. Suspender si aumenta inflamación." />
          )}

          <div style={{ marginTop: 8, fontSize: 11, color: st.color, fontWeight: 700 }}>{summarizeItem(item)}</div>
        </div>
      </div>
    </div>
  )
}

const miniBtn = { border: '1px solid #dbe7eb', background: '#fff', borderRadius: 10, width: 28, height: 28, cursor: 'pointer', fontWeight: 900, color: c.ink }

export default function ClinicalRoutineEditor({ rutina, onChange }) {
  const [contexto, setContexto] = useState(getRoutineContext(rutina))
  const [items, setItems] = useState(() => normalizeRoutineItems(rutina))

  function emit(nextItems = items, nextContexto = contexto) {
    setItems(nextItems)
    setContexto(nextContexto)
    onChange?.({ contexto: nextContexto, ejercicios: nextItems })
  }

  function addItem(item) { emit([...items, item]) }
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
    <div style={{ display: 'grid', gap: 14 }}>
      <Header rutina={rutina} contexto={contexto} setContexto={changeContext} />
      <QuickAdd onAdd={addItem} />
      <AddExerciseLibrary contexto={contexto} onAdd={addItem} />

      <section style={{ background: '#fff', border: '1px solid rgba(91,184,204,0.22)', borderRadius: 22, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: c.ink }}>Lista única de la rutina</div>
            <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>Gym, cardio, campo e indicaciones en el mismo orden que verá el paciente.</div>
          </div>
          <div style={{ fontSize: 12, color: c.skyDark, fontWeight: 800 }}>{items.length} ítems</div>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {items.length === 0 && <div style={{ border: '1px dashed #cbd5e1', background: '#f8fafc', borderRadius: 18, padding: 22, textAlign: 'center', color: c.muted, fontSize: 13 }}>Todavía no agregaste ejercicios.</div>}
          {items.map((item, i) => <RoutineItem key={`${item.tipo}-${i}`} item={item} index={i} update={updateItem} remove={removeItem} move={moveItem} />)}
        </div>
      </section>
    </div>
  )
}
