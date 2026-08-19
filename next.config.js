/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Fotos ficam em base64 direto no Firestore (sem Storage externo por
    // enquanto), então não há domínio remoto para liberar aqui.
    remotePatterns: [],
  },
  experimental: {
    // Sem isso, o Next guarda em cache no navegador a última versão de
    // cada página por até 30s — marcar uma cobrança como recebida numa
    // tela e navegar pra outra (ex: dashboard → Mensalidades) mostrava
    // dado antigo, como se ainda estivesse pendente, mesmo já salvo certo
    // no banco. Todas as páginas admin já são force-dynamic; isso garante
    // que a navegação sempre busca de novo do servidor.
    staleTimes: { dynamic: 0 },
  },
};

module.exports = nextConfig;
