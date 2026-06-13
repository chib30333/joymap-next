import { btnCls } from "@/lib/btn";
import { Icons } from "../Icons";

export function ExportButton({
  label,
  onClick,
  size = "md",
}: {
  label: string;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button className={btnCls("dash", "ghost", size)} onClick={onClick}>
      <Icons.download size={size === "sm" ? 15 : 16} />
      {label}
    </button>
  );
}
