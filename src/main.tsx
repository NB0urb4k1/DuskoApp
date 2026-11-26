import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { useGymStore } from './store/gymStore';
import './index.css';

// Mantiene sincronizadas varias pestañas abiertas con la misma app.
window.addEventListener('storage', (event) => {
  if (event.key === 'dusko:gym') {
    void useGymStore.persist.rehydrate();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
