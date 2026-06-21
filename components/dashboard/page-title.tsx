import { cn } from "@/lib/utils";

export function PageTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "mb-8 text-center text-3xl font-semibold tracking-normal text-black md:text-4xl",
        className
      )}
    >
      {children}
    </h1>
  );
}
