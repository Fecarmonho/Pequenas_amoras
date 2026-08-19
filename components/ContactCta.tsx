import { getConfiguracoes } from "@/lib/config-db";
import { buildWhatsappLink } from "@/lib/whatsapp";

export default async function ContactCta() {
  const config = await getConfiguracoes();

  return (
    <section id="contato" className="mx-auto max-w-6xl px-0 pb-16 sm:px-4 sm:pb-20">
      <div className="relative overflow-hidden rounded-3xl shadow-glow">
        <img src="/brand/contato-banner.png" alt={`Vem fazer parte da família ${config.nomeEscola}`} className="block h-auto w-full" />

        {/* O botão "Conversar no WhatsApp" já faz parte da arte — aqui só
            um link invisível na posição exata dele por cima, pra abrir o
            WhatsApp de verdade quando clicado (em % da imagem, então
            acompanha o redimensionamento em qualquer tela). */}
        <a
          href={buildWhatsappLink(config.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar no WhatsApp"
          className="absolute"
          style={{ left: "37.8%", top: "65.1%", right: "28.5%", bottom: "19.6%" }}
        />
      </div>
    </section>
  );
}
