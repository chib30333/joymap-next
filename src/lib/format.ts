export function money(n: number) {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + "\u00A0₽";
}

export function nowLabel() {
  const t = new Date();
  return (
    t.getHours().toString().padStart(2, "0") +
    ":" +
    t.getMinutes().toString().padStart(2, "0")
  );
}

export function bookingCode() {
  return "JM-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}
