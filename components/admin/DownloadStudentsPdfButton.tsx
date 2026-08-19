"use client";

import { useState } from "react";
import { HiOutlineArrowDownTray } from "react-icons/hi2";

export interface StudentPdfRow {
  nome: string;
  modalidade: string;
  periodo?: string;
  status: string;
}

/** Gera o PDF com texto de verdade (não é foto da tela) — mais leve e o
 * texto sai selecionável/pesquisável no PDF final. */
export default function DownloadStudentsPdfButton({ students }: { students: StudentPdfRow[] }) {
  const [gerando, setGerando] = useState(false);

  async function handleClick() {
    setGerando(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const margemEsquerda = 15;
      const margemDireita = 195;
      const alturaPagina = 297;
      let y = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Pequenas Amoras — Lista de Estudantes", margemEsquerda, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} — ${students.length} estudante(s)`, margemEsquerda, y);
      y += 10;

      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Nome", margemEsquerda, y);
      doc.text("Modalidade", 95, y);
      doc.text("Turno", 145, y);
      doc.text("Status", 175, y);
      y += 2;
      doc.setDrawColor(200);
      doc.line(margemEsquerda, y, margemDireita, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      for (const s of students) {
        if (y > alturaPagina - 15) {
          doc.addPage();
          y = 20;
        }
        doc.text(s.nome, margemEsquerda, y, { maxWidth: 75 });
        doc.text(s.modalidade, 95, y, { maxWidth: 45 });
        doc.text(s.periodo || "—", 145, y, { maxWidth: 25 });
        doc.text(s.status, 175, y, { maxWidth: 20 });
        y += 7;
      }

      doc.save(`estudantes-pequenas-amoras-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setGerando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={gerando}
      className="flex items-center gap-1.5 rounded-full border border-amora-900/15 px-4 py-2.5 text-sm font-semibold text-amora-700 hover:border-amora-600 disabled:opacity-60"
    >
      <HiOutlineArrowDownTray className="h-4 w-4" /> {gerando ? "Gerando..." : "Baixar lista em PDF"}
    </button>
  );
}
