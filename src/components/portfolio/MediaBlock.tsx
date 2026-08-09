import { mediaElementId } from '@/data/projects'

export const MEDIA_ASPECT_RATIO = 1496 / 997

type MediaBlockProps = {
  projectId: string
  title: string
}

export function MediaBlock({ projectId, title }: MediaBlockProps) {
  return (
    <section
      id={mediaElementId(projectId)}
      data-testid={`media-block-${projectId}`}
      data-project-id={projectId}
      aria-label={`${title} media`}
      className="relative w-full shrink-0 overflow-hidden rounded-sm border border-[color:var(--color-border)] bg-[color:var(--color-card)]"
      style={{ aspectRatio: `${MEDIA_ASPECT_RATIO}` }}
    />
  )
}
