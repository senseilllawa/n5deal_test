export function Greeting({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Manager overview</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{email}</p>
      </div>
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-active opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-status-active" />
        </span>
        All systems operational
      </span>
    </div>
  );
}
