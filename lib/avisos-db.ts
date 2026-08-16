import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { Aviso, Student } from "@/lib/types";
import { uid } from "@/lib/uid";

const COLLECTION = "avisos";

export async function getAllAvisos(): Promise<Aviso[]> {
  const snapshot = await adminDb.collection(COLLECTION).orderBy("data", "desc").get();
  return snapshot.docs.map((doc) => doc.data() as Aviso);
}

/** Avisos visíveis para um estudante específico: gerais, direcionados a
 * ele, ou à modalidade dele. */
export async function getAvisosParaEstudante(student: Student): Promise<Aviso[]> {
  const avisos = await getAllAvisos();
  return avisos.filter((a) => {
    if (!a.ativo) return false;
    if (a.destinatario.tipo === "todos") return true;
    if (a.destinatario.tipo === "estudante") return a.destinatario.studentId === student.id;
    if (a.destinatario.tipo === "modalidade") return a.destinatario.modalidade === student.modalidade;
    return false;
  });
}

export async function createAviso(aviso: Omit<Aviso, "id">): Promise<void> {
  const id = uid();
  await adminDb.collection(COLLECTION).doc(id).set({ ...aviso, id });
}

export async function updateAviso(id: string, aviso: Partial<Aviso>): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).update(aviso);
}

export async function deleteAviso(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}
