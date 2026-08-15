import { Link } from 'react-router-dom';
import { useHistorialEspacio } from '../hooks/useHistorialEspacio.jsx';
import './PanelSensor.css';

function formatHora(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ESTADO_LABEL = { libre: 'Libre', ocupado: 'Ocupado' };

/**
 * Vista rápida (sin navegar) del espacio seleccionado en la cuadrícula.
 * Complementa la página de detalle /espacios/:id — no la reemplaza.
 */
export default function PanelSensor({ espacio, onCerrar, onSimularCambio }) {
  const { historial } = useHistorialEspacio(espacio?.id, 5);

  if (!espacio) {
    return (
      <aside className="panel-sensor panel-sensor--vacio">
        <p className="panel-sensor__hint">Selecciona un espacio en la cuadrícula para ver su detalle rápido aquí.</p>
      </aside>
    );
  }

  const estado = espacio.estado ?? 'sin-info';
  const reciente = [...historial].reverse();

  return (
    <aside className="panel-sensor">
      <div className="panel-sensor__header">
        <span className="panel-sensor__id mono">{espacio.id}</span>
        <div className="panel-sensor__header-derecha">
          <span className={`panel-sensor__badge panel-sensor__badge--${estado}`}>
            {ESTADO_LABEL[estado] ?? 'Sin datos'}
          </span>
          <button className="panel-sensor__cerrar" onClick={onCerrar} aria-label="Cerrar panel">
            ×
          </button>
        </div>
      </div>

      <div className="panel-sensor__distancia">
        <span className="panel-sensor__distancia-valor mono">
          {espacio.distanciaDetectada?.toFixed(0)}
        </span>
        <span className="panel-sensor__distancia-unidad">cm detectados</span>
      </div>
      <div className="panel-sensor__barra">
        <div
          className={`panel-sensor__barra-fill panel-sensor__barra-fill--${estado}`}
          style={{ width: `${Math.min(100, (espacio.distanciaDetectada / 400) * 100)}%` }}
        />
      </div>
      <p className="panel-sensor__umbral mono">Umbral del sensor: 50 cm</p>

      <dl className="panel-sensor__datos">
        <div>
          <dt>Columna / número</dt>
          <dd className="mono">{espacio.columna} / {espacio.numero}</dd>
        </div>
        <div>
          <dt>Última actualización</dt>
          <dd className="mono">{formatHora(espacio.fechaHora)}</dd>
        </div>
      </dl>

      <div className="panel-sensor__historial">
        <span className="panel-sensor__historial-titulo">Historial reciente</span>
        {reciente.length === 0 ? (
          <p className="panel-sensor__hint">Aún no hay mediciones registradas.</p>
        ) : (
          <ul className="panel-sensor__lista">
            {reciente.map((h) => (
              <li key={h.fechaHora} className="panel-sensor__item">
                <span className={`panel-sensor__punto panel-sensor__punto--${h.estado}`} />
                <span className="panel-sensor__item-estado">{ESTADO_LABEL[h.estado]}</span>
                <span className="panel-sensor__item-dist mono">{h.distanciaDetectada.toFixed(0)} cm</span>
                <span className="panel-sensor__item-hora mono">{formatHora(h.fechaHora)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Botón para simular el cambio de estado individualmente */}
      <button 
        className="estacionamiento__reset" 
        onClick={onSimularCambio}
        style={{ width: '100%', marginBottom: '10px', marginTop: '10px', cursor: 'pointer' }}
      >
        Simular cambio de estado
      </button>

      <Link to={`/espacios/${espacio.id}`} className="panel-sensor__cta">
        Ver detalle completo →
      </Link>
    </aside>
  );
}