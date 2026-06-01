# NASBOX Commander Web v1.1

## Overview

NASBOX Commander Web ist ein browser-basiertes Steuerungs- und Konfigurations-Dashboard für lokale Batch-Scripts und Automatisierungen. Die App läuft vollständig im Browser – es wird kein Server oder Backend benötigt.

**Designed for Werni / Drude No. 5**

## Key Facts

- **Typ:** Browser-only Web-Dashboard (Single Page Application)
- **Datenspeicherung:** Alle Konfigurationen werden im `localStorage` des Browsers gespeichert
- **Backend:** Keines – rein clientseitig
- **Script-Ausführung:** Im Web-Modus können lokale Scripts (.bat, .cmd, .ps1, .py) **nicht** direkt ausgeführt werden. Die Kacheln dienen als visuelles Konfigurations- und Planungswerkzeug.

## Features

- Bis zu 50 konfigurierbare Launcher-Kacheln
- 5 Kategorien: NAS, OCR, AI, Backup, Utilities
- Drag & Drop Sortierung
- Favoriten & Anpinnen
- Kachel-Aktionsmenü (Simulation, Bearbeiten, Duplizieren, Favorit, Anpinnen, Logs, Löschen)
- Simulierter Log-Viewer (Terminal-Stil)
- JSON Import/Export der gesamten Konfiguration
- Automatisches Backup vor Import und Reset
- Kompakt- und Großansicht
- Vollbild-Modus
- Responsive Design (Desktop & Mobile)
- Steam Dark Deluxe / Windows 11 Acrylic Design

## JSON Export/Import

Die Export-Funktion speichert die komplette Kachel-Konfiguration als `.json`-Datei. Diese kann:
- Als Backup auf der Festplatte gesichert werden
- Auf einem anderen Gerät importiert werden
- **Als Basis für eine native Launcher-Anwendung** verwendet werden

Das JSON-Format enthält pro Kachel: Name, Pfad, Beschreibung, Kategorie, Icon, Status und Metadaten.

## Technologie-Stack

- React 19 mit TypeScript
- CSS Modules (kein globales CSS Framework)
- localStorage für Persistenz
- Radix UI Primitives (Dialog, Dropdown, Select, etc.)
- Lucide React Icons
- Recharts (für zukünftige Dashboard-Statistiken)
- Sonner (Toast-Benachrichtigungen)

## Empfohlene nächste Schritte

Für eine vollwertige Desktop-Anwendung, die tatsächlich lokale Scripts starten kann, wird empfohlen:

### Option A: Electron App
- Die bestehende Web-App in Electron einbetten
- Node.js `child_process` nutzen, um Scripts auszuführen
- JSON-Konfiguration direkt übernehmen

### Option B: Python Backend Launcher
- Ein Python-Backend (z.B. mit FastAPI oder Flask) erstellen
- Die JSON-Konfiguration importieren
- `subprocess` für Script-Ausführung nutzen
- Die Web-App als Frontend beibehalten

### Option C: PowerShell/Batch Wrapper
- Ein einfaches PowerShell-Script, das die JSON-Konfiguration liest
- Direkte Script-Ausführung ohne zusätzlichen Server

In allen Fällen kann die exportierte JSON-Konfiguration als Startpunkt wiederverwendet werden.

## Projektstruktur

- `pages/_index.tsx` – Hauptseite (Dashboard)
- `helpers/useBatchSlots.tsx` – Datenmanagement (localStorage, CRUD, Backup)
- `components/BatchSlotTile.tsx` – Einzelne Kachel-Komponente
- `components/BatchEditDialog.tsx` – Bearbeitungsdialog
- `components/CategorySidebar.tsx` – Kategorien-Navigation
- `components/LogViewer.tsx` – Terminal-Log-Anzeige
- `components/HelpInfoDialog.tsx` – Hilfe & Info Dialog

## Version

v1.1 – NASBOX Commander Web
Designed for Werni / Drude No. 5