import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,58,237,0.12),transparent_70%)]"
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

      <main className="relative flex flex-1 flex-col justify-center px-5 pb-16 pt-6 sm:px-6">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
