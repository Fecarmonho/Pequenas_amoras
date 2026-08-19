"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineTrash } from "react-icons/hi2";

export default function DeleteButton({ url, confirmMessage }: { url: string; confirmMessage: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        alert("Não foi possível excluir. Tente novamente — se persistir, faça login de novo.");
        return;
      }
      router.refresh();
    } catch {
      alert("Não foi possível excluir. Verifique sua conexão e tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      aria-label="Excluir"
      className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-rosa-100 hover:text-rosa-600 disabled:opacity-50"
    >
      <HiOutlineTrash className="h-4 w-4" />
    </button>
  );
}
