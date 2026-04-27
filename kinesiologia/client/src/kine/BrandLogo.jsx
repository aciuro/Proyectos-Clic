export default function BrandLogo({ variant = 'mark', size = 42, showText = false }) {
  const w = variant === 'full' ? size * 3.9 : size
  const h = variant === 'full' ? size * 1.35 : size

  return (
    <svg width={w} height={h} viewBox={variant === 'full' ? '0 0 390 135' : '0 0 120 120'} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kinesiología Deportiva">
      <defs>
        <linearGradient id="acNavy" x1="12" y1="12" x2="111" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#062B4F" />
          <stop offset="1" stopColor="#0B2740" />
        </linearGradient>
        <linearGradient id="acTeal" x1="20" y1="20" x2="113" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#079E9B" />
          <stop offset="1" stopColor="#0FB6A6" />
        </linearGradient>
      </defs>
      <g transform={variant === 'full' ? 'translate(8 4) scale(.88)' : 'translate(0 0)'}>
        <path d="M15 96 C27 72 39 42 54 12 L83 96 H70 L61 70 C55 71 48 70 41 68 L28 96 H15Z" fill="url(#acNavy)" />
        <path d="M31 90 C43 60 52 38 58 24 L63 39 C54 55 45 75 38 96 C34 96 28 96 15 96 C21 95 27 93 31 90Z" fill="#FFFFFF" opacity=".88" />
        <path d="M25 73 C51 54 74 40 103 42 C95 46 86 51 79 61 C65 57 49 59 25 73Z" fill="url(#acTeal)" />
        <path d="M63 55 C74 43 90 38 111 43 L111 55 C91 50 76 55 66 67 C57 79 56 91 66 102 C55 97 50 89 51 79 C52 70 56 62 63 55Z" fill="url(#acTeal)" />
        <path d="M80 50 C94 45 104 48 114 55 L108 64 C99 58 90 57 82 62 C72 68 68 82 73 94 C76 101 83 104 91 103 C97 102 104 98 111 91 L111 104 C102 113 91 116 80 112 C67 108 59 97 60 84 C61 69 68 56 80 50Z" fill="url(#acNavy)" />
        <circle cx="74" cy="25" r="9" fill="url(#acTeal)" />
        <circle cx="51" cy="54" r="3.1" fill="url(#acNavy)" />
        <circle cx="53" cy="62" r="3.1" fill="url(#acNavy)" />
        <circle cx="55" cy="70" r="3.1" fill="url(#acNavy)" />
        <circle cx="57" cy="78" r="3.1" fill="url(#acNavy)" />
        <g transform="translate(40 81)">
          <circle cx="0" cy="0" r="11" fill="#fff" stroke="url(#acNavy)" strokeWidth="2" />
          <path d="M0 -8 L6 -3 L4 5 L-4 5 L-6 -3 Z" fill="url(#acNavy)" />
          <path d="M-6 -3 L-11 -5 M6 -3 L11 -5 M4 5 L7 10 M-4 5 L-7 10" stroke="url(#acNavy)" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      </g>
      {showText && (
        <g transform="translate(0 112)">
          <line x1="4" y1="0" x2="58" y2="0" stroke="#079E9B" strokeWidth="2" />
          <text x="72" y="6" fill="#079E9B" fontFamily="DM Sans, Arial, sans-serif" fontSize="18" fontWeight="700" letterSpacing="8">KINESIOLOGIA DEPORTIVA</text>
          <line x1="340" y1="0" x2="386" y2="0" stroke="#079E9B" strokeWidth="2" />
        </g>
      )}
    </svg>
  )
}
