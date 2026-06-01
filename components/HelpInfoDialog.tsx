import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './Dialog';
import { Globe, TriangleAlert, Folder, Save, Play, Wrench } from 'lucide-react';
import styles from './HelpInfoDialog.module.css';

interface HelpInfoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpInfoDialog({ isOpen, onOpenChange }: HelpInfoDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Über NASBOX Commander Web</DialogTitle>
          <DialogDescription>
            Informationen zur Funktionsweise und Bedienung des Dashboards.
          </DialogDescription>
        </DialogHeader>

        <div className={styles.sections}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Globe className={styles.icon} />
              Web-Modus
            </h3>
            <p className={styles.text}>
              NASBOX Commander Web läuft vollständig in Ihrem Browser. Alle Konfigurationen werden lokal auf Ihrem Gerät gespeichert und nicht an einen Server übertragen.
            </p>
          </section>

          <section className={`${styles.section} ${styles.warningSection}`}>
            <h3 className={styles.sectionTitle}>
              <TriangleAlert className={styles.iconWarning} />
              Wichtiger Hinweis
            </h3>
            <p className={styles.text}>
              Im Web-Modus können lokale Scripts (.bat, .cmd, .ps1, .py) nicht direkt ausgeführt werden. Die Kacheln dienen als visuelles Konfigurations- und Planungswerkzeug.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Folder className={styles.icon} />
              Platzhalter-Pfade
            </h3>
            <p className={styles.text}>
              Die angezeigten Dateipfade sind Platzhalter. Sie können diese frei anpassen, um Ihre gewünschte Konfiguration vorzubereiten.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Save className={styles.icon} />
              JSON Export/Import
            </h3>
            <p className={styles.text}>
              Über die Exportfunktion können Sie Ihre komplette Konfiguration als JSON-Datei speichern. Diese Datei kann später für einen echten Windows-Launcher (z.B. mit Electron) verwendet werden.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Play className={styles.icon} />
              Simulationsmodus
            </h3>
            <p className={styles.text}>
              Der Simulationsmodus erlaubt es, die Ausführung von Scripts visuell zu testen. Status-Änderungen und Log-Ausgaben werden simuliert, um das Dashboard realistisch zu erleben.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Wrench className={styles.icon} />
              Tastenkürzel & Tipps
            </h3>
            <ul className={styles.list}>
              <li>Klicken Sie auf eine Kachel zum Bearbeiten</li>
              <li>Rechtsklick oder ⋮-Menü für weitere Aktionen</li>
              <li>Drag & Drop zum Sortieren der Kacheln</li>
              <li>Nutzen Sie die Suchleiste zum schnellen Finden</li>
            </ul>
          </section>
        </div>

        <DialogFooter className={styles.footer}>
          <div className={styles.versionInfo}>
            <span className={styles.version}>NASBOX Commander Web v1.1</span>
            <span className={styles.credits}>Designed for Werni / Drude No. 5</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}