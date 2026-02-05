import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import { NavBar } from './components/NavBar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { AddContact } from './pages/AddContact';
import { ContactsList } from './pages/ContactsList';
import { EditContact } from './pages/EditContact';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Generator } from './pages/Generator';
import { History } from './pages/History';
import { Saved } from './pages/Saved';
import { QuickCard } from './pages/QuickCard';
import { Challenges } from './pages/Challenges';
import { Profile } from './pages/Profile';
import AppStandalone from './AppStandalone';
import './App.css';

function AuthRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="protected-loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <main className="app__main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/contacts" element={<ContactsList />} />
          <Route path="/contacts/add" element={<AddContact />} />
          <Route path="/contacts/:id/edit" element={<EditContact />} />
          <Route path="/generate" element={<Generator />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/history" element={<History />} />
          <Route path="/quick-card" element={<QuickCard />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/standalone" element={<AppStandalone />} />
        </Routes>
      </main>
      <NavBar />
    </>
  );
}

export default function App() {
  return <AuthRoutes />;
}
