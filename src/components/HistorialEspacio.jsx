import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './HistorialEspacio.css';

function formatFechaHora(ts) {
  return new Date(ts).toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function HistorialEspacio({ historial, cargando }) {
  if (cargando) {
    return <p className="historial__estado mono">Cargando historial…</p>;
  }

  if (!historial || historial.length === 0) {
    return <p className="historial__estado mono">Todavía no hay mediciones registradas.</p>;
  }

  const datosGrafico = historial.map((h) => ({
    hora: new Date(h.fechaHora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
    distancia: h.distanciaDetectada,
  }));

  const reciente = [...historial].reverse().slice(0, 15);

  return (
    <div className="historial">
      <div className="historial__grafico">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={datosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe3dd" />
            <XAxis dataKey="hora" stroke="#8b978f" fontSize={11} />
            <YAxis stroke="#8b978f" fontSize={11} unit="cm" width={50} />
            <Tooltip
              contentStyle={{ background: '#ffffff', border: '1px solid #dbe3dd', borderRadius: 8 }}
              labelStyle={{ color: '#5b6a63' }}
            />
            <Line type="monotone" dataKey="distancia" stroke="#1e8f5e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <table className="historial__tabla mono">
        <thead>
          <tr>
            <th>Fecha y hora</th>
            <th>Distancia (cm)</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {reciente.map((h) => (
            <tr key={h.fechaHora}>
              <td>{formatFechaHora(h.fechaHora)}</td>
              <td>{h.distanciaDetectada.toFixed(1)}</td>
              <td>
                <span className={`historial__badge historial__badge--${h.estado}`}>{h.estado}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
