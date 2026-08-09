export type Project = {
  id: string
  title: string
  blurb: string
}

export const PROJECTS: Project[] = [
  {
    id: 'programa',
    title: 'Programa',
    blurb:
      'Design management software for interior designers and architects.',
  },
  {
    id: 'pennant',
    title: 'Pennant',
    blurb:
      'Design management software for interior designers and architects.',
  },
  {
    id: 'pocket-casts',
    title: 'Pocket Casts',
    blurb:
      'Design management software for interior designers and architects.',
  },
  {
    id: 'woocommerce',
    title: 'WooCommerce',
    blurb:
      'Design management software for interior designers and architects.',
  },
  {
    id: 'thiings',
    title: 'Thiings',
    blurb:
      'Design management software for interior designers and architects.',
  },
  {
    id: 'skedulo',
    title: 'Skedulo',
    blurb:
      'Design management software for interior designers and architects.',
  },
  {
    id: 'guvera-music',
    title: 'Guvera Music',
    blurb:
      'Design management software for interior designers and architects.',
  },
]

export function mediaElementId(projectId: string) {
  return `project-media-${projectId}`
}
