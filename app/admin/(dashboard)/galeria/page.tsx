import { getAllGalleryItems } from "@/lib/gallery-db";
import GalleryUpload from "@/components/admin/GalleryUpload";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const itens = await getAllGalleryItems();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Galeria</h1>

      <GalleryUpload />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {itens.map((item) => (
          <div key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl shadow-card">
            <img src={item.imagemUrl} alt={item.legenda ?? ""} className="h-full w-full object-cover" />
            <div className="absolute right-2 top-2 rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100">
              <DeleteButton url={`/api/admin/gallery/${item.id}`} confirmMessage="Excluir esta foto da galeria?" />
            </div>
          </div>
        ))}
        {itens.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-amora-900/15 p-6 text-center text-sm text-ink/40">
            Nenhuma foto na galeria ainda.
          </p>
        )}
      </div>
    </div>
  );
}
