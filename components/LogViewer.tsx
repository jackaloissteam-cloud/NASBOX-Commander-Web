import React, { useEffect, useRef } from "react";
import { Download, Trash2, X } from "lucide-react";
import { Button } from "./Button";
import styles from "./LogViewer.module.css";

export type LogType = "info" | "success" | "error" | "warning";

export interface LogEntry {
  timestamp: string; // Format: HH:MM:SS
  message: string;
  type: LogType;
}

export interface LogViewerProps {
  logs: LogEntry[];
  slotName: string;
  onClear: () => void;
  onExport: () => void;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

export const LogViewer = ({
  logs,
  slotName,
  onClear,
  onExport,
  onClose,
  isOpen,
  className,
}: LogViewerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever logs change or panel opens
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const handleExport = () => {
    if (logs.length === 0) return;
    
    const content = logs
      .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`)
      .join("\n");
      
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    // Replace spaces and special chars for safe filename
    const safeName = slotName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeName}_logs.txt`;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onExport();
  };

  return (
    <div
      className={`${styles.container} ${isOpen ? styles.open : ""} ${
        className ?? ""
      }`}
      aria-hidden={!isOpen}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.slotName}>{slotName}</span>
          <span className={styles.logCount}>
            {logs.length} Eintrag{logs.length !== 1 ? "e" : ""}
          </span>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="ghost"
            size="sm"
            className={styles.headerBtn}
            onClick={onClear}
            disabled={logs.length === 0}
            title="Logs leeren"
          >
            <Trash2 size={16} />
            <span className={styles.btnLabel}>Leeren</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={styles.headerBtn}
            onClick={handleExport}
            disabled={logs.length === 0}
            title="Logs exportieren"
          >
            <Download size={16} />
            <span className={styles.btnLabel}>Exportieren</span>
          </Button>
          <div className={styles.separator} />
          <Button
            variant="ghost"
            size="icon-sm"
            className={styles.closeBtn}
            onClick={onClose}
            title="Schließen"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      <div className={styles.logArea} ref={scrollRef}>
        {logs.length === 0 ? (
          <div className={styles.emptyState}>
            Keine Log-Einträge vorhanden
          </div>
        ) : (
          <div className={styles.logList}>
            {logs.map((log, idx) => (
              <div key={idx} className={`${styles.logEntry} ${styles[log.type]}`}>
                <div className={styles.indicator} />
                <span className={styles.timestamp}>[{log.timestamp}]</span>
                <span className={styles.message}>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};