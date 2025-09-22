import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../store/appStore';
import { useRequireRut } from '../hooks/useRequireRut';
import { useToast } from '../components/Toast';

type Proj = { seleccion: { codigo: string; asignatura: string; creditos: number; nivel: number; nrc?: string; motivo: string }[]; totalCreditos: number };
type Course = { codigo: string; asignatura: string; creditos: number; nivel: number; prereq: string };

export default function Plan() {
  const rut = useRequireRut();
  const { seleccion: sel, setSeleccion: setSel, carreras, tope, setTope, period, setPeriod } = useApp();
  const [proj, setProj] = useState<Proj | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [nivelObjetivo, setNivelObjetivo] = useState<number | ''>('');
  const [prioritariosCsv, setPrioritariosCsv] = useState('');
  const prioritarios = prioritariosCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const [malla, setMalla] = useState<Course[]>([]);
  const [mallaFiltro, setMallaFiltro] = useState('');
  const [seleccionados, setSeleccionados] = useState<Record<string, boolean>>({});
  const [opciones, setOpciones] = useState<Proj[]>([]);

  useEffect(() => {
    // carga malla al cambiar seleccion
    if (!sel) return;
    (async () => {
      try {
        const data = await api<Course[]>(`/ucn/malla/${encodeURIComponent(sel.codCarrera)}/${encodeURIComponent(sel.catalogo)}`);
        setMalla(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [sel?.codCarrera, sel?.catalogo]);
  const disabled = useMemo(() => !rut || !sel, [rut, sel]);

  async function generar(e: FormEvent) {
    e.preventDefault();
    if (!sel) return;
    setLoading(true);
    try {
      const data = await api<Proj>('/proyecciones/generar', {
        method: 'POST',
        body: JSON.stringify({
          rut,
          codCarrera: sel.codCarrera,
          catalogo: sel.catalogo,
          topeCreditos: tope,
          nivelObjetivo: typeof nivelObjetivo === 'number' ? nivelObjetivo : undefined,
          prioritarios,
        }),
      });
      setProj(data);
      toast({ type: 'success', message: 'Proyeccion generada' });
    } catch (e) {
      toast({ type: 'error', message: (e as Error).message || 'Error al generar' });
    } finally {
      setLoading(false);
    }
  }

  // generar con oferta deshabilitado segun requerimiento actual

  async function generarOpciones() {
    if (!sel) return;
    setLoading(true);
    try {
      const res = await api<{ opciones: Proj[] }>(`/proyecciones/generar-opciones`, {
        method: 'POST',
        body: JSON.stringify({
          rut,
          codCarrera: sel.codCarrera,
          catalogo: sel.catalogo,
          topeCreditos: tope,
          nivelObjetivo: typeof nivelObjetivo === 'number' ? nivelObjetivo : undefined,
          prioritarios,
          maxOptions: 5,
        }),
      });
      setOpciones(res.opciones);
      toast({ type: 'success', message: `${res.opciones.length} opciones generadas` });
    } catch (e) {
      toast({ type: 'error', message: (e as Error).message || 'Error al generar opciones' });
    } finally {
      setLoading(false);
    }
  }

  async function guardarOpcion(p: Proj, favorite: boolean) {
    if (!sel) return;
    await api(`/proyecciones/guardar-directo`, {
      method: 'POST',
      body: JSON.stringify({
        rut,
        codCarrera: sel.codCarrera,
        catalogo: sel.catalogo,
        nombre: favorite ? 'favorita' : 'opcion',
        favorite,
        totalCreditos: p.totalCreditos,
        items: p.seleccion,
      }),
    });
    toast({ type: 'success', message: favorite ? 'Opcion guardada como favorita' : 'Opcion guardada' });
  }

  async function guardar(favorite: boolean) {
    if (!sel || !proj) return;
    const saved = await api('/proyecciones/guardar', {
      method: 'POST',
      body: JSON.stringify({ rut, codCarrera: sel.codCarrera, catalogo: sel.catalogo, topeCreditos: tope, favorite, nombre: 'mi plan' }),
    });
    console.log('guardado', saved);
    toast({ type: 'success', message: favorite ? 'Guardada como favorita' : 'Proyeccion guardada' });
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold">Generar Proyeccion</h2>
        <form className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-3" onSubmit={generar}>
          <div>
            <label className="label">RUT</label>
            <input className="input" value={rut} readOnly />
          </div>
          <div>
            <label className="label">Carrera/Catálogo</label>
            <select
              className="input"
              value={sel ? `${sel.codCarrera}-${sel.catalogo}` : ''}
              onChange={(e) => {
                const [codCarrera, catalogo] = e.target.value.split('-');
                setSel({ codCarrera, catalogo });
              }}
            >
              {carreras.map((c) => (
                <option key={`${c.codigo}-${c.catalogo}`} value={`${c.codigo}-${c.catalogo}`}>
                  {c.nombre} ({c.codigo}-{c.catalogo})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tope Creditos</label>
            <input className="input" type="number" value={tope} onChange={(e) => setTope(Number(e.target.value))} />
          </div>
          {/* periodo deshabilitado */}
          <div>
            <label className="label">Nivel objetivo (opcional)</label>
            <input
              className="input"
              type="number"
              placeholder="3"
              value={nivelObjetivo}
              onChange={(e) => setNivelObjetivo(e.target.value ? Number(e.target.value) : '')}
            />
          </div>
          <div className="flex items-end gap-2">
            <button className="btn" disabled={disabled || loading} type="submit">{loading ? '...' : 'Generar'}</button>
          </div>
        </form>
        <div className="mt-3">
          <label className="label">Cursos prioritarios (codigos separados por coma)</label>
          <input
            className="input"
            placeholder="DCCB-00264,DCCB-00106"
            value={prioritariosCsv}
            onChange={(e) => setPrioritariosCsv(e.target.value)}
          />
        </div>
        {false && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Malla (selector de prioritarios)</h3>
              <input className="input max-w-[200px]" placeholder="filtrar" value={mallaFiltro} onChange={(e) => setMallaFiltro(e.target.value)} />
            </div>
            <div className="max-h-64 overflow-auto mt-2">
              {malla
                .filter((c) => c.codigo.toLowerCase().includes(mallaFiltro.toLowerCase()) || c.asignatura.toLowerCase().includes(mallaFiltro.toLowerCase()))
                .map((c) => (
                  <label key={c.codigo} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={!!seleccionados[c.codigo]}
                      onChange={(e) => setSeleccionados((prev) => ({ ...prev, [c.codigo]: e.target.checked }))}
                    />
                    <span className="text-sm">{c.codigo} · {c.asignatura} · {c.creditos}cr · n{c.nivel}</span>
                  </label>
                ))}
            </div>
            <div className="mt-2">
              <button
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => {
                  const selectedCodes = Object.entries(seleccionados)
                    .filter(([, v]) => v)
                    .map(([k]) => k);
                  const merged = Array.from(new Set([...prioritarios, ...selectedCodes]));
                  setPrioritariosCsv(merged.join(','));
                  toast({ type: 'success', message: `${selectedCodes.length} agregados a prioritarios` });
                }}
              >
                Agregar seleccionados a prioritarios
              </button>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Opciones sugeridas</h3>
              <button className="btn" onClick={generarOpciones} disabled={loading || !sel}>Generar opciones</button>
            </div>
            <div className="mt-2 space-y-3">
              {opciones.map((p, idx) => (
                <div key={idx} className="border rounded p-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Opcion #{idx + 1} · {p.totalCreditos} creditos</div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={() => guardarOpcion(p, false)}>Guardar</button>
                      <button className="btn" onClick={() => guardarOpcion(p, true)}>Guardar favorita</button>
                    </div>
                  </div>
                  <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
                    {p.seleccion.map((c) => {
                      const tags: string[] = [];
                      if (prioritarios.includes(c.codigo)) tags.push('prioridad');
                      if (c.motivo === 'REPROBADO') tags.push('reprobado');
                      const tagStr = tags.length ? ` [${tags.join(', ')}]` : '';
                      return (
                        <li key={c.codigo}>{c.codigo} · {c.asignatura} ({c.creditos}){tagStr}</li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {opciones.length === 0 && <div className="text-sm text-gray-600">Genera opciones para ver alternativas</div>}
            </div>
          </div>
        </div>
        )}
      </div>

      {proj && (
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Seleccion ({proj.totalCreditos} créditos)</h3>
            <div className="flex gap-2">
              <button className="btn" onClick={() => guardar(false)}>Guardar</button>
              <button className="btn" onClick={() => guardar(true)}>Guardar como Favorita</button>
            </div>
          </div>
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Código</th>
                  <th className="py-2 pr-4">Asignatura</th>
                  <th className="py-2 pr-4">Créditos</th>
                  <th className="py-2 pr-4">Nivel</th>
                  <th className="py-2 pr-4">Motivo</th>
                  <th className="py-2 pr-4">NRC</th>
                </tr>
              </thead>
              <tbody>
                {proj.seleccion.map((c) => (
                  <tr key={c.codigo} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4">{c.codigo}</td>
                    <td className="py-2 pr-4">{c.asignatura}</td>
                    <td className="py-2 pr-4">{c.creditos}</td>
                    <td className="py-2 pr-4">{c.nivel}</td>
                    <td className="py-2 pr-4">{c.motivo}</td>
                    <td className="py-2 pr-4">{c.nrc || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Malla (selector de prioritarios)</h3>
            <input className="input max-w-[200px]" placeholder="filtrar" value={mallaFiltro} onChange={(e) => setMallaFiltro(e.target.value)} />
          </div>
          <div className="max-h-64 overflow-auto mt-2">
            {malla
              .filter((c) => c.codigo.toLowerCase().includes(mallaFiltro.toLowerCase()) || c.asignatura.toLowerCase().includes(mallaFiltro.toLowerCase()))
              .map((c) => (
                <label key={c.codigo} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={!!seleccionados[c.codigo]}
                    onChange={(e) => setSeleccionados((prev) => ({ ...prev, [c.codigo]: e.target.checked }))}
                  />
                  <span className="text-sm">{c.codigo} · {c.asignatura} ({c.creditos}) · n{c.nivel}</span>
                </label>
              ))}
          </div>
          <div className="mt-2">
            <button
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => {
                const selectedCodes = Object.entries(seleccionados)
                  .filter(([, v]) => v)
                  .map(([k]) => k);
                const merged = Array.from(new Set([...prioritarios, ...selectedCodes]));
                setPrioritariosCsv(merged.join(','));
                toast({ type: 'success', message: `${selectedCodes.length} agregados a prioritarios` });
              }}
            >
              Agregar seleccionados a prioritarios
            </button>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Opciones sugeridas</h3>
            <button className="btn" onClick={generarOpciones} disabled={loading || !sel}>Generar opciones</button>
          </div>
          <div className="mt-2 space-y-3">
            {(prioritarios.length ? opciones.filter((p) => p.seleccion.some((x) => prioritarios.includes(x.codigo))) : opciones).map((p, idx) => (
              <div key={idx} className="border rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Opcion #{idx + 1} · {p.totalCreditos} creditos</div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={() => guardarOpcion(p, false)}>Guardar</button>
                    <button className="btn" onClick={() => guardarOpcion(p, true)}>Guardar favorita</button>
                  </div>
                </div>
                <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
                  {p.seleccion.map((c) => {
                    const tags: string[] = [];
                    if (prioritarios.includes(c.codigo)) tags.push('prioridad');
                    if (c.motivo === 'REPROBADO') tags.push('reprobado');
                    const tagStr = tags.length ? ` [${tags.join(', ')}]` : '';
                    return (
                      <li key={c.codigo}>{c.codigo} · {c.asignatura} ({c.creditos}){tagStr}</li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {opciones.length === 0 && <div className="text-sm text-gray-600">Genera opciones para ver alternativas</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
