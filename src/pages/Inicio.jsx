import { Link } from 'react-router-dom';
import { TOTAL_ESPACIOS, COLUMNAS, ESPACIOS_POR_COLUMNA, DIMENSIONES } from '../utils/constantes.js';
import './Inicio.css';

export default function Inicio() {
  return (
    <div className="inicio">
      <section className="inicio__hero">
        <span className="inicio__eyebrow mono">UTEQ · Sensores en tiempo real</span>
        <h1 className="inicio__titulo">
          Parqueadero inteligente,
          <br />
          leído sensor por sensor.
        </h1>
        <p className="inicio__descripcion">
          Este panel simula <strong>{TOTAL_ESPACIOS} espacios de parqueo</strong> distribuidos en{' '}
          {COLUMNAS} columnas de {ESPACIOS_POR_COLUMNA} plazas, ubicados en el terreno real de la
          UTEQ. Cada plaza tiene un sensor de distancia simulado que reporta su lectura a Firebase
          Realtime Database: si detecta un obstáculo a 50&nbsp;cm o menos, la plaza se marca como
          ocupada; caso contrario, libre.
        </p>
        <div className="inicio__acciones">
          <Link to="/estacionamiento" className="inicio__cta">
            Ver estacionamiento en vivo →
          </Link>
        </div>
      </section>

      <section className="inicio__grid">
        <div className="inicio__ficha">
          <span className="inicio__ficha-label">Distribución</span>
          <span className="inicio__ficha-valor mono">
            {COLUMNAS} × {ESPACIOS_POR_COLUMNA}
          </span>
          <span className="inicio__ficha-nota">columnas × espacios = {TOTAL_ESPACIOS} plazas</span>
        </div>
        <div className="inicio__ficha">
          <span className="inicio__ficha-label">Área aproximada del terreno</span>
          <span className="inicio__ficha-valor mono">{DIMENSIONES.areaAproxM2} m²</span>
          <span className="inicio__ficha-nota">
            {DIMENSIONES.largoPromedioM} m largo × {DIMENSIONES.anchoPromedioM} m ancho
          </span>
        </div>
        <div className="inicio__ficha">
          <span className="inicio__ficha-label">Celda de la cuadrícula</span>
          <span className="inicio__ficha-valor mono">{DIMENSIONES.areaPorCeldaM2} m²</span>
          <span className="inicio__ficha-nota">
            {DIMENSIONES.anchoPorColumnaM} m × {DIMENSIONES.largoPorEspacioM} m
          </span>
        </div>
        <div className="inicio__ficha">
          <span className="inicio__ficha-label">Umbral de ocupación</span>
          <span className="inicio__ficha-valor mono">≤ 50 cm</span>
          <span className="inicio__ficha-nota">distancia detectada por el sensor</span>
        </div>
      </section>

      <section className="inicio__como">
        <h2>Cómo funciona</h2>
        <ol className="inicio__pasos">
          <li>
            <strong>Sensores simulados</strong> generan una distancia (cm) para cada una de las 80
            plazas y la escriben en <code className="mono">espacios/{'{id}'}</code>.
          </li>
          <li>
            <strong>Firebase Realtime Database</strong> distribuye el cambio a todos los clientes
            conectados de forma instantánea.
          </li>
          <li>
            <strong>El panel</strong> recalcula estadísticas, colorea la cuadrícula y guarda cada
            lectura en <code className="mono">historial/{'{id}'}</code> para consultarla luego.
          </li>
        </ol>
      </section>
    </div>
  );
}
