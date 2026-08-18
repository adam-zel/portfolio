export type Project = {
  id: string
  title: string
  blurb: string
  logo: string
  /** Media frame assets for the right column. Empty = one placeholder frame. */
  media?: string[]
  /** Back-compat for existing image-only project definitions. */
  images?: string[]
}

export const PROJECTS: Project[] = [
  {
    id: 'programa',
    title: 'Programa',
    blurb: 'Design management for interior designers and architects.',
    logo: '/project-icons/programa.png',
    images: [
      '/project-media/PRO-01@2x.webp',
      '/project-media/PRO-02@2x.webp',
      '/project-media/PRO-03@2x.webp',
      '/project-media/PRO-04@2x.webp',
      '/project-media/PRO-05@2x.webp',
      '/project-media/PRO-06@2x.webp',
      '/project-media/PRO-07@2x.webp',
      '/project-media/PRO-08@2x.webp',
      '/project-media/PRO-09@2x.webp',
      '/project-media/PRO-10@2x.webp',
      '/project-media/PRO-11@2x.webp',
      '/project-media/PRO-12@2x.webp',
    ],
  },
  {
    id: 'pennant',
    title: 'Pennant',
    blurb:
      'Your baseball companion for following your teams journey through the season.',
    logo: '/project-icons/pennant.png',
    media: ['/project-media/PEN-01.webm'],
  },
  {
    id: 'thiings',
    title: 'Thiings',
    blurb:
      'Capture, organize, and find your things without leaving your desktop.',
    logo: '/project-icons/thiings.png',
    images: [
      '/project-media/THII-01@2x.webp',
      '/project-media/THII-02@2x.webp',
      '/project-media/THII-03@2x.webp',
      '/project-media/THII-04@2x.webp',
    ],
  },
  {
    id: 'pocket-casts',
    title: 'Pocket Casts',
    blurb:
      'Podcast platform built by podcast listeners, for podcast listeners.',
    logo: '/project-icons/pocket-casts.webp',
    images: [
      '/project-media/PKTC-01@2x.webp',
      '/project-media/PKTC-02@2x.webp',
      '/project-media/PKTC-03@2x.webp',
      '/project-media/PKTC-04@2x.webp',
      '/project-media/PKTC-05@2x.webp',
      '/project-media/PKTC-06@2x.webp',
      '/project-media/PKTC-07@2x.webp',
      '/project-media/PKTC-08@2x.webp',
    ],
  },
  {
    id: 'woocommerce',
    title: 'WooCommerce',
    blurb: 'The most flexible ecommerce platform that grows with you.',
    logo: '/project-icons/woocommerce.webp',
    images: [
      '/project-media/WOO-01@2x.webp',
      '/project-media/WOO-02@2x.webp',
      '/project-media/WOO-03@2x.webp',
      '/project-media/WOO-04@2x.webp',
      '/project-media/WOO-05@2x.webp',
      '/project-media/WOO-06@2x.webp',
      '/project-media/WOO-07@2x.webp',
    ],
  },
  {
    id: 'skedulo',
    title: 'Skedulo',
    blurb: 'Take your deskless workforce to new heights.',
    logo: '/project-icons/skedulo.webp',
    images: [
      '/project-media/SKED-01@2x.webp',
      '/project-media/SKED-02@2x.webp',
      '/project-media/SKED-03@2x.webp',
      '/project-media/SKED-04@2x.webp',
      '/project-media/SKED-05@2x.webp',
    ],
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
  const media = project.media?.length
    ? project.media
    : project.images?.length
      ? project.images
      : [undefined]
  return media.map((src, index) => ({
    projectId: project.id,
    title: project.title,
    index,
    src,
  }))
}
