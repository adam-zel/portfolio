import { mediaElementId } from '@/data/projects'

type MediaBlockProps = {
  projectId: string
  title: string
  tall?: boolean
}

export function MediaBlock({ projectId, title, tall = true }: MediaBlockProps) {
  return (
    <section
      id={mediaElementId(projectId)}
      data-testid={`media-block-${projectId}`}
      data-project-id={projectId}
      aria-label={`${title} media`}
      className={[
        'relative w-full shrink-0 overflow-hidden rounded-sm border border-[color:var(--color-border)] bg-[#e4e1d8]',
        tall ? 'min-h-[280px] md:min-h-[420px]' : 'min-h-[160px] md:min-h-[220px]',
      ].join(' ')}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#b8b0bc]/70 via-[#ddd4cd]/80 to-[#f3ead7]" />
      <div className="absolute inset-x-4 top-4 bottom-4 rounded-sm bg-[#d9d5cc]/80" />
    </section>
  )
}
