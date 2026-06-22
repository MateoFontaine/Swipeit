import Link from "next/link";

type PollShellProps = {
  children: React.ReactNode;
};

export function PollShell({ children }: PollShellProps) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,58,237,0.1),transparent_70%)]"
        aria-hidden
      />

      <header className="relative px-5 pt-8 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Swipe<span className="text-violet-600">it</span>
        </Link>
      </header>

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-12 pt-2 sm:px-6">
        {children}
      </main>
    </div>
  );
}
