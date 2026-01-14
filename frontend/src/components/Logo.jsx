export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="6" fill="#6C63FF" />
      <path d="M7 15 L11 9 L17 15" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}
