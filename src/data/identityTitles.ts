export const IDENTITY_TITLES = [
  'Head of Design',
  'Coffee Drinker',
  'Baseball Watcher',
  'App Developer',
  'Record Collector',
  'Carlton Supporter',
  'Sandwich Enthusiast',
] as const

export type IdentityTitle = (typeof IDENTITY_TITLES)[number]

/** Longest title by character length — used to reserve stable subtitle width. */
export const LONGEST_IDENTITY_TITLE = IDENTITY_TITLES.reduce((longest, title) =>
  title.length > longest.length ? title : longest,
)
