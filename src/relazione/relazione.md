
# KALOS - Sistema di Gestione per Fisioterapisti e Personal Trainer

## Obiettivi del Progetto

KALOS è stato sviluppato con l'obiettivo di fornire una soluzione completa per fisioterapisti e personal trainer che necessitano di uno strumento efficace per:

- Gestire i profili dei pazienti/clienti in modo organizzato
- Creare e personalizzare piani di esercizi specifici
- Pianificare sessioni di allenamento e riabilitazione

Il sistema mira a digitalizzare e ottimizzare il flusso di lavoro dei professionisti del settore, consentendo una gestione più efficiente della loro pratica quotidiana.

## Funzionalità Implementate

### Gestione Pazienti
- Creazione e modifica di profili pazienti dettagliati
- Catalogazione per livello di fitness
- Annotazione di limitazioni fisiche e note cliniche
- Visualizzazione dell'elenco completo dei pazienti

### Libreria di Esercizi
- Possibilità di creare esercizi personalizzati
- Categorizzazione per gruppi muscolari e livello di difficoltà
- Ricerca e filtri avanzati

### Piani di Allenamento
- Creazione di piani personalizzati per ogni paziente
- Assegnazione di esercizi specifici con parametri (serie, ripetizioni)
- Organizzazione degli esercizi in sessioni giornaliere
- Monitoraggio dei progressi e adattamento dei piani

### Calendario e Pianificazione
- Visualizzazione settimanale delle sessioni programmate
- Gestione degli appuntamenti con i pazienti
- Panoramica delle attività giornaliere

### Sistema di Account
- Registrazione e autenticazione degli utenti
- Profili differenziati per fisioterapisti/coach
- Gestione delle relazioni coach-paziente
- possibilitia di avere il tema dark o light

## Tecnologie Utilizzate

### Frontend
- **React**: framework JavaScript per la costruzione dell'interfaccia utente
- **TypeScript**: per lo sviluppo tipizzato e la riduzione degli errori
- **Tailwind CSS**: per lo styling responsivo e moderno
- **React Router**: per la gestione della navigazione
- **Lucide Icons**: per le icone dell'interfaccia
- **React Query**: per la gestione efficiente delle chiamate API

### Backend e Database
- **Supabase**: per l'autenticazione, il database PostgreSQL e lo storage
- **LocalStorage**: per la persistenza dei dati in fase di sviluppo

### Strumenti di Sviluppo
- **Vite**: per un ambiente di sviluppo veloce e reattivo
- **NPM**: per la gestione delle dipendenze
- **Git**: per il controllo versione

## Limitazioni Attuali

- **Persistenza dati**: L'utilizzo di localStorage limita la sincronizzazione tra dispositivi
- **Funzionalità offline**: Funzionalità limitate quando non si è connessi a Internet
- **Esportazione**: Assenza di funzionalità per esportare piani e dati in formato PDF
- **Notifiche**: Sistema di notifiche limitato alle interazioni immediate, (essendo che per ora l'applicazione è fatta solo per i personal trainer etc, e non per i clienti, il sistema delle notifiche è statico.

## Sviluppi Futuri

### Miglioramenti Tecnici
- Implementazione di un backend più robusto con database relazionale completo
- Miglioramento delle prestazioni per dispositivi mobili
- Implementazione di test automatizzati

### Nuove Funzionalità
- **App mobile**: Versione nativa per iOS e Android
- **Analisi avanzata**: Dashboard con statistiche dettagliate sui progressi
- **Comunità**: Area di condivisione di piani di esercizi tra professionisti
- **Sistema di pagamenti**: Integrazione con gateway di pagamento per gestire le sessioni

---

*Documento aggiornato: Maggio 2025*
