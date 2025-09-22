import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../components/Toast';
import { useRequireRut } from '../hooks/useRequireRut';

type DemItem = { _id: string; codigo?: string; nrc?: string; count: number };

export default function Demanda() {
  useRequireRut();
  const [codCarrera, setCodCarrera] = useState('');
  const [por, setPor] = useState<'codigo' | 'nrc'>('codigo');
  const [data, setData] = useState<DemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function load() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (codCarrera) q.set('codCarrera', codCarrera);
      if (por === 'nrc') q.set('por', 'nrc');
      const res = await api<DemItem[]>(`/proyecciones/demanda/agregada?${q.toString()}`);
      setData(res);
    } catch (e) {
      toast({ type: 'error', message: (e as Error).message || 'Error al cargar demanda' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Demanda Agregada</h2>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="label">Cod Carrera (opcional)</label>
          <input className="input" value={codCarrera} onChange={(e) => setCodCarrera(e.target.value)} />
        </div>
        <div>
          <label className="label">Agrupar por</label>
          <select className="input" value={por} onChange={(e) => setPor(e.target.value as any)}>
            <option value="codigo">Código</option>
            <option value="nrc">NRC</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="btn" onClick={load}>Refrescar</button>
        </div>
      </div>
      <div className="mt-4 overflow-auto">
        {loading && <div>Cargando...</div>}
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Clave</th>
              <th className="py-2 pr-4">Código</th>
              <th className="py-2 pr-4">NRC</th>
              <th className="py-2 pr-4">Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d._id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">{d._id}</td>
                <td className="py-2 pr-4">{d.codigo || '-'}</td>
                <td className="py-2 pr-4">{d.nrc || '-'}</td>
                <td className="py-2 pr-4">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
