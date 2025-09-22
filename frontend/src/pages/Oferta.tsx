import { FormEvent, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../components/Toast';
import { useApp } from '../store/appStore';
import { useRequireAdminKey } from '../hooks/useRequireAdminKey';

export default function Oferta() {
  useRequireAdminKey();
  const toast = useToast();
  const [csv, setCsv] = useState(
    'period,nrc,course,codigoparalelo,dia,inicio,fin,sala,cupos\n202520,21943,DCCB-00264,A1,LU,08:00,09:20,A-101,60\n202520,21943,DCCB-00264,A1,MI,08:00,09:20,A-101,60',
  );
  const { adminKey, setAdminKey } = useApp();
  const [course, setCourse] = useState('DCCB-00264');
  const [period, setPeriod] = useState('202520');
  const [rows, setRows] = useState<any[]>([]);

  async function cargar(e: FormEvent) {
    e.preventDefault();
    try {
      await api('/oferta/cargar', {
        method: 'POST',
        headers: { 'X-ADMIN-KEY': adminKey },
        body: JSON.stringify({ csv }),
      });
      toast({ type: 'success', message: 'Oferta cargada' });
    } catch (e) {
      toast({ type: 'error', message: (e as Error).message || 'Error al cargar oferta' });
    }
  }

  async function listar() {
    try {
      const data = await api<any[]>(`/oferta/listar?course=${encodeURIComponent(course)}&period=${encodeURIComponent(period)}`);
      setRows(data);
      toast({ type: 'success', message: `${data.length} paralelos` });
    } catch (e) {
      toast({ type: 'error', message: (e as Error).message || 'Error al listar oferta' });
    }
  }

  return (
    <div className="space-y-4">
      {!adminKey && (
        <div className="card">
          <h2 className="text-lg font-semibold">Acceso Admin</h2>
          <p className="text-sm text-gray-600">Ingresa la llave de administrador para acceder a esta seccion.</p>
          <div className="mt-3 flex gap-2">
            <input className="input" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="X-ADMIN-KEY" />
          </div>
        </div>
      )}
      {adminKey && (
        <div className="card">
          <h2 className="text-lg font-semibold">Cargar Oferta (Admin)</h2>
          <form className="mt-3 space-y-3" onSubmit={cargar}>
            <div>
              <label className="label">X-ADMIN-KEY</label>
              <input className="input" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="clave" />
            </div>
            <div>
              <label className="label">CSV</label>
              <textarea className="input" rows={6} value={csv} onChange={(e) => setCsv(e.target.value)} />
            </div>
            <button className="btn" type="submit">Cargar</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold">Listar Oferta</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="label">Curso</label>
            <input className="input" value={course} onChange={(e) => setCourse(e.target.value)} />
          </div>
          <div>
            <label className="label">Periodo</label>
            <input className="input" value={period} onChange={(e) => setPeriod(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn" onClick={listar} type="button">Listar</button>
          </div>
        </div>
        <div className="mt-3">
          {rows.map((r) => (
            <div key={r.nrc} className="border rounded p-2 mb-2">
              <div className="font-medium">{r.course} - NRC {r.nrc} ({r.codigoParalelo}) - Cupos {r.cupos}</div>
              <div className="text-sm text-gray-600">{r.slots.map((s: any) => `${s.dia} ${s.inicio}-${s.fin}`).join(', ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
