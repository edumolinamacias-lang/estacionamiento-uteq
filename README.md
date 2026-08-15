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

## 5. Características principales

✨ **Simulación en tiempo real**: Los sensores actualizan el estado de las plazas cada 6 segundos.

📊 **Panel de estadísticas**: Visualiza el resumen del estacionamiento (ocupadas, libres, porcentaje).

🗺️ **Mapa interactivo**: Geolocalización de cada plaza dentro del perímetro real del terreno UTEQ.

📈 **Historial y gráficos**: Análisis de ocupación por espacio con visualización de tendencias.

🔍 **Filtros avanzados**: Filtra por columna, estado (libre/ocupado) y visualiza la leyenda.

🚗 **Detalle de espacios**: Información completa de cada plaza incluyendo últimas lecturas de sensores.

## 6. Estructura del proyecto

```
src/
├── components/
│   ├── ResumenEstacionamiento.jsx   # Tarjetas de estadísticas
│   ├── CuadriculaEstacionamiento.jsx# Cuadrícula 4 columnas x 20 espacios
│   ├── EspacioCard.jsx              # Tarjeta individual de un espacio
│   ├── FiltrosEspacios.jsx          # Filtros por columna/estado + leyenda
│   ├── HistorialEspacio.jsx         # Tabla + gráfico del historial
│   ├── MapaEstacionamiento.jsx      # Mapa Leaflet con el perímetro GPS real
│   └── PanelSensor.jsx              # (extra) vista rápida del espacio seleccionado, sin navegar
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

> `PanelSensor.jsx` no está en la lista de componentes sugeridos del enunciado
> original: es un agregado. Al hacer clic en un espacio de la cuadrícula, se
> resalta y se muestra un resumen rápido (distancia, últimas 5 lecturas) en
> este panel lateral **sin cambiar de página**; desde ahí, un botón "Ver
> detalle completo" lleva a la página `/espacios/:id` que sí pide la
> actividad. Los seis componentes originales (Resumen, Cuadrícula,
> EspacioCard, Filtros, Historial, Mapa) siguen siendo los que cubren cada
> requerimiento del enunciado punto por punto.

## 7. Cálculo de la distribución de los 80 espacios

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

## 8. Reglas de la simulación

- Cada sensor reporta una `distanciaDetectada` en centímetros.
- `distancia <= 50 cm` → `estado = "ocupado"`; en caso contrario, `"libre"`.
- Cada ciclo de simulación (cada 6 s) actualiza ~15% de los sensores al
  azar, alternando entre generar una lectura "libre" y una "ocupada" para
  que el conjunto nunca se quede completamente lleno o completamente vacío.
- Cada actualización queda registrada en `historial/{id}/{timestamp}` para
  poder graficar la evolución de cada plaza.

## 9. Despliegue / entregable en PDF

Para el entregable en PDF de la actividad, se recomienda:

1. Ejecutar `npm run dev` (o desplegar en Vercel/Netlify) y navegar por las
   3 páginas.
2. Tomar capturas de: Inicio, Estacionamiento (cuadrícula completa),
   tarjetas de estadísticas, detalle + historial de un espacio, mapa, y la
   consola de Firebase RTDB mostrando el árbol `espacios` / `historial`.
3. Anexar el código fuente de páginas, componentes y hooks (este
   repositorio) junto con la URL del repositorio de GitHub.

## 10. Cómo usar la aplicación

### Página de Inicio
- Descripción general del proyecto y sistema de estacionamiento inteligente
- Acceso rápido a la sección de estacionamiento

### Página de Estacionamiento
- **Cuadrícula visual**: Visualiza los 80 espacios en una cuadrícula 4x20
  - Verde: Espacio libre
  - Rojo: Espacio ocupado
- **Tarjetas de estadísticas**: Resumen rápido del estado general
- **Filtros**: Filtra por columna específica o estado de ocupación
- **Panel de sensor**: Click en cualquier espacio para ver detalles rápidos
- **Mapa**: Vista geográfica de la ubicación del estacionamiento

### Página de Detalle de Espacio
- Información completa del espacio seleccionado
- Historial de cambios de estado
- Gráfico de ocupación en el tiempo
- Últimas lecturas del sensor

## 11. Notas técnicas

- La base de datos Firebase se inicializa automáticamente en la primera carga
- Cada espacio tiene su propio historial de cambios
- Los datos se persisten en Firebase para análisis histórico
- La simulación es continua y se ejecuta sin intervención del usuario
- Los cambios se reflejan en tiempo real en todas las vistas

## 12. Soporte y contribuciones

Para reportar errores o sugerir mejoras, considera abrir un _issue_ en el repositorio de GitHub.

---

**Última actualización**: 2026-08-14  
**Versión**: 1.0.0
