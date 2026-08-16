"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processarFoto } from "@/lib/image-compress";
import { HiOutlinePhoto } from "react-icons/hi2";

export default function GalleryUpload() {
  const router = useRouter();
  const [processando, setProcessando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProcessando(true);
    setError(null);
    try {
      const imagemUrl = await processarFoto(file);
      const response = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagemUrl }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar a foto.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a foto.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amora-900/20 bg-amora-50 p-8 text-center transition-colors hover:border-amora-500">
        <HiOutlinePhoto className="h-8 w-8 text-amora-500" />
        <span className="text-sm font-semibold text-amora-700">
          {processando ? "Processando..." : "Adicionar foto à galeria"}
        </span>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={processando} className="hidden" />
      </label>
      {error && <p className="mt-2 text-sm font-medium text-rosa-600">{error}</p>}
    </div>
  );
}
