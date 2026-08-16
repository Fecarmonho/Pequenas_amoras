import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { Banner } from "@/lib/types";
import { uid } from "@/lib/uid";

const COLLECTION = "banners";

export async function getAllBanners(): Promise<Banner[]> {
  const snapshot = await adminDb.collection(COLLECTION).orderBy("ordem").get();
  return snapshot.docs.map((doc) => doc.data() as Banner);
}

export async function getBannersAtivos(): Promise<Banner[]> {
  try {
    const banners = await getAllBanners();
    return banners.filter((b) => b.ativo);
  } catch {
    // Site público não pode quebrar por falta de Firebase configurado
    // ainda (modo demo) — a Home cai pros slides de demonstração.
    return [];
  }
}

export async function createBanner(banner: Omit<Banner, "id">): Promise<void> {
  const id = uid();
  await adminDb.collection(COLLECTION).doc(id).set({ ...banner, id });
}

export async function updateBanner(id: string, banner: Partial<Banner>): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).update(banner);
}

export async function deleteBanner(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}
