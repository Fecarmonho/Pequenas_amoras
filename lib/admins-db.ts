/**
 * Usuários do painel administrativo — Firestore, coleção "admins" (id =
 * uid do Firebase Auth). Só quem tem um documento aqui consegue acessar
 * o /admin (ver lib/admin-session.ts).
 */
import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { Admin } from "@/lib/types";

const COLLECTION = "admins";

export async function isAdmin(uid: string): Promise<boolean> {
  const doc = await adminDb.collection(COLLECTION).doc(uid).get();
  return doc.exists;
}

export async function countAdmins(): Promise<number> {
  const snapshot = await adminDb.collection(COLLECTION).count().get();
  return snapshot.data().count;
}

export async function getAllAdmins(): Promise<Admin[]> {
  const snapshot = await adminDb.collection(COLLECTION).orderBy("nome").get();
  return snapshot.docs.map((doc) => doc.data() as Admin);
}

export async function createAdminRecord(admin: Admin): Promise<void> {
  await adminDb.collection(COLLECTION).doc(admin.uid).set(admin);
}

export async function deleteAdminRecord(uid: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(uid).delete();
}
