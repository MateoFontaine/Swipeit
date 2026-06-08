import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

type HostShellProps = {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function HostShell({ children, backHref, backLabel }: HostShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-foreground"
          >
            Swipeit
          </Link>
          {backHref && (
            <Link
              href={backHref}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← {backLabel ?? "Volver"}
            </Link>
          )}
        </div>
        <LogoutButton />
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pb-12">
        {children}
      </main>
    </div>
  );
}
