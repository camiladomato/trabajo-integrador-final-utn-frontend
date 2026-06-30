import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('desc');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 
  const fetchAllTasks = async () => {
    setLoading(true);
    setError('');
    try {
      
      const res = await fetch(`http://localhost:3000/api/tasks/all?page=${page}&limit=6&sort=${sort}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.status === 'success') {
        setTasks(data.data);
        // Calculamos el total de páginas usando la metadata que envía el Backend
        setTotalPages(Math.ceil(data.pagination.totalItems / data.pagination.limit) || 1);
      } else {
        setError(data.message || 'No se pudieron recuperar las tareas del sistema.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Revisá que el Backend esté encendido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, [page, sort, token]);


  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('⚠️ ¿Estás segura de eliminar esta tarea como Administrador? Esta acción es definitiva.')) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.status === 'success') {
        fetchAllTasks();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error de conexión al intentar eliminar.');
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h2>Panel de Control Global 🛠️</h2>
          <p className="subtitle">Vista de Monitoreo General del Sistema (Rol: Admin)</p>
        </div>
        
        
        <div className="admin-actions">
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="desc">Más nuevas primero</option>
            <option value="asc">Más viejas primero</option>
          </select>
        </div>
      </header>

      {error && <div className="admin-error-box">{error}</div>}

      {loading ? (
        <div className="admin-loading">Cargando base de datos central...</div>
      ) : (
        <>
          <div className="admin-grid">
            {tasks.length === 0 ? (
              <div className="admin-empty">No hay ninguna tarea registrada en la aplicación.</div>
            ) : (
              tasks.map(task => (
                <div key={task._id} className={`admin-task-card ${task.status}`}>
                  <div className="admin-card-top">
                    <span className={`status-badge ${task.status}`}>
                      {task.status === 'completed' ? 'Hecha' : 'Pendiente'}
                    </span>
                    {task.category && <span className="cat-badge">{task.category}</span>}
                  </div>

                  <h4>{task.title}</h4>
                  <p className="desc">{task.description || 'Sin descripción.'}</p>
                  
                
                  <div className="user-owner-info">
                    <h5>Creado por:</h5>
                    <p><strong>Nombre:</strong> {task.user?.name || 'Usuario Eliminado'}</p>
                    <p><strong>Email:</strong> {task.user?.email || 'N/A'}</p>
                  </div>

                  <div className="admin-card-footer">
                    <button 
                      onClick={() => handleDeleteAdmin(task._id)}
                      className="btn-admin-delete"
                    >
                      Eliminar como Admin
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(p - 1, 1))}>◀</button>
              <span>Página {page} de {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>▶</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;