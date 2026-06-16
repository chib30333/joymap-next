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
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        {eyebrow != null && (
          <div className="text-xs font-extrabold tracking-widest uppercase text-orange mb-1.5">
            {eyebrow}
          </div>
        )}
        <h2 className="text-xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
