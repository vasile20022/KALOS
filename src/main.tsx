
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * File principale dell'applicazione
 * 
 * Questo file è il punto di ingresso dell'applicazione React:
 * - Inizializza il rendering dell'applicazione nel DOM
 * - Importa gli stili globali
 * - Monta il componente App
 */

createRoot(document.getElementById("root")!).render(<App />);
