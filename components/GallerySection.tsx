import { placeholderImage } from "@/lib/placeholder";
import { GalleryItem } from "@/lib/types";

/** Galeria pública — usa fotos reais cadastradas pelo admin (coleção
 * `gallery`); sem nenhuma cadastrada ainda, cai pra placeholders
 * ilustrativos. Como envolve imagens de crianças, nenhuma foto de rosto é
 * publicada sem antes passar pelo cadastro/curadoria do admin. */
export default function GallerySection({ itens = [] }: { itens?: GalleryItem[] }) {
  const fotos =
    itens.length > 0
      ? itens.map((i) => ({ key: i.id, src: i.imagemUrl }))
      : Array.from({ length: 6 }, (_, i) => ({ key: String(i), src: placeholderImage(i) }));

  return (
    <section id="galeria" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge-soft">Galeria</span>
        <h2 className="mt-4 font-display text-3xl font-bold text-amora-950 sm:text-4xl">
          Um pouquinho do nosso espaço
        </h2>
        <p className="mt-3 text-ink/60">Fotos do ambiente, das atividades e dos momentos especiais.</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {fotos.map((f) => (
          <div key={f.key} className="group aspect-square overflow-hidden rounded-2xl shadow-soft">
            <img
              src={f.src}
              alt="Espaço Pequenas Amoras"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
