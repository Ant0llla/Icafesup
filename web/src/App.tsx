import { Link, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PCs from './pages/PCs';
import Revenue from './pages/Revenue';
import Promos from './pages/Promos';
import Heatmap from './pages/Heatmap';

export default function App() {
  return (
    <div className="app">
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/pcs">PCs</Link>
        <Link to="/revenue">Revenue</Link>
        <Link to="/promos">Promos</Link>
        <Link to="/heatmap">Heatmap</Link>
      </nav>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pcs" element={<PCs />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/promos" element={<Promos />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
