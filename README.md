# Estacionamiento Inteligente UTEQ

Aplicación web (React + Vite + Firebase Realtime Database) que simula un
parqueadero de **80 espacios** (4 columnas x 20 plazas) ubicado en la UTEQ,
con sensores simulados que reportan distancia en tiempo real y determinan
si cada plaza está **libre** u **ocupada**.

## Stack

- React 18 + Vite
- React Router (rutas `/`, `/estacionamiento`, `/espacios/:id`)
- Firebase Realtime Database (SDK modular v10)
- React Leaflet + OpenStreetMap (mapa con el perímetro real del terreno)
- Recharts (gráfico del historial de un espacio)

## 1. Requisitos

- Node.js 18 o superior
- Una cuenta de Firebase (gratuita) con un proyecto y una **Realtime
  Database** creada en modo de prueba (o con reglas que permitan lectura/
  escritura durante el desarrollo)

## 2. Configurar Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
   y crea un proyecto nuevo.
2. Dentro del proyecto, ve a **Build → Realtime Database** y crea una base
   de datos (elige la región más cercana).
3. En **Reglas**, para desarrollo puedes usar temporalmente:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   (Antes de entregar/publicar el proyecto, restringe estas reglas.)
4. Ve a **Configuración del proyecto → Tus apps → Web (`</>`)** y registra
   una app. Copia el objeto `firebaseConfig` que te entrega la consola.

## 3. Instalar y ejecutar

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd estacionamiento-uteq

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Completa .env con los valores de tu firebaseConfig (ver paso 4 abajo)

# 4. Levantar el servidor de desarrollo
npm run dev
```

Abre `http://localhost:5173`. Al entrar por primera vez a
**Estacionamiento**, la app detecta que la base está vacía y siembra
automáticamente los 80 espacios (`sembrarEspacios()` en
`src/services/simulacion.js`). A partir de ahí, cada 6 segundos se simula
una nueva lectura para un subconjunto aleatorio de sensores.

### Variables de entorno (`.env`)

| Variable | De dónde sale |
|---|---|
| `VITE_FIREBASE_API_KEY` | `firebaseConfig.apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `firebaseConfig.authDomain` |
| `VITE_FIREBASE_DATABASE_URL` | `firebaseConfig.databaseURL` (Realtime Database, no Firestore) |
| `VITE_FIREBASE_PROJECT_ID` | `firebaseConfig.projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `firebaseConfig.storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `firebaseConfig.messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `firebaseConfig.appId` |

## 4. Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila la app de producción a `dist/` |
| `npm run preview` | Sirve localmente el build de producción |

## 5. Estructura del proyecto

```
src/
├── components/
│   ├── ResumenEstacionamiento.jsx   # Tarjetas de estadísticas
│   ├── CuadriculaEstacionamiento.jsx# Cuadrícula 4 columnas x 20 espacios
│   ├── EspacioCard.jsx              # Tarjeta individual de un espacio
│   ├── FiltrosEspacios.jsx          # Filtros por columna/estado + leyenda
│   ├── HistorialEspacio.jsx         # Tabla + gráfico del historial
│   └── MapaEstacionamiento.jsx      # Mapa Leaflet con el perímetro GPS real
├── hooks/
│   ├── useEspacios.jsx              # Suscripción RTDB + ciclo de simulación
│   └── useHistorialEspacio.jsx      # Suscripción al historial de un espacio
├── pages/
│   ├── Inicio.jsx                   # Landing / descripción del proyecto
│   ├── Estacionamiento.jsx          # Página principal del parqueadero
│   └── DetalleEspacio.jsx           # /espacios/:id
├── services/
│   ├── firebase.js                  # Inicialización SDK + helpers RTDB
│   └── simulacion.js                # Generación y simulación de sensores
├── utils/
│   └── constantes.js                # Geometría: vértices GPS, bounding box, grilla
├── App.jsx
└── main.jsx
```

## 6. Cálculo de la distribución de los 80 espacios

El terreno está delimitado por 4 vértices GPS (ver `src/utils/constantes.js`,
`VERTICES`). A partir de ellos:

- Largo promedio del terreno: **91.37 m**
- Ancho promedio del terreno: **26.34 m**
- Área aproximada: **2405.74 m²**

Para una cuadrícula uniforme de **4 columnas x 20 espacios**:

- Ancho por columna = 26.34 / 4 = **6.58 m**
- Largo por espacio = 91.37 / 20 = **4.57 m**
- Área por celda ≈ **30.08 m²**

Cada celda de la cuadrícula se calcula por interpolación bilineal sobre el
cuadrilátero P1-P2-P3-P4 (función `calcularCeldaGeo` en `constantes.js`),
lo que da el bounding box y el centro (latitud/longitud) de cada una de las
80 plazas, usados tanto para guardar el registro en Firebase como para
dibujar el mapa.

## 7. Reglas de la simulación

- Cada sensor reporta una `distanciaDetectada` en centímetros.
- `distancia <= 50 cm` → `estado = "ocupado"`; en caso contrario, `"libre"`.
- Cada ciclo de simulación (cada 6 s) actualiza ~15% de los sensores al
  azar, alternando entre generar una lectura "libre" y una "ocupada" para
  que el conjunto nunca se quede completamente lleno o completamente vacío.
- Cada actualización queda registrada en `historial/{id}/{timestamp}` para
  poder graficar la evolución de cada plaza.

## 8. Despliegue / entregable en PDF

Para el entregable en PDF de la actividad, se recomienda:

1. Ejecutar `npm run dev` (o desplegar en Vercel/Netlify) y navegar por las
   3 páginas.
2. Tomar capturas de: Inicio, Estacionamiento (cuadrícula completa),
   tarjetas de estadísticas, detalle + historial de un espacio, mapa, y la
   consola de Firebase RTDB mostrando el árbol `espacios` / `historial`.
3. Anexar el código fuente de páginas, componentes y hooks (este
   repositorio) junto con la URL del repositorio de GitHub.
