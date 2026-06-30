import type { OptionColor, SelectOption } from "@/lib/admin/schemas";

export const OPTION_COLOR_CLASSES: Record<OptionColor, string> = {
  gray: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  yellow: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  orange: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  pink: "bg-pink-500/15 text-pink-300 border-pink-500/30",
};

export function colorForOption(
  options: SelectOption[] | undefined,
  value: string,
): string {
  const match = options?.find((o) => o.value === value);
  return OPTION_COLOR_CLASSES[match?.color ?? "gray"];
}
