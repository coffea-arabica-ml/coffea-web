/** Visor de câmera com um cafeeiro: indica onde a foto vai aparecer e como enquadrar a planta. */
export function IlustracaoEnquadramento({ className }: { className?: string }) {
  const folha = 'M0 0 C 10 -9, 30 -9, 40 0 C 30 9, 10 9, 0 0 Z'
  const folhas: [number, number, number, number][] = [
    // x, y, rotação, escala
    [120, 70, -60, 0.8],
    [120, 70, -120, 0.8],
    [120, 100, -25, 1],
    [120, 100, -155, 1],
    [120, 135, -15, 1.15],
    [120, 135, -165, 1.15],
    [120, 170, -8, 1.3],
    [120, 170, -172, 1.3],
    [120, 205, -2, 1.35],
    [120, 205, -178, 1.35],
  ]
  return (
    <svg viewBox="0 0 240 300" className={className} aria-hidden fill="none">
      {/* cantos do visor */}
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-folha-600/50">
        <path d="M20 50 V20 H50 M190 20 H220 V50 M220 250 V280 H190 M50 280 H20 V250" />
      </g>
      {/* lente */}
      <circle cx="160" cy="118" r="30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" className="text-cereja-500/70" />
      {/* vaso e caule */}
      <path d="M92 236 H148 L141 268 H99 Z" className="fill-folha-900/15" />
      <path d="M120 238 V58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-folha-700/60" />
      {folhas.map(([x, y, r, s], i) => (
        <path
          key={i}
          d={folha}
          transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
          className={i % 3 === 0 ? 'fill-folha-500/55' : 'fill-folha-600/40'}
        />
      ))}
      {/* frutos */}
      {[
        [112, 150],
        [128, 186],
        [114, 190],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4.5" className="fill-cereja-500/50" />
      ))}
    </svg>
  )
}
