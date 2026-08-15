import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase.js';
import { useHistorialEspacio } from '../hooks/useHistorialEspacio.jsx';
import HistorialEspacio from '../components/HistorialEspacio.jsx';
import MapaEstacionamiento from '../components/MapaEstacionamiento.jsx';
import './DetalleEspacio.css';

function useEspacio(id) {
  const [espacio, setEspacio] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!id) return undefined;
    const espacioRef = ref(db, `espacios/${id}`);
    const unsubscribe = onValue(espacioRef, (snapshot) => {
      setEspacio(snapshot.val());
      setCargando(false);
    });
    return () => unsubscribe();
  }, [id]);

  return { espacio, cargando };
}

export default function DetalleEspacio() {
  const { id } = useParams();
  const { espacio, cargando } = useEspacio(id);
  const { historial, cargando: cargandoHistorial } = useHistorialEspacio(id);

  if (cargando) {
    return <p className="detalle__estado mono">Cargando espacio…</p>;
  }

  if (!espacio) {
    return (
      <div className="detalle__no-encontrado">
        <p>No se encontró el espacio “{id}”.</p>
        <Link to="/estacionamiento">← Volver al estacionamiento</Link>
      </div>
    );
  }

  return (
    <div className="detalle">
      <Link to="/estacionamiento" className="detalle__volver">
        ← Volver a la cuadrícula
      </Link>

      <div className="detalle__header">
        <h1 className="mono">{espacio.id}</h1>
        <span className={`detalle__badge detalle__badge--${espacio.estado}`}>{espacio.estado}</span>
      </div>

      <div className="detalle__cuerpo">
        <div className="detalle__ficha">
          <h2>Información del espacio</h2>
          <dl className="detalle__lista">
            <div>
              <dt>Columna</dt>
              <dd className="mono">{espacio.columna}</dd>
            </div>
            <div>
              <dt>Número</dt>
              <dd className="mono">{espacio.numero}</dd>
            </div>
            <div>
              <dt>Distancia detectada</dt>
              <dd className="mono">{espacio.distanciaDetectada?.toFixed(1)} cm</dd>
            </div>
            <div>
              <dt>Última actualización</dt>
              <dd className="mono">{new Date(espacio.fechaHora).toLocaleString('es-EC')}</dd>
            </div>
            <div>
              <dt>Ubicación</dt>
              <dd>{espacio.ubicacion?.nombre}</dd>
            </div>
            <div>
              <dt>Latitud / Longitud</dt>
              <dd className="mono">
                {espacio.ubicacion?.latitud.toFixed(6)}, {espacio.ubicacion?.longitud.toFixed(6)}
              </dd>
            </div>
          </dl>

          <h3>Bounding box</h3>
          <dl className="detalle__lista detalle__lista--bbox">
            <div>
              <dt>Norte</dt>
              <dd className="mono">{espacio.ubicacion?.boundingBox.norte.toFixed(6)}</dd>
            </div>
            <div>
              <dt>Sur</dt>
              <dd className="mono">{espacio.ubicacion?.boundingBox.sur.toFixed(6)}</dd>
            </div>
            <div>
              <dt>Este</dt>
              <dd className="mono">{espacio.ubicacion?.boundingBox.este.toFixed(6)}</dd>
            </div>
            <div>
              <dt>Oeste</dt>
              <dd className="mono">{espacio.ubicacion?.boundingBox.oeste.toFixed(6)}</dd>
            </div>
          </dl>
        </div>

        <div className="detalle__mapa">
          <MapaEstacionamiento espacio={espacio} />
        </div>
      </div>

      <section className="detalle__historial">
        <h2>Historial de mediciones</h2>
        <HistorialEspacio historial={historial} cargando={cargandoHistorial} />
      </section>
    </div>
  );
}
