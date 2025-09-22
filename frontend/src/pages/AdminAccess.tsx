import { useApp } from '../store/appStore';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

export default function AdminAccess() {
  const { adminKey, setAdminKey } = useApp();
  const toast = useToast();
  const nav = useNavigate();

  function save() {
    if (!adminKey) {
      toast({ type: 'error', message: 'Debes ingresar una clave' });
      return;
    }
    toast({ type: 'success', message: 'Clave admin guardada' });
    nav('/oferta');
  }

  function clear() {
    setAdminKey('');
    toast({ type: 'info', message: 'Clave admin limpia' });
  }

  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="text-xl font-semibold">Acceso Administrador</h1>
      <p className="text-sm text-gray-600 mt-1">Requerido para cargar ofertas y respaldos.</p>
      <div className="mt-3 space-y-3">
        <div>
          <label className="label">X-ADMIN-KEY</label>
          <input className="input" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="clave" />
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={save}>Guardar</button>
          <button className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" onClick={clear}>Limpiar</button>
        </div>
      </div>
    </div>
  );
}

