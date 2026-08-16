import { FaWhatsapp } from "react-icons/fa6";
import { getConfiguracoes } from "@/lib/config-db";
import { buildWhatsappLink } from "@/lib/whatsapp";

export default async function WhatsAppFloat() {
  const config = await getConfiguracoes();

  return (
    <a
      href={buildWhatsappLink(config.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card-hover transition-transform hover:scale-110"
    >
      <FaWhatsapp className="h-7 w-7" />
    </a>
  );
}
