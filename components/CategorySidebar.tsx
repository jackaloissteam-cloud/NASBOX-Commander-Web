import React, { useState } from "react";
import {
  HardDrive,
  ScanText,
  Brain,
  Archive,
  Wrench,
  LayoutGrid,
  Plus,
  Upload,
  Download,
  Maximize,
  Minimize,
  Menu,
  X,
  Search,
  Grid3X3,
  List,
  RotateCcw,
  HelpCircle,
  History
} from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Input } from "./Input";
import styles from "./CategorySidebar.module.css";

export type SlotCategory = "NAS" | "OCR" | "AI" | "Backup" | "Utilities";

export interface CategoryData {
  name: SlotCategory | "Alle";
  count: number;
}

export interface CategorySidebarProps {
  categories: CategoryData[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onAddSlot: () => void;
  onImport: () => void;
  onExport: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  onResetDefaults?: () => void;
  onShowHelp?: () => void;
  onRestoreBackup?: () => void;
  hasBackup?: boolean;
  viewMode?: "compact" | "large";
  onViewModeChange?: (mode: "compact" | "large") => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Alle: <LayoutGrid size={18} />,
  NAS: <HardDrive size={18} />,
  OCR: <ScanText size={18} />,
  AI: <Brain size={18} />,
  Backup: <Archive size={18} />,
  Utilities: <Wrench size={18} />,
};

export const CategorySidebar = ({
  categories,
  activeCategory,
  onCategoryChange,
  onAddSlot,
  onImport,
  onExport,
  onFullscreen,
  isFullscreen,
  onResetDefaults,
  onShowHelp,
  onRestoreBackup,
  hasBackup,
  viewMode = "large",
  onViewModeChange,
  searchQuery = "",
  onSearchChange,
  className,
}: CategorySidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);

  const handleReset = () => {
    if (confirmReset) {
      onResetDefaults?.();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button (Visible only on small screens) */}
      <button className={styles.mobileToggle} onClick={toggleMobile} aria-label="Menü umschalten">
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div className={styles.mobileBackdrop} onClick={() => setIsMobileOpen(false)} />
      )}

      <aside
        className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ""} ${
          className ?? ""
        }`}
      >
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <span className={styles.logoPrimary}>NASBOX</span>
            <span className={styles.logoSecondary}>Commander Web</span>
          </div>
        </div>

        {onSearchChange && (
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <Input 
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Slots durchsuchen..."
              className={styles.searchInput}
            />
          </div>
        )}

        <nav className={styles.navList}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                onClick={() => {
                  onCategoryChange(cat.name);
                  setIsMobileOpen(false);
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <div className={styles.navItemIcon}>
                  {CATEGORY_ICONS[cat.name] || <LayoutGrid size={18} />}
                </div>
                <span className={styles.navItemLabel}>{cat.name}</span>
                <span className={styles.badge}>{cat.count}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.footerActions}>
          <Button
            variant="ghost"
            className={styles.actionBtn}
            onClick={onAddSlot}
          >
            <Plus size={18} />
            <span>Neuer Slot</span>
          </Button>
          <Button
            variant="ghost"
            className={styles.actionBtn}
            onClick={onImport}
          >
            <Upload size={18} />
            <span>Importieren</span>
          </Button>
          <Button
            variant="ghost"
            className={styles.actionBtn}
            onClick={onExport}
          >
            <Download size={18} />
            <span>Exportieren</span>
          </Button>
          <Button
            variant="ghost"
            className={styles.actionBtn}
            onClick={onFullscreen}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            <span>Vollbild</span>
          </Button>
          {onViewModeChange && (
            <Button
              variant="ghost"
              className={styles.actionBtn}
              onClick={() => onViewModeChange(viewMode === "large" ? "compact" : "large")}
            >
              {viewMode === "large" ? <List size={18} /> : <Grid3X3 size={18} />}
              <span>{viewMode === "large" ? "Kompakt" : "Groß"}</span>
            </Button>
          )}
          {onRestoreBackup && hasBackup && (
            <Button
              variant="ghost"
              className={styles.actionBtn}
              onClick={onRestoreBackup}
            >
              <History size={18} />
              <span>Backup wiederherstellen</span>
            </Button>
          )}
          {onResetDefaults && (
            <Button
              variant="ghost"
              className={`${styles.actionBtn} ${styles.resetBtn} ${confirmReset ? styles.confirmReset : ""}`}
              onClick={handleReset}
            >
              <RotateCcw size={18} />
              <span>{confirmReset ? "Wirklich?" : "Zurücksetzen"}</span>
            </Button>
          )}
          {onShowHelp && (
            <Button
              variant="ghost"
              className={styles.actionBtn}
              onClick={onShowHelp}
            >
              <HelpCircle size={18} />
              <span>Hilfe & Info</span>
            </Button>
          )}
        </div>
      </aside>
    </>
  );
};