import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

   
    if (!name || !email || !password) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (data.status === 'success') {
       
        login(data.data, data.token);
        
        
        if (data.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        
        if (data.errors && data.errors.length > 0) {
          setError(`${data.errors[0].campo}: ${data.errors[0].mensaje}`);
        } else {
          setError(data.message || 'Error al registrar el usuario.');
        }
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Asegúrate de que el Backend esté encendido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Crear Cuenta</h2>
          <p>Registrate para empezar a organizar tus tareas</p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-control-group">
            <label htmlFor="name">Nombre Completo</label>
            <input
              type="text"
              id="name"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-control-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-control-group">
            <label htmlFor="password">Contraseña (Mínimo 6 caracteres)</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-control-group">
            <label htmlFor="role">Rol en la aplicación</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="user">Usuario Estándar (User)</option>
              <option value="admin">Administrador (Admin)</option>
            </select>
          </div>

          <button type="submit" className="btn-submit-auth" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer-redirect">
          <p>¿Ya tenés una cuenta?</p>
          <Link to="/login">Inicia sesión acá</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;