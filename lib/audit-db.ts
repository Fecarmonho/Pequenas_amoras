import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { AuditLog } from "@/lib/types";
import { uid } from "@/lib/uid";

const COLLECTION = "audit_logs";

/** Chamar dentro das mutações administrativas sensíveis (criar/editar/
 * excluir estudante, responsável, cobrança) — não é um subsistema à
 * parte, só um registro a mais gravado junto da operação. */
export async function logAudit(entry: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
  const id = uid();
  const full: AuditLog = { ...entry, id, timestamp: new Date().toISOString() };
  await adminDb.collection(COLLECTION).doc(id).set(full);
}

export async function getRecentAuditLogs(limit = 50): Promise<AuditLog[]> {
  const snapshot = await adminDb.collection(COLLECTION).orderBy("timestamp", "desc").limit(limit).get();
  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}
