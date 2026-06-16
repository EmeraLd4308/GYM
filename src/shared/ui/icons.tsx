export function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSpark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l1.2 4.2L17.5 7.5l-4.3 1.3L12 13l-1.2-4.2L6.5 7.5l4.3-1.3L12 2zM19 15l.7 2.5 2.3.8-2.3.8-.7 2.5-.7-2.5-2.3-.8 2.3-.8.7-2.5z" />
    </svg>
  );
}

export function IconTemplates({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6.5A2.5 2.5 0 016.5 4H9a2.5 2.5 0 012.5 2.5V9a2.5 2.5 0 01-2.5 2.5H6.5A2.5 2.5 0 014 9V6.5zM15 4h2.5A2.5 2.5 0 0120 6.5V9a2.5 2.5 0 01-2.5 2.5H15a2.5 2.5 0 01-2.5-2.5V6.5A2.5 2.5 0 0115 4zM4 15a2.5 2.5 0 012.5-2.5H9a2.5 2.5 0 012.5 2.5v2.5A2.5 2.5 0 019 20H6.5A2.5 2.5 0 014 17.5V15zM15 12.5h2.5A2.5 2.5 0 0120 15v2.5a2.5 2.5 0 01-2.5 2.5H15a2.5 2.5 0 01-2.5-2.5V15a2.5 2.5 0 012.5-2.5z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 17H6a2 2 0 01-2-2V9a2 2 0 012-2h4M14 15l4-3-4-3M18 12H8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
