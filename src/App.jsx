import { Routes, Route, NavLink } from 'react-router-dom';
import Inicio from './pages/Inicio';
import Estacionamiento from './pages/Estacionamiento';
import DetalleEspacio from './pages/DetalleEspacio';

function NavBar() {
  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__brand-dot"></span>
        <span className="mono">ESTACIONAMIENTO UTEQ</span>
      </div>

      <nav className="topbar__nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `topbar__link ${isActive ? 'active' : ''}`}
        >
          Inicio
        </NavLink>
        <NavLink 
          to="/estacionamiento" 
          className={({ isActive }) => `topbar__link ${isActive ? 'active' : ''}`}
        >
          Mapa en Vivo
        </NavLink>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/estacionamiento" element={<Estacionamiento />} />
          <Route path="/espacios/:id" element={<DetalleEspacio />} />
        </Routes>
      </main>
    </div>
  );
}