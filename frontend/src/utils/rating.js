export function getRatingToneClass(rating) {
  if (rating >= 85) return 'tone-light-gold'
  if (rating >= 75) return 'tone-dark-gold'
  if (rating >= 65) return 'tone-silver'
  return 'tone-bronze'
}
