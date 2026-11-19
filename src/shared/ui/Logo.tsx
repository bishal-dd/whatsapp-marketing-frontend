import { APP_NAME } from "@/src/lib/format";

/** A chat bubble sending out to many: the app's mark, in pine with a saffron dot. */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="36" height="36" rx="10" fill="var(--color-lagoon-deep)" />
      <path
        d="M10 12.5A3.5 3.5 0 0 1 13.5 9h9a3.5 3.5 0 0 1 3.5 3.5v6a3.5 3.5 0 0 1-3.5 3.5H17l-4.2 3.6c-.5.4-1.3.1-1.3-.6V22A3.5 3.5 0 0 1 10 18.5z"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 14h7M14.5 17h4.5"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="27"
        cy="9"
        r="3.5"
        fill="var(--color-marigold)"
        stroke="var(--color-lagoon-deep)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/** Mark plus the app's name. */
export function Logo({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className="text-[1.0625rem] font-semibold tracking-tight text-ink">
        {APP_NAME}
      </span>
    </span>
  );
}
