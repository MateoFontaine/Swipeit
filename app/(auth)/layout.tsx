import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
