import { Routes, Route } from 'react-router';
import { StoreProvider } from '@/hooks/useStore';
import Home from './pages/Home';

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Home />} />
      </Routes>
    </StoreProvider>
  );
}

