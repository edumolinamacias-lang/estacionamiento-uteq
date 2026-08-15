import './FiltrosEspacios.css';

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'libre', label: 'Libre' },
  { value: 'ocupado', label: 'Ocupado' },
];

const COLUMNAS = [
  { value: 'todas', label: 'Todas' },
  { value: '1', label: 'Columna 1' },
  { value: '2', label: 'Columna 2' },
  { value: '3', label: 'Columna 3' },
  { value: '4', label: 'Columna 4' },
];

export default function FiltrosEspacios({ filtros, onCambiar }) {
  return (
    <div className="filtros">
      <div className="filtros__grupo">
        <span className="filtros__etiqueta">Columna</span>
        <div className="filtros__opciones">
          {COLUMNAS.map((c) => (
            <button
              key={c.value}
              className={`filtros__chip ${filtros.columna === c.value ? 'filtros__chip--activo' : ''}`}
              onClick={() => onCambiar({ ...filtros, columna: c.value })}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filtros__grupo">
        <span className="filtros__etiqueta">Estado</span>
        <div className="filtros__opciones">
          {ESTADOS.map((e) => (
            <button
              key={e.value}
              className={`filtros__chip ${filtros.estado === e.value ? 'filtros__chip--activo' : ''}`}
              onClick={() => onCambiar({ ...filtros, estado: e.value })}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filtros__leyenda" aria-label="Leyenda de colores">
        <span className="filtros__leyenda-item">
          <i className="filtros__punto filtros__punto--libre" /> Libre
        </span>
        <span className="filtros__leyenda-item">
          <i className="filtros__punto filtros__punto--ocupado" /> Ocupado
        </span>
        <span className="filtros__leyenda-item">
          <i className="filtros__punto filtros__punto--sin-info" /> Sin información
        </span>
      </div>
    </div>
  );
}
