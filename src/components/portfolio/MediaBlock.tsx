import { mediaElementId } from '@/data/projects'

/** Matches Paper Programa media frames (1025×692). */
export const MEDIA_ASPECT_RATIO = 1025 / 692

type MediaBlockProps = {
  projectId: string
  title: string
  index?: number
  imageSrc?: string
}

export function MediaBlock({
  projectId,
  title,
  index = 0,
  imageSrc,
}: MediaBlockProps) {
  const label =
    index > 0 ? `${title} media ${index + 1}` : `${title} media`

  return (
    <section
      id={mediaElementId(projectId, index)}
      data-testid={
        index === 0
          ? `media-block-${projectId}`
          : `media-block-${projectId}-${index}`
      }
      data-project-id={projectId}
      aria-label={label}
      className="relative w-full shrink-0 overflow-hidden rounded-sm border border-[color:var(--color-border)] bg-[color:var(--color-card)]"
      style={{ aspectRatio: `${MEDIA_ASPECT_RATIO}` }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : null}
    </section>
  )
}
