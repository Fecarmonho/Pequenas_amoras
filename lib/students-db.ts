import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { Student } from "@/lib/types";
import { uid } from "@/lib/uid";

const COLLECTION = "students";

export async function getAllStudents(): Promise<Student[]> {
  const snapshot = await adminDb.collection(COLLECTION).orderBy("nome").get();
  return snapshot.docs.map((doc) => doc.data() as Student);
}

export async function getStudentById(id: string): Promise<Student | null> {
  const doc = await adminDb.collection(COLLECTION).doc(id).get();
  return doc.exists ? (doc.data() as Student) : null;
}

/**
 * Único ponto de leitura de estudante pro lado da família — só retorna o
 * estudante se `guardianUid` estiver entre os responsáveis autorizados.
 * Todo endpoint/página da Área da Família precisa passar por aqui (nunca
 * confiar num `studentId` vindo da URL sem essa checagem).
 */
export async function getStudentForGuardian(studentId: string, guardianUid: string): Promise<Student | null> {
  const student = await getStudentById(studentId);
  if (!student) return null;
  const { getGuardianByUid } = await import("@/lib/guardians-db");
  const guardian = await getGuardianByUid(guardianUid);
  if (!guardian || !student.guardianIds.includes(guardian.id)) return null;
  return student;
}

export async function getStudentsByIds(ids: string[]): Promise<Student[]> {
  if (ids.length === 0) return [];
  const docs = await Promise.all(ids.map((id) => adminDb.collection(COLLECTION).doc(id).get()));
  return docs.filter((d) => d.exists).map((d) => d.data() as Student);
}

export async function createStudent(student: Omit<Student, "id">): Promise<Student> {
  const id = uid();
  const full: Student = { ...student, id };
  await adminDb.collection(COLLECTION).doc(id).set(full);
  return full;
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).update({ ...data, updatedAt: new Date().toISOString() });
}

export async function deleteStudent(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}
