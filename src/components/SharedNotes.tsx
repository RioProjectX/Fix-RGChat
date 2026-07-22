import { useState, useEffect } from "react";
import { FileText, Save, RefreshCw, CheckCircle, Clock } from "lucide-react";
import { motion } from "motion/react";

interface SharedNotesProps {
  initialNotes: string;
  onSaveNotes: (notes: string) => Promise<boolean>;
}

export default function SharedNotes({ initialNotes, onSaveNotes }: SharedNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Keep notes synchronized with parent changes
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Debounced auto-save logic
  useEffect(() => {
    if (notes === initialNotes) return;
    
    setSaveStatus("saving");
    const timeoutId = setTimeout(async () => {
      const success = await onSaveNotes(notes);
      if (success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    }, 1500); // 1.5 seconds auto-save debounce

    return () => clearTimeout(timeoutId);
  }, [notes, initialNotes, onSaveNotes]);

  const handleManualSave = async () => {
    setSaveStatus("saving");
    const success = await onSaveNotes(notes);
    if (success) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setSaveStatus("error");
    }
  };

  const getStatusLabel = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <span className="text-[#D4A373] bg-[#FAEDCD] px-2.5 py-1 rounded-full flex items-center text-[10px] font-bold">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Sedang Mengetik...
          </span>
        );
      case "saved":
        return (
          <span className="text-[#588157] bg-[#E9EDC6] px-2.5 py-1 rounded-full flex items-center text-[10px] font-bold">
            <CheckCircle className="w-3 h-3 mr-1" />
            Perubahan Tersimpan!
          </span>
        );
      case "error":
        return (
          <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-full flex items-center text-[10px] font-bold">
            Gagal menyimpan
          </span>
        );
      default:
        return (
          <span className="text-[#A89F91] flex items-center text-[11px] font-medium">
            <Clock className="w-3.5 h-3.5 mr-1 text-[#8B7E74]" />
            Auto-save aktif
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#E6D5B8] p-6 md:p-8" id="shared-notes-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-serif italic text-[#8B7E74] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#BC8F8F]" />
            Catatan Bersama
          </h2>
          <p className="text-sm text-[#A89F91] mt-1">
            Buku diary dan jurnal cinta digital yang bisa diedit berdua dan sinkron secara instan.
          </p>
        </div>
        <div className="flex items-center space-x-3 self-start md:self-center">
          {getStatusLabel()}
          <button
            onClick={handleManualSave}
            disabled={saveStatus === "saving"}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#D4A373] text-white hover:bg-[#BC8F8F] disabled:opacity-50 text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan</span>
          </button>
        </div>
      </div>

      <div className="w-full">
        {/* Note editor canvas */}
        <div className="border border-[#E6D5B8] rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#D4A373] focus-within:border-transparent transition-all bg-white">
          <div className="bg-[#FAF3E0]/40 px-4 py-2 border-b border-[#E6D5B8] flex items-center space-x-4 text-xs text-[#8B7E74] font-medium">
            <span>Mendukung teks bebas dan emoji ✨</span>
            <span className="text-gray-300">|</span>
            <span>Draft tersimpan di server</span>
          </div>
          <textarea
            className="w-full h-96 md:h-[28rem] p-5 text-sm font-sans focus:outline-none resize-none leading-relaxed text-[#4A403A] bg-transparent italic"
            placeholder="Tulis apa saja di sini... Hubungan kita, bucket list kencan, atau coretan manis."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-xs text-[#A89F91]">
            Karakter: {notes.length} | Baris: {notes.split("\n").length}
          </span>
          <span className="text-xs text-[#BC8F8F] italic font-medium">Disinkronkan secara real-time</span>
        </div>
      </div>
    </div>
  );
}
