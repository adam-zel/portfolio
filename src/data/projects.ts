export type Project = {
  id: string
  title: string
  blurb: string
  logo: string
  /** Media frame images for the right column. Empty = one placeholder frame. */
  images?: string[]
}

export const PROJECTS: Project[] = [
  {
    id: 'programa',
    title: 'Programa',
    blurb: 'Design management for interior designers and architects.',
    logo: '/project-icons/programa.png',
    images: [
      '/project-media/programa-1.webp',
      '/project-media/programa-2.webp',
      '/project-media/programa-3.webp',
      '/project-media/programa-4.webp',
    ],
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

/** DOM id for a project's media frame. Index 0 is the scroll-target for card clicks. */
export function mediaElementId(projectId: string, index = 0) {
  return index === 0
    ? `project-media-${projectId}`
    : `project-media-${projectId}-${index}`
}

/** Flat list of media frames to render in the right column. */
export function projectMediaFrames(project: Project) {
  const images = project.images?.length ? project.images : [undefined]
  return images.map((src, index) => ({
    projectId: project.id,
    title: project.title,
    index,
    src,
  }))
}
