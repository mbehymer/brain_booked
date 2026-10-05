const palette = [
  ['#4f46e5', '#e0e7ff'],
  ['#0891b2', '#cffafe'],
  ['#c2410c', '#fed7aa'],
  ['#be185d', '#fce7f3'],
  ['#15803d', '#dcfce7'],
  ['#7c3aed', '#ede9fe'],
  ['#b45309', '#fef3c7'],
  ['#0f766e', '#ccfbf1'],
]

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function avatarFor(name: string): string {
  const [fg, bg] = palette[hashString(name) % palette.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" rx="32" fill="${bg}" />
    <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="80" font-weight="700" fill="${fg}">${initials(name)}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
