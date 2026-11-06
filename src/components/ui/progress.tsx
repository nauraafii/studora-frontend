import * as ProgressPrimitive from "@radix-ui/react-progress";

export function Progress({ value, className = "" }: { value: number; className?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <ProgressPrimitive.Root className={("progress " + className).trim()} value={safeValue}>
      <ProgressPrimitive.Indicator className="progress-indicator" style={{ width: safeValue + "%" }} />
    </ProgressPrimitive.Root>
  );
}
