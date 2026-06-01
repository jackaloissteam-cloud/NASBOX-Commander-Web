import { useState, useEffect, useCallback, useMemo } from 'react';

export type SlotCategory = "NAS" | "OCR" | "AI" | "Backup" | "Utilities";
export type SlotStatus = "empty" | "ready" | "running" | "success" | "error";

export interface LogEntry {
  timestamp: string; // ISO string
  message: string;
  type: "info" | "success" | "error" | "warning";
}

export interface BatchSlot {
  id: string; // unique string ID
  name: string;
  path: string;
  description: string;
  category: SlotCategory;
  icon: string; // emoji character, default "📁"
  status: SlotStatus;
  logs: LogEntry[];
  order: number; // for drag & drop sorting
  lastRun?: string;
  favorite?: boolean;
  pinned?: boolean;
}

export const DEFAULT_PRESETS: Omit<BatchSlot, 'id' | 'order' | 'status' | 'logs' | 'favorite' | 'pinned'>[] = [
  // NAS category
  { name: "Open NAS Public", icon: "📂", description: "Öffnet den öffentlichen NAS-Ordner", path: "C:\\Scripts\\NAS\\open_nas_public.bat", category: "NAS" },
  { name: "Open NAS Logs", icon: "📋", description: "Zeigt NAS-Server Logdateien an", path: "C:\\Scripts\\NAS\\open_nas_logs.bat", category: "NAS" },
  { name: "GrokSort Images", icon: "🖼️", description: "Sortiert Bilder auf dem NAS automatisch", path: "C:\\Scripts\\NAS\\groksort_images.py", category: "NAS" },
  { name: "NAS Backup", icon: "💾", description: "Erstellt ein vollständiges NAS-Backup", path: "C:\\Scripts\\NAS\\nas_backup.bat", category: "NAS" },
  // OCR category
  { name: "OCR Watcher Deluxe", icon: "👁️", description: "Überwacht OCR-Eingangsordner und verarbeitet automatisch", path: "C:\\Scripts\\OCR\\ocr_watcher_deluxe.ps1", category: "OCR" },
  { name: "OCR Scharfmacher", icon: "🔍", description: "Verbessert Bildschärfe vor OCR-Verarbeitung", path: "C:\\Scripts\\OCR\\ocr_scharfmacher.py", category: "OCR" },
  { name: "Open OCR Input", icon: "📥", description: "Öffnet den OCR-Eingangsordner", path: "C:\\Scripts\\OCR\\open_ocr_input.bat", category: "OCR" },
  { name: "Open OCR Done", icon: "✅", description: "Öffnet den OCR-Ausgabeordner", path: "C:\\Scripts\\OCR\\open_ocr_done.bat", category: "OCR" },
  // AI category
  { name: "Stable Diffusion WebUI", icon: "🎨", description: "Startet Stable Diffusion Web-Oberfläche", path: "C:\\Scripts\\AI\\stable_diffusion_webui.bat", category: "AI" },
  { name: "ComfyUI", icon: "🧩", description: "Startet ComfyUI Node-Editor", path: "C:\\Scripts\\AI\\comfyui_start.bat", category: "AI" },
  { name: "Hugging Face Test", icon: "🤗", description: "Testet Hugging Face Modelle lokal", path: "C:\\Scripts\\AI\\huggingface_test.py", category: "AI" },
  { name: "Prompt Generator", icon: "⚡", description: "Generiert optimierte AI-Prompts", path: "C:\\Scripts\\AI\\prompt_generator.py", category: "AI" },
  // Backup category
  { name: "Backup Dashboard", icon: "📊", description: "Zeigt Backup-Status und Statistiken", path: "C:\\Scripts\\Backup\\backup_dashboard.ps1", category: "Backup" },
  { name: "Verify Backup", icon: "🛡️", description: "Verifiziert Backup-Integrität", path: "C:\\Scripts\\Backup\\verify_backup.bat", category: "Backup" },
  { name: "Open Backup Logs", icon: "📝", description: "Öffnet Backup-Protokolldateien", path: "C:\\Scripts\\Backup\\open_backup_logs.bat", category: "Backup" },
  // Utilities category
  { name: "Open Scripts Folder", icon: "📁", description: "Öffnet den Hauptordner aller Scripts", path: "C:\\Scripts\\open_scripts.bat", category: "Utilities" },
  { name: "Open AI Folder", icon: "🤖", description: "Öffnet den AI-Projektordner", path: "C:\\Scripts\\Utilities\\open_ai_folder.bat", category: "Utilities" },
  { name: "Open Downloads", icon: "⬇️", description: "Öffnet den Download-Ordner", path: "C:\\Scripts\\Utilities\\open_downloads.bat", category: "Utilities" },
  { name: "System Info", icon: "🖥️", description: "Zeigt Systeminformationen an", path: "C:\\Scripts\\Utilities\\system_info.ps1", category: "Utilities" },
  { name: "Help / Instructions", icon: "❓", description: "Zeigt Hilfe und Anleitungen", path: "C:\\Scripts\\Utilities\\help.bat", category: "Utilities" },
];

const STORAGE_KEY = 'nasboxSlots';
const BACKUP_KEY = 'nasboxSlots_backup';

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export function getDefaultPresets(): BatchSlot[] {
  return DEFAULT_PRESETS.map((p, index) => ({
    ...p,
    id: generateId(),
    status: "ready",
    logs: [],
    order: index,
    favorite: false,
    pinned: false,
  }));
}

export function useBatchSlots() {
  const [slots, setSlots] = useState<BatchSlot[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SlotCategory | "Alle">("Alle");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasBackup, setHasBackup] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(BACKUP_KEY)) {
      setHasBackup(true);
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSlots(parsed.sort((a, b) => a.order - b.order));
        } else {
          const defaults = getDefaultPresets();
          setSlots(defaults);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        }
      } catch (e) {
        const defaults = getDefaultPresets();
        setSlots(defaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      }
    } else {
      const defaults = getDefaultPresets();
      setSlots(defaults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
    setIsLoaded(true);
  }, []);

  const addSlot = useCallback((category: SlotCategory): BatchSlot => {
    let createdSlot: BatchSlot | null = null;
    
    setSlots(prev => {
      if (prev.length >= 50) return prev; // max 50 slots
      
      const newSlot: BatchSlot = {
        id: generateId(),
        name: "Neuer Slot",
        path: "",
        description: "",
        category,
        icon: "📁",
        status: "empty",
        logs: [],
        order: prev.length,
        favorite: false,
        pinned: false,
      };
      
      createdSlot = newSlot;
      const next = [...prev, newSlot];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    return createdSlot || {
      id: generateId(),
      name: "Limit erreicht",
      path: "",
      description: "",
      category,
      icon: "📁",
      status: "error",
      logs: [],
      order: 0
    };
  }, []);

  const duplicateSlot = useCallback((id: string): BatchSlot | null => {
    let duplicated: BatchSlot | null = null;
    setSlots(prev => {
      if (prev.length >= 50) return prev;
      const existing = prev.find(s => s.id === id);
      if (!existing) return prev;
      
      const newSlot: BatchSlot = {
        ...existing,
        id: generateId(),
        name: `${existing.name} (Kopie)`,
        order: prev.length,
        status: existing.status === "empty" ? "empty" : "ready",
        logs: []
      };
      duplicated = newSlot;
      const next = [...prev, newSlot];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return duplicated;
  }, []);

  const updateSlot = useCallback((updatedSlot: BatchSlot) => {
    setSlots(prev => {
      const next = prev.map(s => s.id === updatedSlot.id ? updatedSlot : s);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteSlot = useCallback((id: string) => {
    setSlots(prev => {
      const next = prev.filter(s => s.id !== id);
      const reordered = next.map((s, index) => ({ ...s, order: index }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reordered));
      return reordered;
    });
  }, []);

  const reorderSlots = useCallback((fromIndex: number, toIndex: number) => {
    setSlots(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      const reordered = next.map((s, index) => ({ ...s, order: index }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reordered));
      return reordered;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setSlots(prev => {
      const next = prev.map(s => s.id === id ? { ...s, favorite: !s.favorite } : s);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const togglePinned = useCallback((id: string) => {
    setSlots(prev => {
      const next = prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addLog = useCallback((slotId: string, entry: Omit<LogEntry, "timestamp">) => {
    setSlots(prev => {
      const next = prev.map(s => {
        if (s.id === slotId) {
          return {
            ...s,
            logs: [...s.logs, { ...entry, timestamp: new Date().toISOString() }]
          };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearLogs = useCallback((slotId: string) => {
    setSlots(prev => {
      const next = prev.map(s => s.id === slotId ? { ...s, logs: [] } : s);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setSlotStatus = useCallback((slotId: string, status: SlotStatus) => {
    setSlots(prev => {
      const next = prev.map(s => {
        if (s.id === slotId) {
          const lastRun = status === "running" ? new Date().toISOString() : s.lastRun;
          return { ...s, status, lastRun };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const createBackup = useCallback(() => {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      localStorage.setItem(BACKUP_KEY, current);
      setHasBackup(true);
    }
  }, []);

  const restoreBackup = useCallback((): boolean => {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        if (Array.isArray(parsed)) {
          setSlots(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          return true;
        }
      } catch (e) {
        return false;
      }
    }
    return false;
  }, []);

  const resetToDefaults = useCallback(() => {
    createBackup();
    const defaults = getDefaultPresets();
    setSlots(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  }, [createBackup]);

  const exportConfig = useCallback(() => {
    return JSON.stringify(slots, null, 2);
  }, [slots]);

  const importConfig = useCallback((json: string): { success: boolean; error?: string; count?: number } => {
    createBackup();
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        return { success: false, error: "Die Datei enthält keine gültige Slot-Konfiguration." };
      }
      if (parsed.length === 0) {
        return { success: false, error: "Die Konfiguration enthält keine Slots." };
      }
      if (parsed.length > 50) {
        return { success: false, error: "Maximal 50 Slots erlaubt." };
      }

      for (const item of parsed) {
        if (!item.id || typeof item.id !== 'string' || !item.name || typeof item.name !== 'string') {
          return { success: false, error: "Einige Slots haben fehlende Pflichtfelder (Name, Kategorie)." };
        }
        if (!item.category || typeof item.category !== 'string' || !["NAS", "OCR", "AI", "Backup", "Utilities"].includes(item.category)) {
          return { success: false, error: "Ungültige Kategorie gefunden" };
        }
        if (!item.status || typeof item.status !== 'string' || !["empty", "ready", "running", "success", "error"].includes(item.status)) {
          return { success: false, error: "Einige Slots haben fehlende Pflichtfelder (Name, Kategorie)." };
        }
      }

      const reordered = parsed.map((s, index) => ({ 
        ...s, 
        order: index,
        favorite: s.favorite ?? false,
        pinned: s.pinned ?? false,
        logs: s.logs ?? []
      }));
      setSlots(reordered);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reordered));
      return { success: true, count: reordered.length };
    } catch (e) {
      return { success: false, error: "Die Datei enthält keine gültige Slot-Konfiguration." };
    }
  }, [createBackup]);

  const filteredSlots = useMemo(() => {
    let filtered = activeCategory === "Alle" ? slots : slots.filter(s => s.category === activeCategory);
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.order - b.order;
    });
  }, [slots, activeCategory]);

  const searchedSlots = useMemo(() => {
    if (!searchQuery.trim()) return filteredSlots;
    const q = searchQuery.toLowerCase();
    return filteredSlots.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.path?.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  }, [filteredSlots, searchQuery]);

  const totalSlots = slots.length;

  const slotsByCategory = useMemo(() => {
    const counts: Record<SlotCategory, number> = {
      NAS: 0,
      OCR: 0,
      AI: 0,
      Backup: 0,
      Utilities: 0
    };
    slots.forEach(s => {
      if (counts[s.category] !== undefined) {
        counts[s.category]++;
      }
    });
    return counts;
  }, [slots]);

  return {
    slots,
    isLoaded,
    activeCategory,
    setActiveCategory,
    filteredSlots,
    searchQuery,
    setSearchQuery,
    searchedSlots,
    addSlot,
    duplicateSlot,
    updateSlot,
    deleteSlot,
    reorderSlots,
    toggleFavorite,
    togglePinned,
    addLog,
    clearLogs,
    setSlotStatus,
    resetToDefaults,
    exportConfig,
    importConfig,
    createBackup,
    restoreBackup,
    hasBackup,
    totalSlots,
    slotsByCategory
  };
}