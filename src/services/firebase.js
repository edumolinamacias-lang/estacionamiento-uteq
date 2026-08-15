import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  query,
  orderByKey,
  limitToLast,
} from 'firebase/database';

// -----------------------------------------------------------------------
// Configuración de Firebase
// -----------------------------------------------------------------------
// Estas variables se leen desde el archivo .env (ver .env.example). Nunca
// se deben subir credenciales reales al repositorio: cada estudiante debe
// crear su propio proyecto de Firebase y su propia Realtime Database.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// --- Rutas base ---------------------------------------------------------
const ESPACIOS_PATH = 'espacios';
const HISTORIAL_PATH = 'historial';

// --- Espacios ------------------------------------------------------------

/** Suscribirse en tiempo real a los 80 espacios. */
export function suscribirEspacios(callback) {
  const espaciosRef = ref(db, ESPACIOS_PATH);
  return onValue(espaciosRef, (snapshot) => {
    const data = snapshot.val() || {};
    callback(data);
  });
}

/** Crea o sobrescribe un espacio completo. */
export function guardarEspacio(espacio) {
  return set(ref(db, `${ESPACIOS_PATH}/${espacio.id}`), espacio);
}

/** Actualiza campos puntuales de un espacio (usado por la simulación). */
export function actualizarEspacio(id, cambios) {
  return update(ref(db, `${ESPACIOS_PATH}/${id}`), cambios);
}

// --- Historial -------------------------------------------------------------

/** Agrega una entrada al historial de un espacio, indexada por timestamp. */
export function agregarHistorial(id, entrada) {
  return set(ref(db, `${HISTORIAL_PATH}/${id}/${entrada.fechaHora}`), entrada);
}

/** Suscribirse al historial (últimas N mediciones) de un espacio. */
export function suscribirHistorial(id, callback, limite = 50) {
  const historialRef = query(
    ref(db, `${HISTORIAL_PATH}/${id}`),
    orderByKey(),
    limitToLast(limite)
  );
  return onValue(historialRef, (snapshot) => {
    const data = snapshot.val() || {};
    const lista = Object.values(data).sort((a, b) => a.fechaHora - b.fechaHora);
    callback(lista);
  });
}
