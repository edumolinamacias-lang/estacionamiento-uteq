import { useMemo, useState } from 'react';
import { useEspacios } from '../hooks/useEspacios.jsx';
import ResumenEstacionamiento from '../components/ResumenEstacionamiento.jsx';
import CuadriculaEstacionamiento from '../components/CuadriculaEstacionamiento.jsx';
import FiltrosEspacios from '../components/FiltrosEspacios.jsx';
import MapaEstacionamiento from '../components/MapaEstacionamiento.jsx';
import './Estacionamiento.css';

export default function Estacionamiento() {
  const { espacios, cargando, reiniciando, error, resumen, reiniciarSimulacion } = useEspacios({
    simular: true,
    intervaloMs: 6000,
  });
  const [filtros, setFiltros] = useState({ columna: 'todas', estado: 'todos' });
  const [confirmacion, setConfirmacion] = useState('');

  const espaciosFiltrados = useMemo(() => {
    return espacios.filter((e) => {
      const pasaColumna = filtros.columna === 'todas' || String(e.columna) === filtros.columna;
      const pasaEstado = filtros.estado === 'todos' || e.estado === filtros.estado;
      return pasaColumna && pasaEstado;
    });
  }, [espacios, filtros]);

  async function manejarReinicio() {
    setConfirmacion('');
    try {
      await reiniciarSimulacion();
      setConfirmacion('Simulación reiniciada ✓');
    } catch {
      setConfirmacion('No se pudo reiniciar. Revisa la consola.');
    } finally {
      setTimeout(() => setConfirmacion(''), 3000);
    }
  }

  return (
    <div className="estacionamiento">
      <div className="estacionamiento__header">
        <div>
          <h1>Estacionamiento UTEQ</h1>
          <p className="estacionamiento__sub mono">
            Actualización en tiempo real vía Firebase Realtime Database
          </p>
        </div>
        <div className="estacionamiento__reset-grupo">
          {confirmacion && <span className="estacionamiento__confirmacion mono">{confirmacion}</span>}
          <button className="estacionamiento__reset" onClick={manejarReinicio} disabled={reiniciando}>
            {reiniciando ? 'Reiniciando…' : 'Reiniciar simulación'}
          </button>
        </div>
      </div>

      {error && <p className="estacionamiento__error">Error: {error.message}</p>}

      <ResumenEstacionamiento resumen={resumen} />

      <FiltrosEspacios filtros={filtros} onCambiar={setFiltros} />

      {cargando ? (
        <p className="estacionamiento__cargando mono">Sembrando y sincronizando los 80 sensores…</p>
      ) : (
        <CuadriculaEstacionamiento espacios={espaciosFiltrados} />
      )}

      <section className="estacionamiento__mapa-seccion">
        <h2>Ubicación del parqueadero</h2>
        <MapaEstacionamiento />
      </section>
    </div>
  );
}
