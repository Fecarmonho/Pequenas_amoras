/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Fotos ficam em base64 direto no Firestore (sem Storage externo por
    // enquanto), então não há domínio remoto para liberar aqui.
    remotePatterns: [],
  },
};

module.exports = nextConfig;
