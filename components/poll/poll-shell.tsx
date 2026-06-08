import Link from "next/link";

type PollShellProps = {
  children: React.ReactNode;
};

export function PollShell({ children }: PollShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="px-6 pt-8 pb-4">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-foreground"
        >
          Swipeit
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pb-12">
        {children}
      </main>
    </div>
  );
}
