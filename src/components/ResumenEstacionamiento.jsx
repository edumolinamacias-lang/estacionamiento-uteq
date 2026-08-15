import './ResumenEstacionamiento.css';

const TARJETAS = [
  { key: 'total', label: 'Total de espacios', tono: 'neutro' },
  { key: 'libres', label: 'Espacios libres', tono: 'libre' },
  { key: 'ocupados', label: 'Espacios ocupados', tono: 'ocupado' },
  { key: 'porcentajeDisponible', label: 'Disponibilidad', tono: 'accent', sufijo: '%' },
];

export default function ResumenEstacionamiento({ resumen }) {
  return (
    <section className="resumen" aria-label="Estadísticas del estacionamiento">
      {TARJETAS.map((t) => {
        const valor = resumen[t.key];
        const mostrado = t.sufijo ? valor.toFixed(1) : valor;
        return (
          <div className={`resumen__tarjeta resumen__tarjeta--${t.tono}`} key={t.key}>
            <span className="resumen__label">{t.label}</span>
            <span className="resumen__valor mono">
              {mostrado}
              {t.sufijo ?? ''}
            </span>
          </div>
        );
      })}
    </section>
  );
}
