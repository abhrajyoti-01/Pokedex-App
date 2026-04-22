export default function SkeletonCard() {
  return (
    <div className="pt-12" aria-hidden="true" style={{ contain: 'layout style' }}>
      <div className="w-full flex flex-col items-center pt-16 pb-4 px-3 rounded-2xl border border-white/5 bg-[#0a0a0a]">
        <div className="w-24 h-24 rounded-full bg-white/[0.03] animate-pulse" />
        <div className="mt-4 flex flex-col items-center gap-2 w-full px-4">
          <div className="h-3 w-20 rounded-full bg-white/[0.04] animate-pulse" />
          <div className="flex gap-1.5">
            <div className="h-4 w-12 rounded-full bg-white/[0.03] animate-pulse" />
            <div className="h-4 w-12 rounded-full bg-white/[0.03] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
