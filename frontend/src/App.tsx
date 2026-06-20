import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { NewPredict } from './pages/NewPredict';
import { LivePredict } from './pages/LivePredict';
import { Outcomes } from './pages/Outcomes';
import { About } from './pages/About';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewPredict />} />
          <Route path="/live" element={<LivePredict />} />
          <Route path="outcomes" element={<Outcomes />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
