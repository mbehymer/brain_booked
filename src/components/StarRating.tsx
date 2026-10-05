interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
  showValue?: boolean
  reviewCount?: number
}

export default function StarRating({ rating, size = 'sm', showValue = true, reviewCount }: StarRatingProps) {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.min(1, Math.max(0, rating - i))
          return (
            <span key={i} className={`relative ${starSize} text-slate-200`}>
              <svg viewBox="0 0 20 20" fill="currentColor" className={`absolute inset-0 ${starSize}`}>
                <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
              </svg>
              <span className="absolute inset-0 overflow-hidden text-amber-400" style={{ width: `${fill * 100}%` }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className={starSize}>
                  <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
                </svg>
              </span>
            </span>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm text-slate-600">
          {rating.toFixed(1)}
          {typeof reviewCount === 'number' && <span className="text-slate-400"> ({reviewCount})</span>}
        </span>
      )}
    </div>
  )
}
