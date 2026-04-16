import { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';

function RowModal({ headers, row, onSave, onClose }) {
  const [values, setValues] = useState(row ? [...row.values] : headers.map(() => ''));

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave(values, row?._rowIndex);
    onClose();
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
          {row ? 'Editar fila' : 'Agregar fila'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {headers.map((h, i) => (
            <div key={i}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', display: 'block', marginBottom: 4 }}>{h || `Col ${i + 1}`}</label>
              <input
                value={values[i] || ''}
                onChange={e => setValues(v => { const n = [...v]; n[i] = e.target.value; return n; })}
                style={{ width: '100%', borderRadius: 10, border: '1px solid #e2e8f0', padding: '9px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#1e293b'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#1e293b', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MainApp({ user, onLogout }) {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState(null);
  const [data, setData] = useState({ headers: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | 'add' | row object

  useEffect(() => {
    api.getSheets().then(setSheets);
  }, []);

  async function selectSheet(sheet) {
    setSelectedSheet(sheet);
    setSelectedTab(null);
    setData({ headers: [], rows: [] });
    const t = await api.getTabs(sheet.id);
    setTabs(t);
    if (t.length > 0) selectTab(sheet, t[0].nombre);
  }

  async function selectTab(sheet, tabName) {
    setSelectedTab(tabName);
    setLoading(true);
    try {
      const d = await api.getData(sheet.id, tabName);
      setData(d);
    } finally { setLoading(false); }
  }

  async function handleSave(values, rowIndex) {
    if (rowIndex) {
      await api.updateRow(selectedSheet.id, selectedTab, rowIndex, values);
    } else {
      await api.addRow(selectedSheet.id, selectedTab, values);
    }
    const d = await api.getData(selectedSheet.id, selectedTab);
    setData(d);
  }

  async function handleDelete(row) {
    if (!confirm(`¿Eliminar esta fila?`)) return;
    await api.deleteRow(selectedSheet.id, selectedTab, row._rowIndex);
    const d = await api.getData(selectedSheet.id, selectedTab);
    setData(d);
  }

  const sidebarW = 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: sidebarW, background: '#1e293b', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#1e293b' }}>C</div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Sistema Clic</span>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>Hola, {user.nombre}</p>
        </div>

        <div style={{ padding: '8px 12px', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 8px 4px' }}>Planillas</p>
          {sheets.map(s => (
            <div key={s.id}>
              <button
                onClick={() => selectSheet(s)}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: 'none', background: selectedSheet?.id === s.id ? 'rgba(255,255,255,0.1)' : 'none', color: selectedSheet?.id === s.id ? '#fff' : '#94a3b8', fontWeight: selectedSheet?.id === s.id ? 600 : 400, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                📊 {s.nombre}
              </button>
              {selectedSheet?.id === s.id && tabs.length > 0 && (
                <div style={{ paddingLeft: 12, marginBottom: 4 }}>
                  {tabs.map(t => (
                    <button
                      key={t.nombre}
                      onClick={() => selectTab(s, t.nombre)}
                      style={{ width: '100%', textAlign: 'left', padding: '7px 12px', borderRadius: 8, border: 'none', background: selectedTab === t.nombre ? 'rgba(255,255,255,0.08)' : 'none', color: selectedTab === t.nombre ? '#e2e8f0' : '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={onLogout} style={{ margin: 12, padding: '10px', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cerrar sesión
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              {selectedSheet ? `${selectedSheet.nombre}${selectedTab ? ` — ${selectedTab}` : ''}` : 'Seleccioná una planilla'}
            </h1>
            {data.rows.length > 0 && <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{data.rows.length} filas</p>}
          </div>
          {selectedTab && (
            <button onClick={() => setModal('add')} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: '#1e293b', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              + Agregar fila
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', padding: 24 }}>
          {!selectedSheet && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
              <p style={{ fontSize: 32 }}>📊</p>
              <p style={{ fontSize: 16, color: '#64748b' }}>Elegí una planilla del menú izquierdo</p>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <p style={{ fontSize: 14, color: '#64748b' }}>Cargando datos...</p>
            </div>
          )}

          {!loading && selectedTab && data.headers.length === 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <p style={{ fontSize: 14, color: '#64748b' }}>Esta hoja está vacía</p>
            </div>
          )}

          {!loading && data.headers.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#1e293b' }}>
                    {data.headers.map((h, i) => (
                      <th key={i} style={{ padding: '12px 14px', textAlign: 'left', color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', borderRight: i < data.headers.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                        {h}
                      </th>
                    ))}
                    <th style={{ padding: '12px 14px', color: '#94a3b8', fontWeight: 500, width: 90 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', background: ri % 2 === 0 ? '#fff' : '#f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? '#fff' : '#f8fafc'}>
                      {row.values.map((v, ci) => (
                        <td key={ci} style={{ padding: '10px 14px', color: '#334155', borderRight: ci < row.values.length - 1 ? '1px solid #f1f5f9' : 'none', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v}
                        </td>
                      ))}
                      <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                        <button onClick={() => setModal(row)} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginRight: 4 }}>
                          Editar
                        </button>
                        <button onClick={() => handleDelete(row)} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <RowModal
          headers={data.headers}
          row={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
