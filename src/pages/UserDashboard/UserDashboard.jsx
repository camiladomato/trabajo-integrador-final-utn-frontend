import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const { token } = useContext(AuthContext);


  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('desc');
  const [categoryFilter, setCategoryFilter] = useState('');


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);


  const fetchTasks = async () => {
    try {
      let url = `http://localhost:3000/api/tasks?page=${page}&limit=4&sort=${sort}`;
      if (categoryFilter) {
        url += `&filter=category:${categoryFilter}`;
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setTasks(data.data);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      setError('Error al cargar las tareas.');
    }
  };


  useEffect(() => {
    fetchTasks();
  }, [page, sort, categoryFilter, token]);


  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title) {
      setError('El título de la tarea es obligatorio.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category })
      });
      const data = await res.json();

      if (data.status === 'success') {
        setSuccess('¡Tarea creada con éxito!');
        setTitle('');
        setDescription('');
        setCategory('');
        setPage(1); 
        fetchTasks();
      } else {
        if (data.errors) {
          setError(`${data.errors[0].campo}: ${data.errors[0].mensaje}`);
        } else {
          setError(data.message || 'Error al crear la tarea.');
        }
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  const toggleTaskStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      setError('No se pudo actualizar la tarea.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('¿Estás segura de eliminar esta tarea?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      setError('No se pudo eliminar la tarea.');
    }
  };

  return (
    <div className="dashboard-layout">
      

      <aside className="dashboard-sidebar">
        <div className="dashboard-card">
          <h3>Nueva Tareas ✨</h3>
          <form onSubmit={handleCreateTask} className="task-form">
            <div className="form-group-task">
              <label>Título *</label>
              <input 
                type="text" 
                placeholder="Ej: Estudiar para UTN" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group-task">
              <label>Categoría</label>
              <input 
                type="text" 
                placeholder="Ej: Universidad, Trabajo" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="form-group-task">
              <label>Descripción</label>
              <textarea 
                placeholder="Detalles de la tarea..." 
                rows="3"
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="btn-create-task">Guardar Tarea</button>
          </form>
          {success && <p className="alert-success-task">{success}</p>}
          {error && <p className="alert-error-task">{error}</p>}
        </div>
      </aside>

   
      <main className="dashboard-main">
        
      
        <div className="toolbar-card">
          <div className="filter-box">
            <label>Filtrar por categoría:</label>
            <input 
              type="text" 
              placeholder="Escribí y presioná enter..." 
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1); 
              }}
            />
          </div>
          <div className="filter-box">
            <label>Orden cronológico:</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="desc">Más recientes primero</option>
              <option value="asc">Más antiguas primero</option>
            </select>
          </div>
        </div>

        <div className="tasks-grid">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tenés tareas creadas que coincidan con la búsqueda. 📋</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task._id} className={`task-item-card ${task.status}`}>
                <div className="task-item-header">
                  <h4>{task.title}</h4>
                  {task.category && <span className="task-badge">{task.category}</span>}
                </div>
                <p className="task-item-desc">{task.description || 'Sin descripción.'}</p>
                
                <div className="task-item-footer">
                  <button 
                    onClick={() => toggleTaskStatus(task._id, task.status)}
                    className={`btn-status ${task.status}`}
                  >
                    {task.status === 'completed' ? '✓ Completada' : '⭘ Marcar hecha'}
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task._id)}
                    className="btn-delete-task"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

       
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="btn-page"
            >
              ◀ Anterior
            </button>
            <span className="page-indicator">Página {page} de {totalPages}</span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
              className="btn-page"
            >
              Siguiente ▶
            </button>
          </div>
        )}
      </main>

    </div>
  );
};

export default UserDashboard;