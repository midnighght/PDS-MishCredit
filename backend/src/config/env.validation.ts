// validacion simple de variables de entorno sin acentos ni punto final

type EnvInput = Record<string, unknown>;

function toBool(v: unknown, def = false): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string')
    return ['true', '1', 'yes', 'y'].includes(v.toLowerCase());
  return def;
}

export function validateEnvConfig(env: EnvInput) {
  const out: Record<string, unknown> = { ...env };

  // mongo uri con valor por defecto
  const mongo =
    (env.MONGO_URI as string) || 'mongodb://localhost:27017/planificador';
  out.MONGO_URI = mongo;

  // puclaro y hawaii pueden faltar en modo stubs
  const useStubs = toBool(env.USE_STUBS, false);
  out.USE_STUBS = useStubs ? 'true' : 'false';
  const useFallback = toBool(env.USE_BACKUP_FALLBACK, false);
  out.USE_BACKUP_FALLBACK = useFallback ? 'true' : 'false';

  if (!useStubs) {
    if (!env.UCN_BASE_PUCLARO || typeof env.UCN_BASE_PUCLARO !== 'string') {
      throw new Error('UCN_BASE_PUCLARO requerido');
    }
    if (!env.UCN_BASE_HAWAII || typeof env.UCN_BASE_HAWAII !== 'string') {
      throw new Error('UCN_BASE_HAWAII requerido');
    }
    if (!env.HAWAII_AUTH || typeof env.HAWAII_AUTH !== 'string') {
      throw new Error('HAWAII_AUTH requerido');
    }
  }

  const port = Number(env.PORT ?? 3000);
  if (!Number.isFinite(port) || port <= 0) throw new Error('PORT invalido');
  out.PORT = String(port);

  // admin api key para respaldos
  if (env.ADMIN_API_KEY && typeof env.ADMIN_API_KEY !== 'string') {
    throw new Error('ADMIN_API_KEY invalida');
  }

  return out as NodeJS.ProcessEnv;
}
