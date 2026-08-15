import { useCallback, useEffect, useRef, useState } from 'react';
import { suscribirEspacios } from '../services/firebase.js';
import { sembrarEspacios, simularCicloDeLecturas } from '../services/simulacion.js';
import { TOTAL_ESPACIOS } from '../utils/constantes.js';

/**
 * Hook central de la aplicación: mantiene los 80 espacios sincronizados en
 * tiempo real con Firebase RTDB y dispara la simulación periódica de
 * lecturas de sensores.
 *
 * @param {object} opciones
 * @param {boolean} opciones.simular  Si true, corre el ciclo de simulación.
 * @param {number}  opciones.intervaloMs  Cada cuánto se simula un ciclo.
 */
export function useEspacios({ simular = true, intervaloMs = 6000 } = {}) {
  const [espacios, setEspacios] = useState({});
  const [cargando, setCargando] = useState(true);
  const [sembrando, setSembrando] = useState(false); // siembra automática inicial (DB vacía)
  const [reiniciando, setReiniciando] = useState(false); // reinicio manual (botón)
  const [error, setError] = useState(null);
  const idsRef = useRef([]);

  useEffect(() => {
    const unsubscribe = suscribirEspacios((data) => {
      setEspacios(data);
      idsRef.current = Object.keys(data);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  // Si la base está vacía tras la primera carga, la sembramos automáticamente.
  useEffect(() => {
    if (!cargando && Object.keys(espacios).length === 0 && !sembrando) {
      setSembrando(true);
      sembrarEspacios()
        .catch((err) => setError(err))
        .finally(() => setSembrando(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando]);

  // Ciclo de simulación periódica.
  useEffect(() => {
    if (!simular) return undefined;
    const intervalo = setInterval(() => {
      if (idsRef.current.length > 0) {
        simularCicloDeLecturas(idsRef.current).catch((err) => setError(err));
      }
    }, intervaloMs);
    return () => clearInterval(intervalo);
  }, [simular, intervaloMs]);

  const reiniciarSimulacion = useCallback(async () => {
    setReiniciando(true);
    setError(null);
    try {
      await sembrarEspacios();
    } catch (err) {
      console.error('Error al reiniciar la simulación:', err);
      setError(err);
      throw err;
    } finally {
      setReiniciando(false);
    }
  }, []);

  const lista = Object.values(espacios).sort((a, b) => {
    if (a.columna !== b.columna) return a.columna - b.columna;
    return a.numero - b.numero;
  });

  const total = TOTAL_ESPACIOS;
  const libres = lista.filter((e) => e.estado === 'libre').length;
  const ocupados = lista.filter((e) => e.estado === 'ocupado').length;
  const sinInformacion = total - lista.length;
  const porcentajeDisponible = total > 0 ? (libres / total) * 100 : 0;

  return {
    espacios: lista,
    cargando: cargando || sembrando, // solo la carga/siembra inicial oculta la cuadrícula
    reiniciando, // el reinicio manual NO oculta la cuadrícula, solo deshabilita el botón
    error,
    reiniciarSimulacion,
    resumen: { total, libres, ocupados, sinInformacion, porcentajeDisponible },
  };
}
