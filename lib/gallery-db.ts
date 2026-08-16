import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { GalleryItem } from "@/lib/types";
import { uid } from "@/lib/uid";

const COLLECTION = "gallery";

export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  const snapshot = await adminDb.collection(COLLECTION).orderBy("ordem").get();
  return snapshot.docs.map((doc) => doc.data() as GalleryItem);
}

export async function getGalleryAtiva(): Promise<GalleryItem[]> {
  try {
    const itens = await getAllGalleryItems();
    return itens.filter((i) => i.ativo);
  } catch {
    // Site público não pode quebrar por falta de Firebase configurado
    // ainda (modo demo) — a Home cai pros placeholders ilustrativos.
    return [];
  }
}

export async function createGalleryItem(item: Omit<GalleryItem, "id">): Promise<void> {
  const id = uid();
  await adminDb.collection(COLLECTION).doc(id).set({ ...item, id });
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}
