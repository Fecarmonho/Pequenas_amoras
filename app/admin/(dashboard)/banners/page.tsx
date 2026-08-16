import { getAllBanners } from "@/lib/banners-db";
import BannerForm from "@/components/admin/BannerForm";
import BannerCard from "@/components/admin/BannerCard";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const banners = await getAllBanners();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-amora-950">Carrossel da Home</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-amora-700">Novo slide</h2>
          <BannerForm />
        </div>

        <div>
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-amora-700">
            Slides cadastrados
          </h2>
          <div className="flex flex-col gap-3">
            {banners.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-amora-900/15 p-6 text-center text-sm text-ink/40">
                Nenhum slide cadastrado ainda.
              </p>
            ) : (
              banners.map((b) => <BannerCard key={b.id} banner={b} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
