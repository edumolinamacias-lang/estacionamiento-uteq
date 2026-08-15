import {
  COLUMNAS,
  ESPACIOS_POR_COLUMNA,
  UBICACION_NOMBRE,
  calcularCeldaGeo,
  calcularEstado,
  idEspacio,
} from '../utils/constantes.js';
import { guardarEspacio, actualizarEspacio, agregarHistorial } from './firebase.js';

/** Distancia aleatoria en cm. Se sesga para no dejar el lote entero libre u ocupado. */
function distanciaAleatoria(forzarOcupado) {
  if (forzarOcupado) {
    return +(Math.random() * 48 + 2).toFixed(1); // 2 - 50 cm -> ocupado
  }
  return +(Math.random() * 350 + 51).toFixed(1); // 51 - 401 cm -> libre
}

/**
 * Genera el objeto completo de un espacio (para la carga inicial / seed).
 * Aproximadamente el 45% de los espacios se generan ocupados para que la
 * simulación arranque con una mezcla realista de estados.
 */
export function generarEspacio(columna, numero) {
  const { centro, boundingBox } = calcularCeldaGeo(columna, numero);
  const ocupadoInicial = Math.random() < 0.45;
  const distancia = distanciaAleatoria(ocupadoInicial);
  const fechaHora = Date.now();

  return {
    id: idEspacio(columna, numero),
    columna,
    numero,
    ubicacion: {
      nombre: UBICACION_NOMBRE,
      latitud: centro.lat,
      longitud: centro.lng,
      boundingBox,
    },
    distanciaDetectada: distancia,
    estado: calcularEstado(distancia),
    fechaHora,
  };
}

/** Genera los 80 espacios (4 columnas x 20) como un arreglo. */
export function generarLote80() {
  const lote = [];
  for (let columna = 1; columna <= COLUMNAS; columna += 1) {
    for (let numero = 1; numero <= ESPACIOS_POR_COLUMNA; numero += 1) {
      lote.push(generarEspacio(columna, numero));
    }
  }
  return lote;
}

/** Siembra (o resetea) los 80 espacios en Firebase RTDB. */
export async function sembrarEspacios() {
  const lote = generarLote80();
  await Promise.all(
    lote.map(async (espacio) => {
      await guardarEspacio(espacio);
      await agregarHistorial(espacio.id, {
        distanciaDetectada: espacio.distanciaDetectada,
        estado: espacio.estado,
        fechaHora: espacio.fechaHora,
      });
    })
  );
  return lote;
}

/**
 * Simula una nueva lectura para un subconjunto aleatorio de sensores y la
 * escribe en `espacios` + `historial`. Pensado para llamarse cada cierto
 * intervalo (ver useEspacios / hook de simulación en Estacionamiento.jsx).
 */
export async function simularCicloDeLecturas(idsDisponibles, opciones = {}) {
  const { porcentaje = 0.15 } = opciones;
  const cantidad = Math.max(1, Math.round(idsDisponibles.length * porcentaje));
  const seleccionados = [...idsDisponibles]
    .sort(() => Math.random() - 0.5)
    .slice(0, cantidad);

  await Promise.all(
    seleccionados.map(async (id) => {
      const forzarOcupado = Math.random() < 0.45;
      const distancia = distanciaAleatoria(forzarOcupado);
      const estado = calcularEstado(distancia);
      const fechaHora = Date.now();

      await actualizarEspacio(id, {
        distanciaDetectada: distancia,
        estado,
        fechaHora,
      });
      await agregarHistorial(id, { distanciaDetectada: distancia, estado, fechaHora });
    })
  );

  return seleccionados;
}
