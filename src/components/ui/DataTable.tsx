import { type ReactNode, type TableHTMLAttributes } from "react";

// Shared dashboard table styling. Descendant variants style every <th>/<td>
// inside, so call sites write plain <th>/<td> without repeating classes, and
// rows tint on hover automatically.
const TABLE_CLS =
  "w-full border-collapse " +
  "[&_th]:text-left [&_th]:text-xs [&_th]:font-extrabold [&_th]:tracking-wider [&_th]:uppercase [&_th]:text-ink-3 [&_th]:px-4 [&_th]:pt-0 [&_th]:pb-3 " +
  "[&_td]:px-4 [&_td]:py-3.5 [&_td]:border-t [&_td]:border-line [&_td]:text-sm [&_td]:align-middle " +
  "[&_tbody_tr:hover_td]:bg-surface-2";

// A four-to-six column dashboard table cannot honestly fit a phone, so rather
// than let it crush its cells (or push the whole page sideways) every table
// carries its own scroll container and a floor width to scroll within.
const MIN_W = "min-w-[620px]";

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
    <div className="rail">
      <table
        className={
          className
            ? `${TABLE_CLS} ${MIN_W} ${className}`
            : `${TABLE_CLS} ${MIN_W}`
        }
        {...rest}
      >
        <thead>
          <tr>{head}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
