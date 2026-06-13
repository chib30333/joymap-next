import { type ReactNode, type TableHTMLAttributes } from "react";

// Shared dashboard table styling. Descendant variants style every <th>/<td>
// inside, so call sites write plain <th>/<td> without repeating classes, and
// rows tint on hover automatically.
const TABLE_CLS =
  "w-full border-collapse " +
  "[&_th]:text-left [&_th]:text-[11.5px] [&_th]:font-extrabold [&_th]:tracking-[0.06em] [&_th]:uppercase [&_th]:text-ink-3 [&_th]:px-4 [&_th]:pt-0 [&_th]:pb-3 " +
  "[&_td]:px-4 [&_td]:py-[14px] [&_td]:border-t [&_td]:border-line [&_td]:text-[14px] [&_td]:align-middle " +
  "[&_tbody_tr:hover_td]:bg-surface-2";

export function DataTable({
  head,
  children,
  className,
  ...rest
}: {
  // The <th> cells for the header row.
  head: ReactNode;
  // The <tr> rows for the body.
  children: ReactNode;
} & TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={className ? `${TABLE_CLS} ${className}` : TABLE_CLS}
      {...rest}
    >
      <thead>
        <tr>{head}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
