export function EmptyState({ message }: { message: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-border bg-card p-6 text-center text-muted-foreground">
      {message}
    </div>
  );
}
