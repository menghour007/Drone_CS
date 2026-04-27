import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

export default function App() {
  const path = window.location.pathname;

  if (path === '/dashboard') return <Dashboard />;
  if (path === '/login') return <Login />;

  return <Home />;
}