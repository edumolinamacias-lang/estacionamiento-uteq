// -----------------------------------------------------------------------
// Geometría del parqueadero UTEQ
// -----------------------------------------------------------------------
// El terreno está delimitado por 4 vértices (P1..P4) tomados en campo.
// A partir de ellos se calcula una cuadrícula uniforme de 4 columnas x 20
// espacios (80 celdas), y se deriva el bounding box de cada celda para
// poder ubicarla en el mapa y guardarla en Firebase.

export const VERTICES = {
  P1: { lat: -1.0122617572453996, lng: -79.4682858877737 },
  P2: { lat: -1.0125032549290254, lng: -79.4682998912032 },
  P3: { lat: -1.012570971500396, lng: -79.46748620024898 },
  P4: { lat: -1.0123403901396444, lng: -79.46746240847104 },
};

export const BOUNDING_BOX_GENERAL = {
  norte: -1.0122617572453996,
  sur: -1.012570971500396,
  oeste: -79.4682998912032,
  este: -79.46746240847104,
};

export const COLUMNAS = 4;
export const ESPACIOS_POR_COLUMNA = 20;
export const TOTAL_ESPACIOS = COLUMNAS * ESPACIOS_POR_COLUMNA; // 80

// Dimensiones aproximadas del terreno (ver PDF / README para el detalle
// del cálculo). Se dejan como constantes documentadas, no recalculadas en
// runtime, porque dependen de una proyección local sencilla (equirrectangular)
// que es suficientemente precisa para un terreno de este tamaño.
export const DIMENSIONES = {
  largoPromedioM: 91.37,
  anchoPromedioM: 26.34,
  areaAproxM2: 2405.74,
  anchoPorColumnaM: 6.58,
  largoPorEspacioM: 4.57,
  areaPorCeldaM2: 30.08,
  celdaEstacionamientoM: { ancho: 2.5, largo: 5.0 },
};

export const UBICACION_NOMBRE = 'Parqueadero UTEQ';

/**
 * Interpolación bilineal simple sobre el cuadrilátero P1-P2-P3-P4.
 * u recorre el largo (0 = borde P1-P4, 1 = borde P2-P3)
 * v recorre el ancho (0 = borde P1-P2, 1 = borde P4-P3)
 * Es una aproximación válida porque el terreno es pequeño y casi
 * rectangular, por lo que la curvatura terrestre es despreciable.
 */
function interpolar(u, v) {
  const { P1, P2, P3, P4 } = VERTICES;
  const lat =
    (1 - u) * (1 - v) * P1.lat +
    u * (1 - v) * P2.lat +
    u * v * P3.lat +
    (1 - u) * v * P4.lat;
  const lng =
    (1 - u) * (1 - v) * P1.lng +
    u * (1 - v) * P2.lng +
    u * v * P3.lng +
    (1 - u) * v * P4.lng;
  return { lat, lng };
}

/**
 * Genera el bounding box + centro de una celda (columna, número) dentro
 * de la cuadrícula de 4 x 20.
 */
export function calcularCeldaGeo(columna, numero) {
  const u0 = (columna - 1) / COLUMNAS;
  const u1 = columna / COLUMNAS;
  const v0 = (numero - 1) / ESPACIOS_POR_COLUMNA;
  const v1 = numero / ESPACIOS_POR_COLUMNA;

  const esquinas = [
    interpolar(u0, v0),
    interpolar(u1, v0),
    interpolar(u1, v1),
    interpolar(u0, v1),
  ];

  const lats = esquinas.map((e) => e.lat);
  const lngs = esquinas.map((e) => e.lng);

  const centro = interpolar((u0 + u1) / 2, (v0 + v1) / 2);

  return {
    centro,
    boundingBox: {
      norte: Math.max(...lats),
      sur: Math.min(...lats),
      oeste: Math.min(...lngs),
      este: Math.max(...lngs),
    },
  };
}

export function idEspacio(columna, numero) {
  const col = String(columna).padStart(2, '0');
  const num = String(numero).padStart(2, '0');
  return `ESP-C${col}-${num}`;
}

export const UMBRAL_OCUPADO_CM = 50;

export function calcularEstado(distanciaCm) {
  return distanciaCm <= UMBRAL_OCUPADO_CM ? 'ocupado' : 'libre';
}
