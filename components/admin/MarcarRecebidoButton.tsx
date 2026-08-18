"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineCheck } from "react-icons/hi2";

/** Marca uma mensalidade como paga direto da lista, sem abrir o hub do
 * aluno — some da lista do mês vigente e passa a aparecer no histórico. */
export default function MarcarRecebidoButton({ chargeId }: { chargeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch(`/api/admin/charges/${chargeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pago" }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-full bg-folha/15 px-3 py-1.5 text-xs font-bold text-folha hover:bg-folha/25 disabled:opacity-50"
    >
      <HiOutlineCheck className="h-3.5 w-3.5" /> {loading ? "..." : "Recebido"}
    </button>
  );
}
