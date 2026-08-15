import React from 'react';
import { ref, update } from "firebase/database";
import { db } from "../firebaseConfig"; // Ajusta la ruta de tu configuración de Firebase si es necesario

export default function Estacionamiento({ selectedSensor, ...otrosProps }) {

  // Función para simular el cambio de estado del sensor seleccionado individualmente
  const handleSimulateChange = async () => {
    if (!selectedSensor) return;

    // Si la distancia actual es mayor a 50cm (libre), lo pasamos a 25cm (ocupado). 
    // Si es menor o igual a 50cm (ocupado), lo pasamos a 150cm (libre).
    const nuevaDistancia = selectedSensor.distance > 50 ? 25 : 150;

    try {
      const sensorRef = ref(db, `parking/${selectedSensor.id}`);
      await update(sensorRef, {
        distance: nuevaDistancia,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error al simular el cambio de estado:", error);
    }
  };

  return (
    <div className="estacionamiento-container">
      {/* ... Aquí va el resto de tu estructura principal (grilla de los 80 espacios, métricas, etc.) ... */}

      {/* Panel lateral derecho de detalles del sensor seleccionado */}
      {selectedSensor && (
        <div className="panel-lateral-detalles">
          <h3>SENSor SELECCIONADO</h3>
          <div className="sensor-header-info">
            <span className="sensor-id-title">{selectedSensor.id}</span>
            <span className={`badge-estado ${selectedSensor.distance <= 50 ? 'ocupado' : 'libre'}`}>
              {selectedSensor.distance <= 50 ? 'OCUPADO' : 'LIBRE'}
            </span>
          </div>

          <div className="distancia-card">
            <span className="distancia-label">Distancia detectada</span>
            <div className="distancia-valor">{selectedSensor.distance} <span>cm</span></div>
            <div className="barra-progreso">
              <div 
                className="progreso-relleno" 
                style={{ width: `${Math.min((selectedSensor.distance / 300) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="umbral-label">Umbral del sensor: 50 cm</span>
          </div>

          <div className="detalles-tecnicos">
            <p><strong>ID RTDB:</strong> parking_{selectedSensor.id}</p>
            <p><strong>COLUMNA / NÚMERO:</strong> {selectedSensor.column} / {selectedSensor.number}</p>
            <p><strong>ÚLTIMA ACTUALIZACIÓN:</strong> {new Date(selectedSensor.lastUpdated).toLocaleTimeString()}</p>
          </div>

          <div className="historial-seccion">
            <h4>Historial reciente</h4>
            {/* Listado de historial de eventos recientes */}
            <div className="historial-lista">
              {/* Ejemplo de elementos del historial simulados o reales */}
              <div className="historial-item">
                <span>{selectedSensor.distance <= 50 ? 'Ocupado' : 'Libre'}</span>
                <span>{selectedSensor.distance} cm</span>
              </div>
            </div>
          </div>

          {/* Botón para simular el cambio de estado individual */}
          <button 
            className="btn-simular-individual" 
            onClick={handleSimulateChange}
          >
            Simular cambio de estado
          </button>
        </div>
      )}
    </div>
  );
}