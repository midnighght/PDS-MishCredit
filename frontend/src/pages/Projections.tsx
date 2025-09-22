import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useRequireRut } from '../hooks/useRequireRut';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Confirm';

type ProjSaved = { _id: string; nombre?: string; isFavorite?: boolean; totalCreditos: number; createdAt: string; items: { codigo: string; asignatura: string; creditos: number; nivel: number; nrc?: string }[] };

export default function Projections() {
  const rut = useRequireRut();
  const [list, setList] = useState<ProjSaved[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editName, setEditName] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const data = await api<ProjSaved[]>(`/proyecciones/mias?rut=${encodeURIComponent(rut)}`);
      setList(data);
    } catch (e) {
      toast({ type: 'error', message: (e as Error).message || 'Error al cargar' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (rut) void load();
  }, [rut]);

  async function favorita(id: string) {
    const ok = await confirm({ title: 'Marcar favorita', description: 'Esto reemplazara tu favorita anterior. ¿Continuar?' });
    if (!ok) return;
    await api(`/proyecciones/favorita/${id}`, { method: 'PATCH', body: JSON.stringify({ rut }) });
    toast({ type: 'success', message: 'Marcada como favorita' });
    await load();
  }

  async function borrar(id: string) {
    const ok = await confirm({ title: 'Borrar proyeccion', description: 'Esta accion es irreversible. ¿Continuar?' });
    if (!ok) return;
    await api(`/proyecciones/${id}?rut=${encodeURIComponent(rut)}`, { method: 'DELETE' });
    toast({ type: 'success', message: 'Proyeccion borrada' });
    await load();
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Mis Proyecciones</h2>
      {loading && <div className="mt-2">Cargando...</div>}
      <div className="mt-3 space-y-3">
        {list.map((p) => (
          <div key={p._id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium flex items-center gap-2">
                <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setExpanded((e) => ({ ...e, [p._id]: !e[p._id] }))}>
                  {expanded[p._id] ? 'Ocultar' : 'Ver malla'}
                </button>
                <span>{p.isFavorite ? '⭐' : ''}</span>
                <input
                  className="input max-w-[260px]"
                  placeholder="sin nombre"
                  value={editName[p._id] ?? p.nombre ?? ''}
                  onChange={(e) => setEditName((s) => ({ ...s, [p._id]: e.target.value }))}
                />
                <button
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  onClick={async () => {
                    const nombre = (editName[p._id] ?? p.nombre ?? '').trim();
                    await api(`/proyecciones/${p._id}/nombre`, { method: 'PATCH', body: JSON.stringify({ rut, nombre }) });
                    toast({ type: 'success', message: 'Nombre actualizado' });
                    await load();
                  }}
                >
                  Guardar nombre
                </button>
              </div>
              <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-sm text-gray-600">Créditos: {p.totalCreditos}</div>
            {expanded[p._id] && (
              <ul className="mt-2 text-sm list-disc pl-5">
                {p.items.map((it) => (
                  <li key={it.codigo}>{it.codigo} · {it.asignatura} ({it.creditos}cr){it.nrc ? ` · NRC ${it.nrc}` : ''}</li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex gap-2">
              <button className="btn" onClick={() => favorita(p._id)}>Marcar favorita</button>
              <button className="btn" onClick={() => borrar(p._id)}>Borrar</button>
            </div>
          </div>
        ))}
        {list.length === 0 && !loading && <div>No hay proyecciones</div>}
      </div>
    </div>
  );
}
