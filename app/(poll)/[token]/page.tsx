type PollPageProps = {
  params: Promise<{ token: string }>;
};

export default async function PollPage({ params }: PollPageProps) {
  const { token } = await params;

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <p className="text-muted-foreground">
        Encuesta <span className="font-mono text-foreground">{token}</span> —
        próximamente
      </p>
    </main>
  );
}
