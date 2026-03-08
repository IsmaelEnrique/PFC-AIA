const LEGACY_KEY = 'consumidor';

const safeParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getConsumidorSessionKey = (idComercio) => {
  if (!idComercio) return null;
  return `consumidor_${idComercio}`;
};

export const getConsumidorSession = (idComercio) => {
  const key = getConsumidorSessionKey(idComercio);
  if (!key) return null;

  const scoped = safeParse(localStorage.getItem(key));
  if (scoped) return scoped;

  // Compatibilidad: si existe la sesion vieja y es del mismo comercio, migrarla al nuevo key.
  const legacy = safeParse(localStorage.getItem(LEGACY_KEY));
  if (legacy && String(legacy.id_comercio) === String(idComercio)) {
    localStorage.setItem(key, JSON.stringify(legacy));
    localStorage.removeItem(LEGACY_KEY);
    return legacy;
  }

  return null;
};

export const saveConsumidorSession = (idComercio, consumidor) => {
  const key = getConsumidorSessionKey(idComercio);
  if (!key || !consumidor) return;

  localStorage.setItem(key, JSON.stringify(consumidor));
  // Limpiar sesion global vieja para evitar que se reutilice entre tiendas.
  localStorage.removeItem(LEGACY_KEY);
};

export const clearConsumidorSession = (idComercio) => {
  const key = getConsumidorSessionKey(idComercio);
  if (key) localStorage.removeItem(key);

  const legacy = safeParse(localStorage.getItem(LEGACY_KEY));
  if (!legacy) return;

  if (!idComercio || String(legacy.id_comercio) === String(idComercio)) {
    localStorage.removeItem(LEGACY_KEY);
  }
};
