import { type ReactNode } from "react";

export function AdminHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: ReactNode;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-[16px] mb-[18px]">
      <div>
        {eyebrow != null && (
          <div
            className="text-[12px] font-extrabold tracking-[0.1em] uppercase text-orange"
            style={{ marginBottom: 6 }}
          >
            {eyebrow}
          </div>
        )}
        <h2 className="text-[22px]">{title}</h2>
      </div>
      {action}
    </div>
  );
}
