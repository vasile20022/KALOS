## Guida all'installazione per nuovi utenti

Se non hai mai installato Node.js prima, segui queste istruzioni per iniziare:

### Per Windows 11:

1. **Installare Node.js**:
   - Vai al sito ufficiale di Node.js: https://nodejs.org/
   - Scarica la versione LTS (Long Term Support), che è più stabile
   - Esegui il file .msi scaricato e segui la procedura di installazione
   - Accetta i termini di licenza e mantieni le impostazioni predefinite
   - Al termine dell'installazione, clicca su "Finish"

2. **Verifica l'installazione**:
   - Apri il Prompt dei comandi (CMD) o PowerShell
   - Digita `node -v` e premi Invio per verificare la versione di Node.js
   - Digita `npm -v` e premi Invio per verificare la versione di npm

### Per macOS:

1. **Installare Node.js**:
   - **Metodo 1 - Installer**:
     - Vai al sito ufficiale di Node.js: https://nodejs.org/
     - Scarica la versione LTS per macOS
     - Apri il file .pkg scaricato e segui la procedura guidata
   
   - **Metodo 2 - Homebrew** (consigliato se hai già Homebrew):
     - Apri il Terminale
     - Se non hai Homebrew, installalo con:
       ```
       /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
       ```
     - Installa Node.js con:
       ```
       brew install node
       ```

2. **Verifica l'installazione**:
   - Apri il Terminale
   - Digita `node -v` per verificare la versione di Node.js
   - Digita `npm -v` per verificare la versione di npm

## Installazione

```bash
# Clona il repository
git clone [URL_REPOSITORY] -> in questo caso : https://github.com/vasile20022/KALOS

# Naviga nella directory del progetto
cd [NOME_DIRECTORY]

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

# KALOS
