import { useMemo, useState } from 'react';
import { useEspacios } from '../hooks/useEspacios.jsx';
import ResumenEstacionamiento from '../components/ResumenEstacionamiento.jsx';
import CuadriculaEstacionamiento from '../components/CuadriculaEstacionamiento.jsx';
import FiltrosEspacios from '../components/FiltrosEspacios.jsx';
import MapaEstacionamiento from '../components/MapaEstacionamiento.jsx';
import PanelSensor from '../components/PanelSensor.jsx';
import { ref, update } from "firebase/database";
import { db } from "../services/firebase";
import './Estacionamiento.css';

export default function Estacionamiento() {
  const { espacios, cargando, reiniciando, error, resumen, reiniciarSimulacion } = useEspacios({
    simular: true,
    intervaloMs: 6000,
  });
  const [filtros, setFiltros] = useState({ columna: 'todas', estado: 'todos' });
  const [confirmacion, setConfirmacion] = useState('');
  const [seleccionadoId, setSeleccionadoId] = useState(null);

  const espaciosFiltrados = useMemo(() => {
    return espacios.filter((e) => {
      const pasaColumna = filtros.columna === 'todas' || String(e.columna) === filtros.columna;
      const pasaEstado = filtros.estado === 'todos' || e.estado === filtros.estado;
      return pasaColumna && pasaEstado;
    });
  }, [espacios, filtros]);

  // El espacio seleccionado se busca en `espacios` (no en el filtrado) para
  // que el panel siga mostrando datos en vivo aunque el filtro lo oculte.
  const espacioSeleccionado = espacios.find((e) => e.id === seleccionadoId) ?? null;

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

  // Función corregida para simular el cambio de estado individual apuntando a 'espacios'
  async function manejarSimulacionIndividual() {
    if (!espacioSeleccionado) {
      console.log("No hay ningún espacio seleccionado.");
      return;
    }
    
    // Si la distancia detectada actual es mayor a 50, pasa a 25 (ocupado); si no, a 150 (libre)
    const distanciaActual = espacioSeleccionado.distanciaDetectada ?? 150;
    const nuevaDistancia = distanciaActual > 50 ? 25 : 150;
    const nuevoEstado = nuevaDistancia <= 50 ? 'ocupado' : 'libre';

    try {
      // Ruta corregida al nodo raíz 'espacios' con los campos exactos de Firebase
      const sensorRef = ref(db, `espacios/${espacioSeleccionado.id}`);
      await update(sensorRef, {
        distanciaDetectada: nuevaDistancia,
        estado: nuevoEstado,
        fechaHora: Date.now()
      });
      console.log(`¡Sensor ${espacioSeleccionado.id} actualizado correctamente a ${nuevaDistancia} cm (${nuevoEstado})!`);
    } catch (error) {
      console.error("Error al simular el cambio de estado individual:", error);
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

      <div className="estacionamiento__layout">
        {cargando ? (
          <p className="estacionamiento__cargando mono">Sembrando y sincronizando los 80 sensores…</p>
        ) : (
          <CuadriculaEstacionamiento
            espacios={espaciosFiltrados}
            seleccionadoId={seleccionadoId}
            onSeleccionar={(espacio) => setSeleccionadoId(espacio.id)}
          />
        )}

        <PanelSensor 
          espacio={espacioSeleccionado} 
          onCerrar={() => setSeleccionadoId(null)}
          onSimularCambio={manejarSimulacionIndividual}
        />
      </div>

      <section className="estacionamiento__mapa-seccion">
        <h2>Ubicación del parqueadero</h2>
        <MapaEstacionamiento />
      </section>
    </div>
  );
}