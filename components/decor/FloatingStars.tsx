interface FloatingStarsProps {
  /** Quantas estrelas desenhar — mantém baixo pra não poluir a seção. */
  count?: number;
  className?: string;
}

const POSITIONS = [
  { top: "8%", left: "6%", size: 14, delay: "0s" },
  { top: "18%", left: "88%", size: 10, delay: "0.6s" },
  { top: "62%", left: "3%", size: 12, delay: "1.1s" },
  { top: "78%", left: "92%", size: 16, delay: "0.3s" },
  { top: "40%", left: "50%", size: 8, delay: "1.6s" },
  { top: "88%", left: "40%", size: 10, delay: "0.9s" },
];

/** Estrelinhas douradas flutuando/piscando — decoração leve para fundos
 * roxos (hero, seções de destaque). Puramente decorativo (aria-hidden). */
export default function FloatingStars({ count = 6, className = "" }: FloatingStarsProps) {
  const stars = POSITIONS.slice(0, count);
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {stars.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={s.size}
          height={s.size}
          className="absolute animate-twinkle text-dourado drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          fill="currentColor"
        >
          <path d="M12 0l2.6 8.2L23 12l-8.4 3.8L12 24l-2.6-8.2L1 12l8.4-3.8L12 0z" />
        </svg>
      ))}
    </div>
  );
}
