import React from 'react';
import { 
  GripHorizontal, Play, Square, Star, Pin, Copy, Terminal, 
  MoreVertical, Pencil, Trash2, Check 
} from 'lucide-react';
import { Badge } from './Badge';
import { BatchSlot } from '../helpers/useBatchSlots';
import { Button } from './Button';
import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './DropdownMenu';
import styles from './BatchSlotTile.module.css';

interface Props {
  slot: BatchSlot;
  onClick: () => void;
  onStatusToggle: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  viewMode?: "compact" | "large";
  onToggleFavorite?: () => void;
  onTogglePin?: () => void;
  onDuplicate?: () => void;
  onOpenLogs?: () => void;
  onDelete?: () => void;
}

export const BatchSlotTile = ({ 
  slot, 
  onClick, 
  onStatusToggle,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave,
  isDragging,
  isDragOver,
  viewMode = "large",
  onToggleFavorite,
  onTogglePin,
  onDuplicate,
  onOpenLogs,
  onDelete
}: Props) => {
  const isEmpty = slot.status === "empty";
  const isRunning = slot.status === "running";

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusToggle();
  };

  const handleAction = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    action?.();
  };

  const renderActionMenu = () => (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className={styles.smallActionBtn} title="Weitere Aktionen">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onStatusToggle}>
            {isRunning ? <Square size={16} style={{ marginRight: 8 }} /> : <Play size={16} style={{ marginRight: 8 }} />}
            {isRunning ? "Simulation stoppen" : "Simulation starten"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onClick}>
            <Pencil size={16} style={{ marginRight: 8 }} /> Bearbeiten
          </DropdownMenuItem>
          {onDuplicate && (
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy size={16} style={{ marginRight: 8 }} /> Duplizieren
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {onToggleFavorite && (
            <DropdownMenuItem onClick={onToggleFavorite}>
              <Star size={16} style={{ marginRight: 8 }} /> Favorit
              {slot.favorite && <Check size={16} style={{ marginLeft: "auto" }} />}
            </DropdownMenuItem>
          )}
          {onTogglePin && (
            <DropdownMenuItem onClick={onTogglePin}>
              <Pin size={16} style={{ marginRight: 8 }} /> Anpinnen
              {slot.pinned && <Check size={16} style={{ marginLeft: "auto" }} />}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {onOpenLogs && (
            <DropdownMenuItem onClick={onOpenLogs}>
              <Terminal size={16} style={{ marginRight: 8 }} /> Logs anzeigen
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} style={{ color: 'var(--error)' }}>
                <Trash2 size={16} style={{ marginRight: 8 }} /> Löschen
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div 
      className={`
        ${styles.tile} 
        ${styles[slot.status]} 
        ${styles[viewMode]}
        ${isDragging ? styles.dragging : ''}
        ${isDragOver ? styles.dragOver : ''}
      `}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.dragHandle} onClick={e => e.stopPropagation()}>
        <GripHorizontal size={16} />
      </div>

      {viewMode === "large" ? (
        <>
          <div className={styles.header}>
            <div className={styles.icon}>{slot.icon || "📁"}</div>
            <div className={styles.headerRight}>
              {slot.pinned && <Pin size={16} className={styles.pinIcon} />}
              {!isEmpty && onToggleFavorite && (
                <button 
                  className={`${styles.starBtn} ${slot.favorite ? styles.favorite : ''}`} 
                  onClick={(e) => handleAction(e, onToggleFavorite)}
                  title={slot.favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                >
                  <Star size={16} fill={slot.favorite ? "currentColor" : "none"} />
                </button>
              )}
              <div className={`${styles.statusDot} ${styles[`status-${slot.status}`]}`} title={`Status: ${slot.status}`} />
            </div>
          </div>

          <div className={styles.content}>
            <h3 className={styles.name}>{isEmpty ? "Leerer Slot" : slot.name}</h3>
            {!isEmpty && (
              <>
                <Badge variant="outline" className={styles.categoryBadge}>{slot.category}</Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className={styles.path}>{slot.path || "Kein Pfad"}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    Platzhalter-Pfad – Im Web-Modus nicht ausführbar
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>

          <div className={styles.footer}>
            {!isEmpty && (
              <>
                <Button 
                  variant={isRunning ? "destructive" : "primary"} 
                  size="sm" 
                  className={styles.actionBtn}
                  onClick={handleStatusToggle}
                >
                  {isRunning ? <Square size={14} /> : <Play size={14} />}
                  <span>{isRunning ? "Stoppen" : "Ausführen"}</span>
                </Button>
                <div className={styles.footerActionsRight}>
                  {renderActionMenu()}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        /* Compact View */
        <div className={styles.compactLayout}>
          <div className={styles.compactLeft}>
            <div className={styles.iconCompact}>{slot.icon || "📁"}</div>
            {slot.pinned && <Pin size={14} className={styles.pinIconCompact} />}
            <h3 className={styles.nameCompact}>{isEmpty ? "Leerer Slot" : slot.name}</h3>
            {!isEmpty && (
              <>
                <Badge variant="outline" className={styles.categoryBadgeCompact}>{slot.category}</Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className={styles.pathCompact}>{slot.path || "Kein Pfad"}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    Platzhalter-Pfad – Im Web-Modus nicht ausführbar
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
          
          <div className={styles.compactRight}>
            {!isEmpty && onToggleFavorite && (
              <button 
                className={`${styles.starBtn} ${slot.favorite ? styles.favorite : ''}`} 
                onClick={(e) => handleAction(e, onToggleFavorite)}
                title={slot.favorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
              >
                <Star size={16} fill={slot.favorite ? "currentColor" : "none"} />
              </button>
            )}
            
            <div className={`${styles.statusDot} ${styles[`status-${slot.status}`]}`} title={`Status: ${slot.status}`} />
            
            {!isEmpty && (
              <div className={styles.compactActions}>
                {renderActionMenu()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};