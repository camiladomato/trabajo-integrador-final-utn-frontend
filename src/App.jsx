import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';


import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import Navbar from './components/Navbar/Navbar';


const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};


const AdminRoute = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" />;
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

function App() {
  const { token } = useContext(AuthContext);

  return (
    <Router>
  
      {token && <Navbar />}
      
      <div className="main-content">
        <Routes>
       
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

        
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;