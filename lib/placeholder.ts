const GRADIENTS = [
  ["#7331BF", "#EC4899"],
  ["#5D26A3", "#F472B6"],
  ["#4C1D85", "#AB7CE0"],
  ["#8B4FD1", "#F9A8D4"],
];

/**
 * Placeholder ilustrativo (gradiente + estrela) para telas que ainda não
 * têm foto real cadastrada — deixa claro que é um espaço reservado, em vez
 * de fingir ser uma foto de verdade. Substituído por upload real no admin
 * a partir da Fase 6.
 */
export function placeholderImage(seed: number): string {
  const [from, to] = GRADIENTS[seed % GRADIENTS.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <circle cx="120" cy="480" r="90" fill="#ffffff" fill-opacity="0.08"/>
    <circle cx="700" cy="120" r="130" fill="#ffffff" fill-opacity="0.08"/>
    <path d="M400 240l14 43h45l-36 27 14 43-37-27-37 27 14-43-36-27h45z" fill="#FBBF24" fill-opacity="0.85"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
