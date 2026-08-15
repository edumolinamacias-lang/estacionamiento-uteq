import './EspacioCard.css';

function formatHora(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const ESTADO_LABEL = {
  libre: 'Libre',
  ocupado: 'Ocupado',
};

export default function EspacioCard({ espacio, seleccionado, onSeleccionar }) {
  const estado = espacio?.estado ?? 'sin-info';
  const label = ESTADO_LABEL[estado] ?? 'Sin datos';

  function manejarClick() {
    if (onSeleccionar) onSeleccionar(espacio);
  }

  return (
    <button
      className={`espacio-card espacio-card--${estado} ${seleccionado ? 'espacio-card--seleccionado' : ''}`}
      onClick={manejarClick}
      title={`${espacio.id} · ${label}`}
    >
      <span className="espacio-card__icono" aria-hidden="true">
        <svg viewBox="0 0 24 14" width="20" height="12" fill="none">
          <rect x="1" y="4" width="22" height="7" rx="2.5" fill="currentColor" opacity="0.9" />
          <path d="M5 4 L8 1 H16 L19 4 Z" fill="currentColor" opacity="0.9" />
          <circle cx="6.5" cy="11.5" r="1.8" fill="var(--board-bg)" stroke="currentColor" strokeWidth="1" />
          <circle cx="17.5" cy="11.5" r="1.8" fill="var(--board-bg)" stroke="currentColor" strokeWidth="1" />
        </svg>
      </span>
      <span className="espacio-card__info">
        <span className="espacio-card__linea1">
          <span className="espacio-card__num mono">{String(espacio.numero).padStart(2, '0')}</span>
          <span className="espacio-card__estado">{label}</span>
        </span>
        <span className="espacio-card__linea2 mono">
          {espacio.distanciaDetectada != null ? `${espacio.distanciaDetectada.toFixed(0)} cm` : '—'}
          <span className="espacio-card__hora"> · {formatHora(espacio.fechaHora)}</span>
        </span>
      </span>
    </button>
  );
}
