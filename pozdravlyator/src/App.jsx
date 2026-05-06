import { Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
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

export default function App() {
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
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <NavBar />
    </>
  );
}
