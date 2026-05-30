const resultBadge = (agent: string, result: string, color: string) => (
  <span
    key={agent}
    className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px]"
    style={{
      backgroundColor: `${color}12`,
      color: color,
      border: `1px solid ${color}20`,
    }}
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: color }}
    />
    {agent}: {result}
  </span>
);

export default function BrowserMockup() {
  return (
    <div className="rounded-lg border border-white/[0.06] overflow-hidden">
      {/* Browser chrome */}
      <div className="bg-[#0e0f10] border-b border-white/[0.04] px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white/[0.04] rounded-md px-4 py-1 text-[11px] text-[#3d3f45] max-w-[200px] w-full text-center">
            claudex.dev/feed
          </div>
        </div>
        <div className="w-[46px]" />
      </div>

      {/* Feed content */}
      <div className="bg-[#000000] p-5">
        {/* Post 1 */}
        <div className="border-b border-white/[0.06] pb-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center shrink-0">
              <span className="text-[12px] text-[#1d9bf0] font-medium">
                SP
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-[#e7e9ea]">
                  Sarah Park
                </span>
                <span className="text-[13px] text-[#536471]">@sarahdev</span>
                <span className="text-[13px] text-[#536471]">· 2h</span>
              </div>
              <p className="text-[14px] text-[#8b8d93] mt-1 leading-relaxed">
                Tested all three agents on a Next.js auth migration from
                NextAuth to Clerk. Claude Code handled the edge cases around
                middleware perfectly. Codex got close but missed the token
                refresh flow.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {resultBadge("Claude Code", "passed", "#A855F7")}
                {resultBadge("Codex", "partial", "#3B82F6")}
                {resultBadge("Cursor", "failed", "#F59E0B")}
              </div>
            </div>
          </div>
        </div>

        {/* Post 2 */}
        <div className="pb-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#22C55E]/10 flex items-center justify-center shrink-0">
              <span className="text-[12px] text-[#22C55E] font-medium">
                MK
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-[#e7e9ea]">
                  Max Klein
                </span>
                <span className="text-[13px] text-[#536471]">@maxk</span>
                <span className="text-[13px] text-[#536471]">· 5h</span>
              </div>
              <p className="text-[14px] text-[#8b8d93] mt-1 leading-relaxed">
                REST API to GraphQL migration benchmark. Surprised by the
                results on this one...
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {resultBadge("Claude Code", "partial", "#A855F7")}
                {resultBadge("Codex", "passed", "#3B82F6")}
                {resultBadge("Cursor", "partial", "#F59E0B")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fade overlay */}
      <div className="h-12 bg-gradient-to-t from-black to-transparent -mt-12 relative z-10 pointer-events-none" />
    </div>
  );
}
