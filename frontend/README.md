# Frontend (React + Vite + Tailwind)

## Requisitos
- Node.js 20+

## Configuración
1. Copia `.env.example` a `.env` y ajusta:
   - `VITE_API_BASE=http://localhost:3000/api` (o la URL de tu backend)

2. Instala dependencias:
   - `npm install`

## Desarrollo
- `npm run dev` y abre `http://localhost:5173`

## Build
- `npm run build` genera `dist/`
- `npm run preview` sirve el build localmente

## Rutas y Flujo
- `/` Login UCN (guarda RUT, carreras y selección)
- `/plan` Generar proyección (con o sin oferta), guardar y marcar favorita
- `/proyecciones` Listado, marcar favorita (con confirmación) y borrar (con confirmación)
- `/demanda` Demanda agregada por código o NRC de favoritas
- `/admin` Ingresar/limpiar X-ADMIN-KEY (persistente en localStorage)
- `/oferta` Cargar CSV de oferta (requiere X-ADMIN-KEY); listar oferta por curso/período

## Seguridad y Buenas Prácticas
- El backend aplica CORS restringido y exige `X-ADMIN-KEY` para endpoints sensibles.
- Este frontend no almacena la clave admin en cookies; la guarda en `localStorage` del navegador del usuario. En producción, considera proteger el acceso administrativo con autenticación real de usuarios.
- Errores y acciones muestran toasts para feedback.
- Confirmaciones para acciones destructivas (borrar, cambiar favorita). Logout también pide confirmación.

## Ajustes de UX
- Navbar muestra RUT y carrera seleccionada; botón “Salir” limpia estado local.
- Se usa un store global (`src/store/appStore.tsx`) para RUT, carreras, selección, period, tope y adminKey.

## Notas
- Si `USE_STUBS=true` en el backend, el Login funciona offline con los datos de prueba.
- Para cargar oferta debes ingresar la `X-ADMIN-KEY` que el backend valida via `ADMIN_API_KEY`.
