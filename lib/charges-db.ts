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
