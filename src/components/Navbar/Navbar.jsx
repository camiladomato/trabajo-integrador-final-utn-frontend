import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h3>UTN Gestor</h3>
      </div>
      <div className="navbar-links">
        {user?.role === 'admin' ? (
          <Link to="/admin">Panel Admin</Link>
        ) : (
          <Link to="/dashboard">Mis Tareas</Link>
        )}
        <span className="user-welcome">Hola, {user?.name || 'Usuario'}</span>
        <button onClick={handleLogout} className="btn-logout">Salir</button>
      </div>
    </nav>
  );
};

export default Navbar;