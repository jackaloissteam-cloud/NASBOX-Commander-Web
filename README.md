# NASBOX Commander Web
        
NASBOX Commander Web v1.1 – Ein browser-basiertes Steuerungs- und Konfigurations-Dashboard für lokale Batch-Scripts und Automatisierungen. Die App bietet bis zu 50 konfigurierbare Launcher-Kacheln in einem Steam Dark Deluxe / Windows 11 Acrylic Design, organisiert in Kategorien (NAS, OCR, AI, Backup, Utilities). Features: Drag & Drop Sortierung, Favoriten & Anpinnen, Kachel-Aktionsmenü (Dropdown mit Simulation/Bearbeiten/Duplizieren/Favorit/Pin/Logs/Löschen), simulierter Log-Viewer, JSON Import/Export mit Validierung und automatischem Backup, Vollbild-Modus, responsive Mobile-Layout mit einklappbarer Sidebar. Alle Daten werden lokal im Browser (localStorage) gespeichert. Im Web-Modus können lokale Scripts nicht direkt ausgeführt werden – die App dient als visuelles Konfigurations-Frontend. Die exportierte JSON-Konfiguration kann für einen zukünftigen nativen Launcher (Electron/Python) wiederverwendet werden. Version-Footer: "Designed for Werni / Drude No. 5".

Made with Floot.

# Instructions

For security reasons, the `env.json` file is not pre-populated — you will need to generate or retrieve the values yourself.  

For **JWT secrets**, generate a value with:  

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then paste the generated value into the appropriate field.  

For the **Floot Database**, download your database content as a pg_dump from the cog icon in the database view (right pane -> data -> floot data base -> cog icon on the left of the name), upload it to your own PostgreSQL database, and then fill in the connection string value.  

**Note:** Floot OAuth will not work in self-hosted environments.  

For other external services, retrieve your API keys and fill in the corresponding values.  

Once everything is configured, you can build and start the service with:  

```
npm install -g pnpm
pnpm install
pnpm vite build
pnpm tsx server.ts
```
