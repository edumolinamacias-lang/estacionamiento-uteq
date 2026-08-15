import { MapContainer, TileLayer, Polygon, Marker, Popup, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import { VERTICES, BOUNDING_BOX_GENERAL } from '../utils/constantes.js';
import './MapaEstacionamiento.css';

// Ícono por defecto de Leaflet (evita el problema conocido de rutas rotas con bundlers)
const iconoBase = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const perimetro = [
  [VERTICES.P1.lat, VERTICES.P1.lng],
  [VERTICES.P2.lat, VERTICES.P2.lng],
  [VERTICES.P3.lat, VERTICES.P3.lng],
  [VERTICES.P4.lat, VERTICES.P4.lng],
];

const centro = [
  (BOUNDING_BOX_GENERAL.norte + BOUNDING_BOX_GENERAL.sur) / 2,
  (BOUNDING_BOX_GENERAL.oeste + BOUNDING_BOX_GENERAL.este) / 2,
];

/**
 * Mapa con el perímetro real del parqueadero (4 vértices GPS) y, opcionalmente,
 * el rectángulo resaltado de un espacio individual.
 */
export default function MapaEstacionamiento({ espacio }) {
  const marcador = espacio
    ? [espacio.ubicacion.latitud, espacio.ubicacion.longitud]
    : centro;

  return (
    <div className="mapa-container">
      <MapContainer center={marcador} zoom={19} scrollWheelZoom={false} className="mapa-leaflet">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polygon positions={perimetro} pathOptions={{ color: '#4fa3f7', weight: 2, fillOpacity: 0.05 }} />

        {espacio && (
          <>
            <Rectangle
              bounds={[
                [espacio.ubicacion.boundingBox.sur, espacio.ubicacion.boundingBox.oeste],
                [espacio.ubicacion.boundingBox.norte, espacio.ubicacion.boundingBox.este],
              ]}
              pathOptions={{
                color: espacio.estado === 'ocupado' ? '#ff5c6c' : '#3ed598',
                weight: 2,
                fillOpacity: 0.35,
              }}
            />
            <Marker position={marcador} icon={iconoBase}>
              <Popup>
                <strong>{espacio.id}</strong>
                <br />
                Columna {espacio.columna} · Espacio {espacio.numero}
                <br />
                Estado: {espacio.estado}
              </Popup>
            </Marker>
          </>
        )}

        {!espacio && (
          <Marker position={centro} icon={iconoBase}>
            <Popup>Parqueadero UTEQ — 80 espacios (4 columnas x 20)</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
