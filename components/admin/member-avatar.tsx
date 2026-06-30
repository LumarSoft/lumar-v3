import { cn } from "@/lib/utils";
import { OPTION_COLOR_CLASSES } from "@/lib/admin/colors";
import { memberByName } from "@/lib/admin/members";

export function MemberAvatar({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const member = memberByName(name);
  if (!member) {
    return (
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full border border-dashed border-border text-[10px] text-muted-foreground",
          className,
        )}
        title="Sin asignar"
      >
        ?
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-full border text-[10px] font-medium",
        OPTION_COLOR_CLASSES[member.color],
        className,
      )}
      title={member.name}
    >
      {member.initials}
    </span>
  );
}
