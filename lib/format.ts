export const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

export const percent = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
