export type Project = {
  id: string
  title: string
  blurb: string
  logo: string
}

export const PROJECTS: Project[] = [
  {
    id: 'programa',
    title: 'Programa',
    blurb: 'Design management for interior designers and architects.',
    logo: '/project-icons/programa.png',
  },
  {
    id: 'pennant',
    title: 'Pennant',
    blurb:
      'Your baseball companion for following your teams journey through the season.',
    logo: '/project-icons/pennant.png',
  },
  {
    id: 'thiings',
    title: 'Thiings',
    blurb:
      'Capture, organize, and find your things without leaving your desktop.',
    logo: '/project-icons/thiings.png',
  },
  {
    id: 'pocket-casts',
    title: 'Pocket Casts',
    blurb:
      'Podcast platform built by podcast listeners, for podcast listeners.',
    logo: '/project-icons/pocket-casts.webp',
  },
  {
    id: 'woocommerce',
    title: 'WooCommerce',
    blurb: 'The most flexible ecommerce platform that grows with you.',
    logo: '/project-icons/woocommerce.webp',
  },
  {
    id: 'skedulo',
    title: 'Skedulo',
    blurb: 'Take your deskless workforce to new heights.',
    logo: '/project-icons/skedulo.webp',
  },
]

export function mediaElementId(projectId: string) {
  return `project-media-${projectId}`
}
