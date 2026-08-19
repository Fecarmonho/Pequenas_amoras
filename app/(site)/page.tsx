import Hero from "@/components/Hero";
import BannerCarousel, { CarouselSlide } from "@/components/BannerCarousel";
import AboutSection from "@/components/AboutSection";
import FounderSection from "@/components/FounderSection";
import ActivitiesSection from "@/components/ActivitiesSection";
import GallerySection from "@/components/GallerySection";
import ContactCta from "@/components/ContactCta";
import { placeholderImage } from "@/lib/placeholder";
import { getBannersAtivos } from "@/lib/banners-db";
import { getGalleryAtiva } from "@/lib/gallery-db";
import { getConfiguracoes } from "@/lib/config-db";

export const revalidate = 60;

// Slides de demonstração — usadas só enquanto o admin não cadastra nenhum
// aviso real no carrossel (ver Fase 6, /admin/banners).
const SLIDES_DEMO: CarouselSlide[] = [
  {
    id: "demo-1",
    titulo: "Semana da Diversão",
    subtitulo: "Uma semana cheia de aventuras para os nossos pequenos!",
    data: "18 a 22 de agosto",
    imagem: placeholderImage(0),
    botaoTexto: "Saiba mais",
    botaoLink: "/#atividades",
  },
  {
    id: "demo-2",
    titulo: "Dia do Brincar",
    subtitulo: "Brincadeiras ao ar livre e muita energia boa.",
    data: "toda sexta-feira",
    imagem: placeholderImage(1),
  },
  {
    id: "demo-3",
    titulo: "Matrículas abertas",
    subtitulo: "Garanta a vaga do seu filho para o próximo semestre.",
    imagem: placeholderImage(2),
    botaoTexto: "Falar no WhatsApp",
    botaoLink: "/#contato",
  },
];

export default async function HomePage() {
  const [banners, galeria, config] = await Promise.all([getBannersAtivos(), getGalleryAtiva(), getConfiguracoes()]);

  const slides: CarouselSlide[] =
    banners.length > 0
      ? banners.map((b) => ({
          id: b.id,
          titulo: b.titulo,
          subtitulo: b.subtitulo,
          descricao: b.descricao,
          data: b.data,
          imagem: b.imagem,
          imagemMobile: b.imagemMobile,
          botaoTexto: b.botaoTexto,
          botaoLink: b.botaoLink,
        }))
      : SLIDES_DEMO;

  return (
    <main>
      <Hero />
      <BannerCarousel slides={slides} />
      <AboutSection />
      {config.fundadoraNome && config.fundadoraHistoria && (
        <FounderSection nome={config.fundadoraNome} foto={config.fundadoraFoto} historia={config.fundadoraHistoria} />
      )}
      <ActivitiesSection />
      <GallerySection itens={galeria} />
      <ContactCta />
    </main>
  );
}
