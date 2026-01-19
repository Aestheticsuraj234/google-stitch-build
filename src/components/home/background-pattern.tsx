export function BackgroundPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Geometric shapes - subtle angular lines like in v0 */}
      <svg
        className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] opacity-[0.08] dark:opacity-[0.03]"
        viewBox="0 0 800 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Angular geometric lines */}
        <path
          d="M200 0 L300 200 L200 400 L100 200 Z"
          stroke="currentColor"
          strokeWidth="1"
          className="text-zinc-400 dark:text-zinc-100"
        />
        <path
          d="M400 50 L500 150 L400 250 L300 150 Z"
          stroke="currentColor"
          strokeWidth="1"
          className="text-zinc-400 dark:text-zinc-100"
        />
        <path
          d="M600 0 L700 200 L600 400 L500 200 Z"
          stroke="currentColor"
          strokeWidth="1"
          className="text-zinc-400 dark:text-zinc-100"
        />
        {/* Connecting lines */}
        <path
          d="M200 200 L400 150"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-zinc-400 dark:text-zinc-100"
        />
        <path
          d="M400 150 L600 200"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-zinc-400 dark:text-zinc-100"
        />
        {/* Additional subtle shapes */}
        <path
          d="M150 100 L250 100 L200 180 Z"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-zinc-400 dark:text-zinc-100"
        />
        <path
          d="M550 80 L650 80 L600 160 Z"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-zinc-400 dark:text-zinc-100"
        />
      </svg>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-zinc-50/80 dark:to-zinc-950/80" />
    </div>
  )
}
