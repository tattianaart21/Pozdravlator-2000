import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { NavBar } from './NavBar';
import './ProtectedLayout.css';

export function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="protected-loading" aria-label="Загрузка">
        <div className="protected-loading__spinner" />
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
