import { useEffect, useRef } from 'react'
import { mediaElementId } from '@/data/projects'
import { cn } from '@/lib/utils'

/** Historical portfolio media frame ratio (1496×997). */
export const MEDIA_ASPECT_RATIO = 1496 / 997

const mediaFillClassName =
  'absolute inset-0 block h-full w-full rounded-[inherit] object-cover'

type MediaBlockProps = {
  projectId: string
  title: string
  index?: number
  mediaSrc?: string
}

export function MediaBlock({
  projectId,
  title,
  index = 0,
  mediaSrc,
}: MediaBlockProps) {
  const label =
    index > 0 ? `${title} media ${index + 1}` : `${title} media`
  const isVideo = mediaSrc?.toLowerCase().endsWith('.webm') ?? false
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !isVideo) return

    const syncPlayback = (shouldPlay: boolean) => {
      if (shouldPlay) {
        void video.play().catch(() => {})
      } else {
        video.pause()
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        syncPlayback(
          Boolean(entry?.isIntersecting && entry.intersectionRatio > 0),
        )
      },
      {
        threshold: [0, 0.01, 0.25],
        rootMargin: '200px 0px',
      },
    )
    observer.observe(video)

    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [isVideo, mediaSrc])

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
      className={cn(
        'media-frame relative w-full shrink-0 overflow-hidden rounded-sm',
        'border border-[color:var(--color-border)] bg-[color:var(--color-card)]',
      )}
      style={{ aspectRatio: `${MEDIA_ASPECT_RATIO}` }}
    >
      {mediaSrc ? (
        isVideo ? (
          <video
            ref={videoRef}
            src={mediaSrc}
            className={mediaFillClassName}
            loop
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={mediaSrc}
            alt=""
            className={mediaFillClassName}
            draggable={false}
          />
        )
      ) : null}
    </section>
  )
}
