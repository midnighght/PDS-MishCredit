import { Route, Routes } from 'react-router-dom';
import Nav from './components/Nav';
import Login from './pages/Login';
import Plan from './pages/Plan';
import Projections from './pages/Projections';
import Demanda from './pages/Demanda';
import Oferta from './pages/Oferta';
import AdminAccess from './pages/AdminAccess';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <Nav />
      <main className="container py-6 flex-1">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/proyecciones" element={<Projections />} />
          <Route path="/demanda" element={<Demanda />} />
          <Route path="/oferta" element={<Oferta />} />
          <Route path="/admin" element={<AdminAccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
