import React, { useState, useEffect, useRef } from 'react';
import { Info, X } from 'lucide-react';
import { toast } from 'sonner';
import { CategorySidebar } from '../components/CategorySidebar';
import { LogViewer } from '../components/LogViewer';
import { BatchSlotTile } from '../components/BatchSlotTile';
import { BatchEditDialog } from '../components/BatchEditDialog';
import { HelpInfoDialog } from '../components/HelpInfoDialog';
import { useBatchSlots, BatchSlot, SlotCategory } from '../helpers/useBatchSlots';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import styles from './_index.module.css';

export default function BatchCommandCenter() {
  const { 
    slots, 
    searchQuery,
    setSearchQuery,
    searchedSlots,
    activeCategory,
    setActiveCategory,
    slotsByCategory,
    addSlot,
    duplicateSlot,
    updateSlot,
    deleteSlot,
    reorderSlots,
    toggleFavorite,
    togglePinned,
    clearLogs,
    setSlotStatus,
    resetToDefaults,
    importConfig,
    exportConfig,
    createBackup,
    restoreBackup,
    hasBackup,
    isLoaded
  } = useBatchSlots();

  const [selectedSlot, setSelectedSlot] = useState<BatchSlot | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewSlot, setIsNewSlot] = useState(false);
  const [activeLogSlot, setActiveLogSlot] = useState<BatchSlot | null>(null);
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"compact" | "large">("large");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & Drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem("nasboxNoticeDismissed");
    if (!dismissed) {
      setShowNotice(true);
    }

    const savedViewMode = localStorage.getItem("nasboxViewMode");
    if (savedViewMode === "compact" || savedViewMode === "large") {
      setViewMode(savedViewMode);
    }

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const dismissNotice = () => {
    setShowNotice(false);
    localStorage.setItem("nasboxNoticeDismissed", "true");
  };

  const handleViewModeChange = (mode: "compact" | "large") => {
    setViewMode(mode);
    localStorage.setItem("nasboxViewMode", mode);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error("Vollbildmodus konnte nicht aktiviert werden.");
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleAddSlot = () => {
    const categoryToUse = activeCategory === "Alle" ? "Utilities" : activeCategory;
    const newSlot = addSlot(categoryToUse as SlotCategory);
    if (newSlot.name === "Limit Reached") {
      toast.error("Maximales Slot-Limit erreicht.");
      return;
    }
    setSelectedSlot(newSlot);
    setIsNewSlot(true);
    setIsEditDialogOpen(true);
  };

  const handleEditSlot = (slot: BatchSlot) => {
    setSelectedSlot(slot);
    setIsNewSlot(false);
    setIsEditDialogOpen(true);
  };

  const handleSaveSlot = (slot: BatchSlot) => {
    updateSlot(slot);
    toast.success(`Slot "${slot.name}" gespeichert.`);
  };

  const handleDeleteSlot = (id: string) => {
    deleteSlot(id);
    toast.success("Slot gelöscht.");
  };

  const handleDuplicateSlot = (id: string) => {
    const duplicated = duplicateSlot(id);
    if (duplicated) {
      toast.success("Slot dupliziert.");
    } else {
      toast.error("Slot-Limit erreicht.");
    }
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    const slot = slots.find(s => s.id === id);
    if (slot) {
      toast.success(slot.favorite ? "Aus Favoriten entfernt" : "Zu Favoriten hinzugefügt");
    }
  };

  const handleTogglePin = (id: string) => {
    togglePinned(id);
    const slot = slots.find(s => s.id === id);
    if (slot) {
      toast.success(slot.pinned ? "Slot losgelöst" : "Slot angepinnt");
    }
  };

  const handleStatusToggle = (slot: BatchSlot) => {
    if (slot.status === "empty") return;
    const newStatus = slot.status === "running" ? "ready" : "running";
    setSlotStatus(slot.id, newStatus);
    
    // Simulate log if setting to running
    if (newStatus === "running") {
      toast.info(`Slot "${slot.name}" gestartet.`);
    } else {
      toast.success(`Slot "${slot.name}" gestoppt.`);
    }
  };

  const openLogs = (slot: BatchSlot) => {
    setActiveLogSlot(slot);
    setIsLogViewerOpen(true);
  };

  const handleResetDefaults = () => {
    resetToDefaults();
    toast.success("Presets zurückgesetzt.");
  };

  const handleRestoreBackup = () => {
    if (restoreBackup()) {
      toast.success("Backup erfolgreich wiederhergestellt.");
    } else {
      toast.error("Kein Backup verfügbar.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importConfig(content);
      if (result.success) {
        toast.success(`${result.count} Slots erfolgreich importiert.`);
      } else {
        toast.error(result.error || "Fehler beim Importieren der Konfiguration.");
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const json = exportConfig();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nasbox-config-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Konfiguration exportiert.");
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow drag image to generate before adding styles
    setTimeout(() => {
      // Adding a class is handled by React state isDragging
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== dragOverId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    if (dragOverId === id) {
      setDragOverId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      const fromIndex = slots.findIndex(s => s.id === draggedId);
      const toIndex = slots.findIndex(s => s.id === id);
      if (fromIndex !== -1 && toIndex !== -1) {
        reorderSlots(fromIndex, toIndex);
        toast.success("Reihenfolge aktualisiert.");
      }
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const categoriesData = [
    { name: "Alle" as const, count: slots.length },
    { name: "NAS" as const, count: slotsByCategory.NAS },
    { name: "OCR" as const, count: slotsByCategory.OCR },
    { name: "AI" as const, count: slotsByCategory.AI },
    { name: "Backup" as const, count: slotsByCategory.Backup },
    { name: "Utilities" as const, count: slotsByCategory.Utilities },
  ];

  if (!isLoaded) return null; // or skeleton

  const configuredCount = slots.filter(s => s.status !== "empty").length;
  const readyCount = slots.filter(s => s.status === "ready" || s.status === "success").length;
  const errorCount = slots.filter(s => s.status === "error").length;

  return (
    <div className={styles.appContainer}>
      <CategorySidebar
        categories={categoriesData}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => setActiveCategory(cat as any)}
        onAddSlot={handleAddSlot}
        onImport={handleImportClick}
        onExport={handleExport}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
        onResetDefaults={handleResetDefaults}
        onShowHelp={() => setIsHelpOpen(true)}
        onRestoreBackup={handleRestoreBackup}
        hasBackup={hasBackup}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <input 
        type="file" 
        accept=".json" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          {showNotice && (
            <div className={styles.noticeBanner}>
              <Info className={styles.noticeIcon} size={20} />
              <div className={styles.noticeText}>
                <strong>Web-Modus:</strong> Lokale Scripts können nicht direkt ausgeführt werden. Nutzen Sie dieses Dashboard als Steuerungs- und Konfigurations-Frontend.
              </div>
              <button className={styles.noticeClose} onClick={dismissNotice} aria-label="Schließen">
                <X size={18} />
              </button>
            </div>
          )}
          
          <div className={styles.statsBar}>
            <Badge variant="outline">{configuredCount} Konfiguriert</Badge>
            <Badge variant="success">{readyCount} Bereit</Badge>
            <Badge variant="destructive">{errorCount} Fehler</Badge>
          </div>
        </header>

        <div className={styles.scrollArea}>
          {searchedSlots.length === 0 ? (
            <div className={styles.emptyState}>
              {searchQuery ? "Keine passenden Slots gefunden." : "Noch keine Slots in dieser Kategorie."}
              {!searchQuery && (
                <Button onClick={handleAddSlot} variant="outline" className={styles.emptyAction}>
                  Neuen Slot erstellen
                </Button>
              )}
            </div>
          ) : (
            <div className={`${styles.tileGrid} ${viewMode === 'compact' ? styles.compactGrid : ''}`}>
              {searchedSlots.map(slot => (
                <BatchSlotTile
                  key={slot.id}
                  slot={slot}
                  viewMode={viewMode}
                  onClick={() => handleEditSlot(slot)}
                  onStatusToggle={() => handleStatusToggle(slot)}
                  onDuplicate={() => handleDuplicateSlot(slot.id)}
                  onToggleFavorite={() => handleToggleFavorite(slot.id)}
                  onTogglePin={() => handleTogglePin(slot.id)}
                  onOpenLogs={() => openLogs(slot)}
                  onDelete={() => handleDeleteSlot(slot.id)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, slot.id)}
                  onDragOver={(e) => handleDragOver(e, slot.id)}
                  onDrop={(e) => handleDrop(e, slot.id)}
                  onDragEnter={(e) => handleDragOver(e, slot.id)}
                  onDragLeave={(e) => handleDragLeave(e, slot.id)}
                  isDragging={draggedId === slot.id}
                  isDragOver={dragOverId === slot.id}
                />
              ))}
            </div>
          )}
        </div>
        
        <footer className={styles.versionFooter}>
          NASBOX Commander Web v1.1 — Designed for Werni / Drude No. 5
        </footer>

        <LogViewer
          isOpen={isLogViewerOpen}
          onClose={() => setIsLogViewerOpen(false)}
          logs={activeLogSlot?.logs || []}
          slotName={activeLogSlot?.name || "Logs"}
          onClear={() => {
            if (activeLogSlot) {
              clearLogs(activeLogSlot.id);
              toast.success("Logs geleert.");
              setActiveLogSlot(prev => prev ? { ...prev, logs: [] } : null);
            }
          }}
          onExport={() => {
            toast.success("Logs exportiert.");
          }}
        />
      </main>

      <BatchEditDialog
        slot={selectedSlot}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
        isNew={isNewSlot}
      />
      
      <HelpInfoDialog 
        isOpen={isHelpOpen} 
        onOpenChange={setIsHelpOpen} 
      />
    </div>
  );
}