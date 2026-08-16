import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { Guardian } from "@/lib/types";
import { uid } from "@/lib/uid";

const COLLECTION = "guardians";

export async function getAllGuardians(): Promise<Guardian[]> {
  const snapshot = await adminDb.collection(COLLECTION).orderBy("nome").get();
  return snapshot.docs.map((doc) => doc.data() as Guardian);
}

export async function getGuardianById(id: string): Promise<Guardian | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as Guardian) : null;
}

/** Único ponto de leitura do responsável autenticado — pelo uid do
 * Firebase Auth (o mesmo salvo no cookie de sessão), nunca por um ID
 * qualquer vindo da URL. */
export async function getGuardianByUid(uid: string): Promise<Guardian | null> {
  const snapshot = await adminDb.collection(COLLECTION).where("uid", "==", uid).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Guardian;
}

export async function getGuardianByEmail(email: string): Promise<Guardian | null> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("email", "==", email.toLowerCase())
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Guardian;
}

export async function getGuardianByCpf(cpf: string): Promise<Guardian | null> {
  const snapshot = await adminDb.collection(COLLECTION).where("cpf", "==", cpf).limit(1).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Guardian;
}

export async function createGuardian(guardian: Omit<Guardian, "id">): Promise<Guardian> {
  const id = uid();
  const full: Guardian = { ...guardian, id };
  await adminDb.collection(COLLECTION).doc(id).set(full);
  return full;
}

export async function updateGuardian(id: string, data: Partial<Guardian>): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).update(data);
}

export async function deleteGuardian(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}

export async function addStudentToGuardian(guardianId: string, studentId: string): Promise<void> {
  const guardian = await getGuardianById(guardianId);
  if (!guardian) return;
  const studentIds = Array.from(new Set([...guardian.studentIds, studentId]));
  await updateGuardian(guardianId, { studentIds });
}
