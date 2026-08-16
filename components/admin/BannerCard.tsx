"use client";

import { useRouter } from "next/navigation";
import { Banner } from "@/lib/types";
import DeleteButton from "@/components/admin/DeleteButton";

export default function BannerCard({ banner }: { banner: Banner }) {
  const router = useRouter();

  async function toggleAtivo() {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !banner.ativo }),
    });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-amora-900/8 bg-white p-4 shadow-card">
      <img src={banner.imagem} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold text-amora-950">{banner.titulo}</p>
        {banner.data && <p className="text-xs text-ink/40">{banner.data}</p>}
      </div>
      <button
        onClick={toggleAtivo}
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
          banner.ativo ? "bg-folha/15 text-folha" : "bg-ink/5 text-ink/40"
        }`}
      >
        {banner.ativo ? "Ativo" : "Inativo"}
      </button>
      <DeleteButton url={`/api/admin/banners/${banner.id}`} confirmMessage="Excluir este slide do carrossel?" />
    </div>
  );
}
