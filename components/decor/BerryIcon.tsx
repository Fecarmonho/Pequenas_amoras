/** Ícone de amora com folha — usado como divisor/acento de seção, no
 * mesmo estilo do detalhe central da logo. */
export default function BerryIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 6c2-3 5-4 7-3-1 2-3 3-4 5 2-1 5-1 6 1-2 1-4 1-6 2"
        stroke="#6FA84B"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {[
        [18, 20],
        [24, 18],
        [30, 20],
        [15, 26],
        [21, 25],
        [27, 25],
        [33, 26],
        [18, 32],
        [24, 31],
        [30, 32],
        [24, 38],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4.4" className="fill-amora-700" />
      ))}
    </svg>
  );
}
