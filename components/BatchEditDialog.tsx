import React, { useEffect } from 'react';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Dialog';
import { Form, FormItem, FormLabel, FormControl, FormMessage, useForm } from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from './Select';
import { BatchSlot, SlotCategory } from '../helpers/useBatchSlots';
import styles from './BatchEditDialog.module.css';

const PRESET_EMOJIS = ["📁", "🖥️", "🔧", "🧠", "💾", "📊", "🔄", "🗂️", "🛡️", "⚡", "🌐", "📡"];

const schema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  path: z.string()
    .min(1, "Pfad ist erforderlich")
    .refine(
      val => {
        const lower = val.toLowerCase();
        return lower.endsWith('.bat') || lower.endsWith('.cmd') || lower.endsWith('.ps1') || lower.endsWith('.py');
      }, 
      "Muss eine .bat, .cmd, .ps1 oder .py Datei sein"
    ),
  description: z.string().optional().default(""),
  category: z.enum(["NAS", "OCR", "AI", "Backup", "Utilities"]),
  icon: z.string().min(1, "Icon ist erforderlich").max(5, "Maximal ein Emoji")
});

interface Props {
  slot: BatchSlot | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (slot: BatchSlot) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

export const BatchEditDialog = ({ slot, isOpen, onOpenChange, onSave, onDelete, isNew }: Props) => {
  const form = useForm({
    schema,
    defaultValues: {
      name: "",
      path: "",
      description: "",
      category: "Utilities",
      icon: "📁"
    }
  });

  useEffect(() => {
    if (isOpen && slot) {
      form.setValues({
        name: slot.status === "empty" && isNew ? "" : slot.name || "",
        path: slot.path || "",
        description: slot.description || "",
        category: slot.category || "Utilities",
        icon: slot.icon || "📁"
      });
    }
  }, [isOpen, slot, isNew, form.setValues]);

  if (!slot) return null;

  const handleSubmit = (values: z.infer<typeof schema>) => {
    onSave({
      ...slot,
      name: values.name,
      path: values.path,
      description: values.description || "",
      category: values.category as SlotCategory,
      icon: values.icon,
      status: slot.status === "empty" ? "ready" : slot.status
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (slot.id) {
      onDelete(slot.id);
    }
    onOpenChange(false);
  };

  const title = isNew || slot.status === "empty" ? "Neuen Slot erstellen" : "Slot bearbeiten";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Konfigurieren Sie den Batch-Slot. Zulässige Dateitypen: .bat, .cmd, .ps1, .py.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.formContainer}>
            <div className={styles.row}>
              <div className={styles.flex2}>
                <FormItem name="name">
                  <FormLabel>Anzeigename</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="z.B. System Backup" 
                      value={form.values.name} 
                      onChange={e => form.setValues(prev => ({...prev, name: e.target.value}))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>

              <div className={styles.flex1}>
                <FormItem name="category">
                  <FormLabel>Kategorie</FormLabel>
                  <FormControl>
                    <Select 
                      value={form.values.category} 
                      onValueChange={(val) => form.setValues(prev => ({...prev, category: val as SlotCategory}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="NAS">NAS</SelectItem>
                          <SelectItem value="OCR">OCR</SelectItem>
                          <SelectItem value="AI">AI</SelectItem>
                          <SelectItem value="Backup">Backup</SelectItem>
                          <SelectItem value="Utilities">Utilities</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            </div>

            <FormItem name="path">
              <FormLabel>Dateipfad</FormLabel>
              <FormControl>
                <Input 
                  placeholder="C:\Scripts\script.ps1" 
                  className={styles.monospaceInput}
                  value={form.values.path} 
                  onChange={e => form.setValues(prev => ({...prev, path: e.target.value}))} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="icon">
              <FormLabel>Icon (Emoji)</FormLabel>
              <div className={styles.iconRow}>
                <FormControl>
                  <Input 
                    value={form.values.icon} 
                    onChange={e => form.setValues(prev => ({...prev, icon: e.target.value}))} 
                    className={styles.iconInput}
                  />
                </FormControl>
                <div className={styles.emojiPresets}>
                  {PRESET_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className={styles.emojiBtn}
                      onClick={() => form.setValues(prev => ({...prev, icon: emoji}))}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>

            <FormItem name="description">
              <FormLabel>Beschreibung (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Zweck des Scripts..." 
                  value={form.values.description} 
                  onChange={e => form.setValues(prev => ({...prev, description: e.target.value}))} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <DialogFooter className={styles.footer}>
              <div className={styles.footerLeft}>
                {!isNew && slot.status !== "empty" && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleDelete}
                  >
                    Löschen
                  </Button>
                )}
              </div>
              <div className={styles.footerRight}>
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  Speichern
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};