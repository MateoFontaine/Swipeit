import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

type HostShellProps = {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function HostShell({ children, backHref, backLabel }: HostShellProps) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,58,237,0.1),transparent_70%)]"
        aria-hidden
      />

      <header className="relative flex items-center justify-between gap-4 px-5 pt-8 pb-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="shrink-0 text-lg font-semibold tracking-tight text-foreground"
          >
            Swipe<span className="text-violet-600">it</span>
          </Link>
          {backHref && (
            <Link
              href={backHref}
              className="truncate text-sm font-medium text-muted-foreground transition-colors hover:text-violet-600"
            >
              ← {backLabel ?? "Volver"}
            </Link>
          )}
        </div>
        <LogoutButton className="h-auto shrink-0 rounded-lg border-0 bg-transparent px-2 py-1.5 text-sm font-medium text-muted-foreground shadow-none hover:bg-transparent hover:text-violet-600" />
      </header>

      <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-8 sm:px-6 sm:pb-12">
        {children}
      </main>
    </div>
  );
}
