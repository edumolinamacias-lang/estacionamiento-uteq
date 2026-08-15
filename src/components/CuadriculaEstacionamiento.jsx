import EspacioCard from './EspacioCard.jsx';
import './CuadriculaEstacionamiento.css';

/**
 * Presenta los espacios agrupados en 4 columnas de 20 espacios, respetando
 * la disposición física real del parqueadero.
 */
export default function CuadriculaEstacionamiento({ espacios, seleccionadoId, onSeleccionar }) {
  const columnas = [1, 2, 3, 4].map((col) =>
    espacios.filter((e) => e.columna === col).sort((a, b) => a.numero - b.numero)
  );

  return (
    <div className="cuadricula">
      <div className="cuadricula__entrada">Entrada</div>
      <div className="cuadricula__columnas">
        {columnas.map((columna, idx) => (
          <div className="cuadricula__columna" key={idx}>
            <div className="cuadricula__columna-titulo mono">Columna {idx + 1}</div>
            <div className="cuadricula__celdas">
              {columna.map((espacio) => (
                <EspacioCard
                  key={espacio.id}
                  espacio={espacio}
                  seleccionado={espacio.id === seleccionadoId}
                  onSeleccionar={onSeleccionar}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
