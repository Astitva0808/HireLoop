export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M11 8C6.58172 8 3 11.5817 3 16C3 20.4183 6.58172 24 11 24C14.0603 24 16.7168 22.2822 18.0603 19.75"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M21 24C25.4183 24 29 20.4183 29 16C29 11.5817 25.4183 8 21 8C17.9397 8 15.2832 9.71776 13.9397 12.25"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="h-6 w-6 text-teal" />
      <span className="font-display text-lg font-semibold tracking-tight text-ink">
        HireLoop
      </span>
    </span>
  );
}
