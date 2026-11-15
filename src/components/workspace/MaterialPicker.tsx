"use client";

import { useMemo, useState } from "react";
import { FileText, Plus, X } from "lucide-react";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Document } from "@/lib/types";

interface MaterialPickerProps {
  materials: Document[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export function MaterialPicker({ materials, selectedIds, onChange }: MaterialPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedMaterials = selectedIds
    .map((id) => materials.find((material) => material.id === id))
    .filter((material): material is Document => Boolean(material));
  const filteredMaterials = materials.filter((material) =>
    `${material.name} ${material.course} ${material.format}`.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID"))
  );

  function toggleMaterial(id: string) {
    onChange(selectedIdSet.has(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]);
  }

  function removeMaterial(id: string) {
    onChange(selectedIds.filter((selectedId) => selectedId !== id));
  }

  return <div className="material-picker">
    <div className="material-picker-heading">
      <div><strong>Materi</strong><p>Pilih satu atau beberapa file untuk satu sesi belajar.</p></div>
      <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) setQuery(""); }}>
        <DialogTrigger asChild>
          <Button type="button" variant="secondary"><Plus size={15} aria-hidden="true" />Pilih materi <span className="material-picker-count">{selectedMaterials.length}</span></Button>
        </DialogTrigger>
        <DialogPortal>
          <DialogOverlay className="material-picker-overlay" />
          <DialogContent className="material-picker-dialog">
            <div className="material-picker-dialog-heading">
              <div>
                <DialogTitle>Pilih materi sesi</DialogTitle>
                <DialogDescription>Centang semua file yang ingin Anda gunakan. Materi dapat berasal dari mata kuliah berbeda.</DialogDescription>
              </div>
              <DialogClose asChild><Button type="button" variant="ghost" className="material-picker-close" aria-label="Tutup pemilih materi"><X size={18} aria-hidden="true" /></Button></DialogClose>
            </div>
            <SearchInput value={query} onChange={setQuery} placeholder="Cari nama, mata kuliah, atau format" label="Cari materi sesi" />
            <div className="material-picker-list" aria-label="Daftar materi">
              {filteredMaterials.map((material) => {
                const isSelected = selectedIdSet.has(material.id);
                return <label className={`material-picker-option${isSelected ? " is-selected" : ""}`} key={material.id}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleMaterial(material.id)} />
                  <span className="material-picker-file-icon"><FileText size={17} aria-hidden="true" /></span>
                  <span className="material-picker-option-copy"><strong>{material.name}</strong><small>{material.course} · {material.format}{material.origin === "sample" ? " · Contoh" : " · Lokal"}</small></span>
                </label>;
              })}
              {filteredMaterials.length === 0 ? <p className="material-picker-empty">{materials.length ? "Tidak ada materi yang cocok dengan pencarian." : "Belum ada materi di pustaka. Tambahkan materi terlebih dahulu."}</p> : null}
            </div>
            <div className="material-picker-dialog-footer">
              <span>{selectedMaterials.length} materi dipilih</span>
              <DialogClose asChild><Button type="button">Selesai</Button></DialogClose>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
    {selectedMaterials.length ? <ul className="material-picker-selected" aria-label="Materi terpilih">
      {selectedMaterials.map((material) => <li className="material-picker-chip" key={material.id}>
        <span title={material.name}>{material.name}</span>
        <button type="button" onClick={() => removeMaterial(material.id)} aria-label={`Hapus ${material.name} dari pilihan`}><X size={14} aria-hidden="true" /></button>
      </li>)}
    </ul> : <p className="material-picker-no-selection">Belum ada materi dipilih.</p>}
  </div>;
}
