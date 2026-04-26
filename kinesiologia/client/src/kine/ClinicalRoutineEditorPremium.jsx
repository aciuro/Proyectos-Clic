import { useMemo, useState } from 'react'
import {
  AGENTES_FISICOS,
  ARTICULACION_FILTROS,
  CAMPO_PRESETS,
  CARDIO_PRESETS,
  CONTEXTOS_RUTINA,
  CONTRACCION_FILTROS,
  MOVILIDAD_PRESETS,
  getExerciseGroups,
  getExerciseOptions,
  getRoutineContext,
  getRoutineFocus,
  getRoutineFrequency,
  normalizeRoutineItems,
  summarizeItem,
} from './clinicalRoutineUtils.js'

const c = { ink:'#082B34', muted:'#789FAA', sky:'#2F9FB2', skyDark:'#176F82', border:'rgba(83,151,166,.30)', white:'#fff', danger:'#B91C1C' }
const input = { width:'100%', borderRadius:16, border:`1px solid ${c.border}`, background:'#fff', padding:'11px 13px', fontSize:14, color:c.ink, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }
const card = { background:'rgba(255,255,255,.96)', border:`1px solid ${c.border}`, borderRadius:24, boxShadow:'0 12px 34px rgba(13,53,64,.06)' }

const TYPES = {
  movilidad:{ label:'Movilidad', icon:'●', hint:'Caminar, bici, elíptico o movilidad articular.', bg:'#EAFBF5', color:'#13795B' },
  ejercicio:{ label:'Gimnasio', icon:'⌁', hint:'Ejercicios por articulación y tipo de contracción.', bg:'#EFF8FF', color:'#075985' },
  campo:{ label:'Campo', icon:'↗', hint:'Pasadas, trote e intermitentes.', bg:'#FFF9E8', color:'#7A5C00' },
  cardio:{ label:'Cardio', icon:'◌', hint:'Bloque aeróbico por tiempo o intensidad.', bg:'#F1F5FF', color:'#334E99' },
  agente:{ label:'Agente físico', icon:'❄', hint:'Hielo, calor o contraste al finalizar.', bg:'#F0FDFF', color:'#0E7490' },
  indicacion:{ label:'Indicación', icon:'□', hint:'Dolor permitido, técnica o cuidados.', bg:'#F6F1FF', color:'#5B21B6' },
}

function emptyItem(tipo) {
  if (tipo === 'movilidad') return { tipo, bloque:'movilidad', nombre:'Bicicleta fija', duracion:'10 min', detalle:'Entrada en calor suave' }
  if (tipo === 'cardio') return { tipo, bloque:'gimnasio', nombre:'Bicicleta fija', duracion:'10 min', intensidad:'suave', detalle:'' }
  if (tipo === 'campo') return { tipo, bloque:'campo', nombre:'Intermitente', detalle:'8 x (30 seg rápido / 30 seg lento)' }
  if (tipo === 'agente') return { tipo, bloque:'post', nombre:'Hielo', duracion:'15 min', frecuencia:'post entrenamiento', detalle:'' }
  if (tipo === 'indicacion') return { tipo, bloque:'indicacion', texto:'Repetir 2 a 3 veces antes del próximo control. No superar dolor 5/10.' }
  return { tipo:'ejercicio', bloque:'gimnasio', nombre:'Ejercicio libre', series:'3', repeticiones:'10', pausa:'', indicacion:'' }
}

function TypeSelector({ type, setType }) {
  if (type) {
    const t = TYPES[type]
    return <div style={{ border:`1px solid ${c.border}`, borderRadius:18, background:'#fff', padding:12, display:'flex', justifyContent:'space-between', gap:10, alignItems:'center' }}>
      <div style={{ display:'flex', gap:10, alignItems:'center' }}><div style={{ width:40, height:40, borderRadius:14, background:t.bg, color:t.color, display:'grid', placeItems:'center', fontWeight:950 }}>{t.icon}</div><div><div style={{ fontSize:12, color:c.muted }}>Tipo seleccionado</div><div style={{ fontSize:17, fontWeight:950, color:c.ink }}>{t.label}</div></div></div>
      <button type="button" onClick={() => setType(null)} style={{ border:'none', background:'transparent', color:c.skyDark, fontWeight:950, cursor:'pointer', fontFamily:'inherit' }}>Cambiar</button>
    </div>
  }
  return <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', gap:10 }}>
    {Object.entries(TYPES).map(([id,t]) => <button key={id} type="button" onClick={() => setType(id)} style={{ border:`1px solid ${c.border}`, background:'#fff', borderRadius:22, padding:16, textAlign:'left', cursor:'pointer', minHeight:120, fontFamily:'inherit' }}>
      <div style={{ width:42, height:42, borderRadius:16, background:t.bg, color:t.color, display:'grid', placeItems:'center', fontWeight:950 }}>{t.icon}</div><div style={{ marginTop:10, fontSize:17, fontWeight:950, color:c.ink }}>{t.label}</div><div style={{ marginTop:6, fontSize:12, color:c.muted, lineHeight:1.35 }}>{t.hint}</div>
    </button>)}
  </div>
}

function ChipGroup({ title, items, value, onChange }) {
  return <div><div style={{ fontSize:11, color:c.muted, fontWeight:950, textTransform:'uppercase', letterSpacing:'.08em', margin:'6px 0 7px' }}>{title}</div><div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>{items.map(it => { const a=value===it.id; return <button key={it.id} type="button" onClick={() => onChange(it.id)} style={{ border:`1px solid ${a?c.sky:c.border}`, background:a?'#E9F7FA':'#fff', color:a?c.skyDark:c.ink, borderRadius:999, padding:'8px 10px', fontSize:12, fontWeight:900, cursor:'pointer', fontFamily:'inherit' }}>{it.emoji ? `${it.emoji} ` : ''}{it.label}</button> })}</div></div>
}

function AddPanel({ preferredType, focos, onAdd, onClose }) {
  const [type, setType] = useState(preferredType || null)
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('Todos')
  const [region, setRegion] = useState('Todos')
  const [contraction, setContraction] = useState('Todos')
  const groups = useMemo(() => getExerciseGroups(), [])
  const context = focos?.includes('gimnasio') ? 'gimnasio' : focos?.[0] || 'gimnasio'
  const options = useMemo(() => getExerciseOptions(context, search, group, region, contraction).slice(0, 80), [context, search, group, region, contraction])

  function add(tipo, patch={}) { onAdd({ ...emptyItem(tipo), ...patch }) }
  const presets = { movilidad:MOVILIDAD_PRESETS, cardio:CARDIO_PRESETS, campo:CAMPO_PRESETS, agente:AGENTES_FISICOS, indicacion:['Repetir 2 a 3 veces antes del próximo control','No superar dolor 5/10','Priorizar técnica y control','Suspender si aumenta inflamación'] }

  return <section style={{ ...card, padding:16, overflow:'hidden' }}>
    <div style={{ display:'flex', justifyContent:'space-between', gap:12, marginBottom:14 }}><div><div style={{ fontSize:11, color:c.muted, fontWeight:950, textTransform:'uppercase', letterSpacing:'.1em' }}>Agregar bloque</div><div style={{ fontSize:20, fontWeight:950, color:c.ink, marginTop:3 }}>{type ? 'Filtrá y elegí ejercicios' : 'Elegí qué querés agregar'}</div></div><button type="button" onClick={onClose} style={{ border:`1px solid ${c.border}`, background:'#fff', borderRadius:12, width:34, height:34, fontWeight:950 }}>×</button></div>
    <TypeSelector type={type} setType={setType} />
    {!type && <div style={{ marginTop:14, border:`1px dashed ${c.border}`, borderRadius:20, padding:18, textAlign:'center', color:c.muted }}>Elegí una categoría arriba para empezar.</div>}
    {type === 'ejercicio' && <div style={{ marginTop:16, overflowX:'hidden' }}>
      <ChipGroup title="Región" items={ARTICULACION_FILTROS} value={region} onChange={setRegion} />
      <ChipGroup title="Contracción" items={CONTRACCION_FILTROS} value={contraction} onChange={setContraction} />
      <div style={{ display:'grid', gap:8, marginTop:11 }}><input style={input} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar: excéntrico, camilla, polea, unilateral..." /><select style={input} value={group} onChange={e=>setGroup(e.target.value)}>{groups.map(g=><option key={g}>{g}</option>)}</select></div>
      <div style={{ marginTop:12, display:'grid', gap:8, maxHeight:'min(46dvh,470px)', overflowY:'auto', WebkitOverflowScrolling:'touch', paddingRight:2 }}>{options.map(item => <div key={`${item.group}-${item.name}`} style={{ border:`1px solid ${c.border}`, background:'#fff', borderRadius:16, padding:12, display:'flex', justifyContent:'space-between', gap:10, alignItems:'center' }}><div style={{ minWidth:0 }}><div style={{ fontSize:15, fontWeight:950, color:c.ink }}>{item.name}</div><div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:8 }}><span style={tag}>{item.group}</span>{(item.contracciones||[]).slice(0,2).map(x=><span key={x} style={tag2}>{x}</span>)}</div></div><button type="button" onClick={()=>add('ejercicio',{ nombre:item.name, group:item.group, imagen:item.images?.[0], series:'3', repeticiones:'10', indicacion:item.contracciones?.includes('excentrica')?'Bajada lenta y controlada':'' })} style={addBtn}>＋ Agregar</button></div>)}</div>
    </div>}
    {type && type !== 'ejercicio' && <div style={{ marginTop:14, display:'grid', gap:8 }}>{(presets[type]||[]).map(name => <button key={name} type="button" onClick={()=>add(type, type==='indicacion'?{texto:name}:{nombre:name, detalle:name==='Baño de contraste'?'1 min frío / 3 min calor · 3 a 4 rondas':''})} style={{ border:`1px solid ${c.border}`, background:'#fff', borderRadius:16, padding:13, textAlign:'left', cursor:'pointer', fontFamily:'inherit' }}><div style={{ fontSize:15, color:c.ink, fontWeight:950 }}>{name}</div><div style={{ marginTop:4, fontSize:12, color:c.muted }}>Agregar y ajustar parámetros.</div></button>)}</div>}
  </section>
}
const tag = { fontSize:10, color:c.skyDark, background:'#E9F7FA', borderRadius:999, padding:'4px 7px', fontWeight:900 }
const tag2 = { fontSize:10, color:'#5B21B6', background:'#F6F1FF', borderRadius:999, padding:'4px 7px', fontWeight:900 }
const addBtn = { border:'none', borderRadius:14, background:'linear-gradient(135deg,#2F9FB2 0%,#176F82 100%)', color:'#fff', padding:'10px 12px', fontWeight:950, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }

function Header({ rutina, frecuencia, setFrecuencia, focos, toggleFoco, itemsCount, openAdd }) {
  return <section style={{ ...card, padding:16, background:'linear-gradient(135deg,#FFFFFF 0%,#ECF8FA 100%)' }}><div style={{ display:'flex', justifyContent:'space-between', gap:12 }}><div><div style={{ fontSize:11, color:c.muted, fontWeight:950, textTransform:'uppercase', letterSpacing:'.1em' }}>Después de la sesión</div><div style={{ marginTop:3, fontSize:21, color:c.ink, fontWeight:950 }}>{rutina?.nombre || 'Rutina semanal'}</div><div style={{ marginTop:6, fontSize:13, color:c.muted, lineHeight:1.4 }}>Mezclá movilidad, gimnasio, campo, agentes físicos e indicaciones.</div></div><div style={{ minWidth:80, background:'#fff', border:`1px solid ${c.border}`, borderRadius:18, padding:12, textAlign:'center' }}><div style={{ fontSize:24, color:c.ink, fontWeight:950 }}>{itemsCount}</div><div style={{ fontSize:10, color:c.muted, fontWeight:850 }}>ítems</div></div></div><div style={{ display:'grid', gap:10, marginTop:14 }}><select style={input} value={frecuencia} onChange={e=>setFrecuencia(e.target.value)}><option>2 veces antes del próximo control</option><option>3 veces antes del próximo control</option><option>2-3 veces antes del próximo control</option><option>Día por medio hasta el próximo control</option><option>Todos los días suave</option></select><div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>{CONTEXTOS_RUTINA.map(x=>{const a=focos.includes(x.id);return <button key={x.id} type="button" onClick={()=>toggleFoco(x.id)} style={{ border:`1px solid ${a?c.sky:c.border}`, background:a?'#E9F7FA':'#fff', borderRadius:999, padding:'8px 11px', fontSize:12, fontWeight:900, color:a?c.skyDark:c.ink, cursor:'pointer', fontFamily:'inherit' }}>{x.emoji} {x.label}</button>})}</div><div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:8 }}><button type="button" onClick={()=>openAdd('movilidad')} style={ghost}>＋ Movilidad</button><button type="button" onClick={()=>openAdd('ejercicio')} style={ghost}>＋ Gimnasio</button><button type="button" onClick={()=>openAdd('agente')} style={ghost}>＋ Agente</button></div></div></section>
}
const ghost = { border:`1px solid ${c.border}`, background:'#fff', color:c.skyDark, borderRadius:16, padding:'10px 12px', fontSize:13, fontWeight:950, cursor:'pointer', fontFamily:'inherit' }

function Item({ item, index, update, remove, move }) {
  const t = TYPES[item.tipo] || TYPES.ejercicio
  const title = item.nombre || item.texto || t.label
  return <div style={{ border:`1px solid ${c.border}`, background:`linear-gradient(135deg,${t.bg} 0%,#fff 82%)`, borderRadius:20, padding:12 }}><div style={{ display:'flex', gap:10, alignItems:'flex-start' }}><div style={{ width:42, height:42, borderRadius:14, background:'#fff', color:t.color, display:'grid', placeItems:'center', fontWeight:950 }}>{t.icon}</div><div style={{ flex:1, minWidth:0 }}><div style={{ display:'flex', justifyContent:'space-between', gap:8 }}><div><div style={{ fontSize:10, color:t.color, fontWeight:950, textTransform:'uppercase' }}>{index+1}. {t.label}</div><div style={{ marginTop:4, fontSize:16, fontWeight:950, color:c.ink }}>{title}</div><div style={{ marginTop:4, fontSize:12, color:c.muted }}>{summarizeItem(item)}</div></div><div style={{ display:'flex', gap:4 }}><button type="button" onClick={()=>move(index,-1)} style={small}>↑</button><button type="button" onClick={()=>move(index,1)} style={small}>↓</button><button type="button" onClick={()=>remove(index)} style={{...small,color:c.danger}}>×</button></div></div><Fields item={item} index={index} update={update} /></div></div></div>
}
const small = { border:`1px solid ${c.border}`, background:'#fff', borderRadius:12, width:30, height:30, fontWeight:900, cursor:'pointer' }

function Fields({ item, index, update }) {
  if (item.tipo === 'indicacion') return <textarea style={{...input,marginTop:10,minHeight:78}} value={item.texto||''} onChange={e=>update(index,{texto:e.target.value})} />
  if (item.tipo === 'campo') return <textarea style={{...input,marginTop:10,minHeight:78}} value={item.detalle||''} onChange={e=>update(index,{detalle:e.target.value})} />
  return <div style={{ marginTop:10, display:'grid', gap:8 }}><input style={input} value={item.nombre||''} onChange={e=>update(index,{nombre:e.target.value})} placeholder="Nombre" /><div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}><input style={input} value={item.series||item.duracion||''} onChange={e=>update(index, item.tipo==='movilidad'||item.tipo==='cardio'?{duracion:e.target.value}:{series:e.target.value})} placeholder="Series/min" /><input style={input} value={item.repeticiones||item.intensidad||''} onChange={e=>update(index, item.tipo==='cardio'?{intensidad:e.target.value}:{repeticiones:e.target.value})} placeholder="Reps/int" /><input style={input} value={item.pausa||''} onChange={e=>update(index,{pausa:e.target.value})} placeholder="Pausa" /></div><input style={input} value={item.indicacion||item.detalle||''} onChange={e=>update(index, item.tipo==='movilidad'||item.tipo==='cardio'?{detalle:e.target.value}:{indicacion:e.target.value})} placeholder="Indicación / detalle" /></div>
}

export default function ClinicalRoutineEditorPremium({ rutina, onChange }) {
  const [contexto, setContexto] = useState(getRoutineContext(rutina))
  const [frecuencia, setFrecuencia] = useState(getRoutineFrequency(rutina))
  const [focos, setFocos] = useState(getRoutineFocus(rutina))
  const [items, setItems] = useState(() => normalizeRoutineItems(rutina))
  const [addOpen, setAddOpen] = useState(false)
  const [preferredType, setPreferredType] = useState(null)
  function emit(nextItems=items,nextContexto=contexto,nextFrecuencia=frecuencia,nextFocos=focos){setItems(nextItems);setContexto(nextContexto);setFrecuencia(nextFrecuencia);setFocos(nextFocos);onChange?.({contexto:nextContexto,ejercicios:nextItems,frecuencia:nextFrecuencia,focos:nextFocos})}
  function openAdd(type=null){setPreferredType(type);setAddOpen(true)}
  function addItem(item){emit([...items,item]);setAddOpen(false)}
  function updateItem(i,patch){emit(items.map((it,idx)=>idx===i?{...it,...patch}:it))}
  function removeItem(i){emit(items.filter((_,idx)=>idx!==i))}
  function moveItem(i,dir){const t=i+dir;if(t<0||t>=items.length)return;const copy=[...items];const [it]=copy.splice(i,1);copy.splice(t,0,it);emit(copy)}
  function toggleFoco(id){const next=focos.includes(id)?focos.filter(x=>x!==id):[...focos,id];emit(items,next[0]||contexto,frecuencia,next.length?next:[id])}
  return <div style={{ display:'grid', gap:12, overflowX:'hidden' }}><Header rutina={rutina} frecuencia={frecuencia} setFrecuencia={(v)=>emit(items,contexto,v,focos)} focos={focos} toggleFoco={toggleFoco} itemsCount={items.length} openAdd={openAdd} />{addOpen&&<AddPanel preferredType={preferredType} focos={focos} onAdd={addItem} onClose={()=>setAddOpen(false)} />}<section style={{...card,padding:16}}><div style={{ display:'flex', justifyContent:'space-between', gap:10, flexWrap:'wrap' }}><div><div style={{ fontSize:18, fontWeight:950, color:c.ink }}>Secuencia semanal</div><div style={{ fontSize:12, color:c.muted, marginTop:4 }}>Orden real de la rutina.</div></div><button type="button" onClick={()=>openAdd(null)} style={ghost}>+ Agregar bloque</button></div><div style={{ display:'grid', gap:10, marginTop:12 }}>{items.length===0&&<div style={{border:`1px dashed ${c.border}`,borderRadius:20,padding:22,textAlign:'center',color:c.muted}}>Todavía no hay ítems.</div>}{items.map((item,i)=><Item key={i} item={item} index={i} update={updateItem} remove={removeItem} move={moveItem} />)}</div></section></div>
}
