import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { Charge } from "@/lib/types";
import { uid } from "@/lib/uid";

const COLLECTION = "charges";

export async function getChargesByStudent(studentId: string): Promise<Charge[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("studentId", "==", studentId)
    .orderBy("vencimento", "desc")
    .get();
  return snapshot.docs.map((doc) => doc.data() as Charge);
}

export async function getChargesByStudents(studentIds: string[]): Promise<Charge[]> {
  if (studentIds.length === 0) return [];
  const groups: Charge[][] = await Promise.all(
    // "in" do Firestore aceita no máximo 30 valores — não é um problema
    // real na escala de uma escola, mas evita quebrar se crescer.
    chunk(studentIds, 30).map(async (ids) => {
      const snapshot = await adminDb.collection(COLLECTION).where("studentId", "in", ids).get();
      return snapshot.docs.map((doc) => doc.data() as Charge);
    })
  );
  return groups.flat();
}

export async function getAllCharges(): Promise<Charge[]> {
  const snapshot = await adminDb.collection(COLLECTION).orderBy("vencimento", "desc").get();
  return snapshot.docs.map((doc) => doc.data() as Charge);
}

export async function createCharge(charge: Omit<Charge, "id">): Promise<Charge> {
  const id = uid();
  const full: Charge = { ...charge, id };
  await adminDb.collection(COLLECTION).doc(id).set(full);
  return full;
}

/** Cria várias cobranças de uma vez, em lotes de escrita do Firestore
 * (até 500 por lote) em vez de um `set` por cobrança — usado pela
 * renovação automática de mensalidade quando precisa gerar pra muitos
 * alunos de uma vez (ver garantirMensalidadesEmLote), bem mais rápido
 * que uma escrita de cada vez. */
export async function createChargesEmLote(charges: Omit<Charge, "id">[]): Promise<Charge[]> {
  const cheias: Charge[] = charges.map((c) => ({ ...c, id: uid() }));
  for (const grupo of chunk(cheias, 500)) {
    const lote = adminDb.batch();
    for (const c of grupo) lote.set(adminDb.collection(COLLECTION).doc(c.id), c);
    await lote.commit();
  }
  return cheias;
}

export async function updateCharge(id: string, data: Partial<Charge>): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).update(data);
}

export async function deleteCharge(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
