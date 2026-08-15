import { useEffect, useState } from 'react';
import { suscribirHistorial } from '../services/firebase.js';

/**
 * Suscribe al historial de mediciones de un espacio puntual.
 * Devuelve la lista ordenada cronológicamente (más antigua -> más reciente).
 */
export function useHistorialEspacio(id, limite = 50) {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!id) return undefined;
    setCargando(true);
    const unsubscribe = suscribirHistorial(
      id,
      (lista) => {
        setHistorial(lista);
        setCargando(false);
      },
      limite
    );
    return () => unsubscribe();
  }, [id, limite]);

  return { historial, cargando };
}
