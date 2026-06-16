export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={[
        "w-4 h-4 rounded-full inline-block flex-none border-2 border-solid text-ink-3 [border-top-color:currentColor] [border-right-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-bottom-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-left-color:color-mix(in_srgb,currentColor_35%,transparent)] animate-jm-spin",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
