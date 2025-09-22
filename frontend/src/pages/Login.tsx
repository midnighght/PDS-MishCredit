import { FormEvent, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useApp } from '../store/appStore';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

type Carrera = { codigo: string; nombre: string; catalogo: string };

type LoginResponse = { rut: string; carreras: Carrera[] };

type ForgotResponse = { ok: boolean; message?: string };

export default function Login() {
  const toast = useToast();
  const nav = useNavigate();
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotRut, setForgotRut] = useState('');
  const { rut, setRut, carreras, setCarreras, seleccion, setSeleccion } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rut && !forgotRut) setForgotRut(rut);
  }, [rut, forgotRut]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api<LoginResponse>(`/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: emailInput, password }),
      });
      setRut(res.rut);
      setCarreras(res.carreras);
      if (res.carreras[0])
        setSeleccion({
          codCarrera: res.carreras[0].codigo,
          catalogo: res.carreras[0].catalogo,
        });
      setForgotRut(res.rut);
      toast({ type: 'success', message: 'Login exitoso' });
      nav('/plan');
    } catch (e) {
      const msg = (e as Error).message || 'Error de login';
      setError(msg);
      toast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Login UCN</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="juan@example.com"
            type="email"
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <div className="mt-3 text-sm">
        <button className="text-blue-700 hover:underline" onClick={() => setForgotOpen((v) => !v)}>
          Olvide mi contrasena
        </button>
        {forgotOpen && (
          <div className="mt-2 space-y-2">
            <div>
              <label className="label">RUT asociado</label>
              <input
                className="input"
                value={forgotRut}
                onChange={(e) => setForgotRut(e.target.value)}
                placeholder="333333333"
              />
            </div>
            <button
              className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
              onClick={async () => {
                try {
                  const rutValue = (forgotRut || rut || '').trim();
                  if (!rutValue) {
                    toast({
                      type: 'error',
                      message: 'Ingresa un RUT para recuperar la contrasena',
                    });
                    return;
                  }
                  const res = await api<ForgotResponse>(`/auth/forgot`, {
                    method: 'POST',
                    body: JSON.stringify({ rut: rutValue }),
                  });
                  toast({
                    type: 'success',
                    message:
                      res.message || 'Se envio una contrasena temporal al correo registrado',
                  });
                } catch (e) {
                  toast({
                    type: 'error',
                    message: (e as Error).message || 'Datos no coinciden',
                  });
                }
              }}
            >
              Enviar contrasena temporal
            </button>
          </div>
        )}
      </div>
      <div className="mt-6 border-t pt-4 text-sm">
        <div className="text-gray-600 mb-2">Acceso administrador</div>
        <button className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" onClick={() => nav('/admin')}>
          Ingresar como admin
        </button>
      </div>
      {rut && (
        <div className="mt-4">
          <div className="text-sm text-gray-600">RUT: {rut}</div>
          <div className="mt-2">
            <label className="label">Carrera y catalogo</label>
            <select
              className="input"
              value={seleccion ? `${seleccion.codCarrera}-${seleccion.catalogo}` : ''}
              onChange={(e) => {
                const [codCarrera, catalogo] = e.target.value.split('-');
                setSeleccion({ codCarrera, catalogo });
              }}
            >
              {carreras.map((c) => (
                <option key={`${c.codigo}-${c.catalogo}`} value={`${c.codigo}-${c.catalogo}`}>
                  {c.nombre} ({c.codigo}-{c.catalogo})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {error && <div className="text-red-600 mt-3">{error}</div>}
    </div>
  );
}
