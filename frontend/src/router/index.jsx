import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Result from '../pages/Result';
import Detail from '../pages/Detail';
import Layout from '../components/Layout';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/items" element={<Layout><Result /></Layout>} />
      <Route path="/items/:id" element={<Layout><Detail /></Layout>} />
    </Routes>
  );
}