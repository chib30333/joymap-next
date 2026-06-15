"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { Input } from "@/components/ui/Input";
import { pwScore } from "@/lib/auth";

export function Field({
  label,
  icon,
  type = "text",
  value,
  onChange,
  right,
  autoComplete,
  name,
}: {
  label: string;
  icon?: keyof typeof Icons;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  right?: React.ReactNode;
  autoComplete?: string;
  name?: string;
}) {
  const I = icon ? Icons[icon] : null;
  return (
    <label className="block">
      <span className="block text-xs font-bold text-ink-2 mb-2">
        {label}
      </span>
      <span className="relative flex items-center">
        {I && (
          <span className="absolute left-4 text-ink-3 inline-flex pointer-events-none">
            <I size={18} />
          </span>
        )}
        <Input
          type={type}
          value={value}
          name={name}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={`${I ? "pl-11" : "pl-4"} ${
            right ? "pr-11" : "pr-4"
          }`}
        />
        {right}
      </span>
    </label>
  );
}

export function PwField({
  label,
  value,
  onChange,
  name,
  autoComplete,
  meter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  name?: string;
  autoComplete?: string;
  meter?: boolean;
}) {
  const [show, setShow] = useState(false);
  const score = pwScore(value);
  return (
    <div>
      <Field
        label={label}
        icon="lock"
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        name={name}
        autoComplete={autoComplete}
        right={
          <button
            type="button"
            className="absolute right-3 text-xs font-bold text-coral-deep cursor-pointer p-1"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
          >
            {show ? "Hide" : "Show"}
          </button>
        }
      />
      {meter && value.length > 0 && (
        <div className="flex items-center gap-2.5 mt-2">
          <div className="flex-1 h-1 rounded-full bg-line overflow-hidden">
            <span
              className="block h-full rounded-full duration-300 w-[var(--pw-w)] [background:var(--pw-bg)]"
              style={{ "--pw-w": `${score.pct}%`, "--pw-bg": score.color } as React.CSSProperties}
            />
          </div>
          <span
            className="font-bold text-[12px] text-[var(--pw-c)]"
            style={{ "--pw-c": score.color } as React.CSSProperties}
          >
            {score.label}
          </span>
        </div>
      )}
    </div>
  );
}
