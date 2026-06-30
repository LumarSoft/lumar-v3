import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Receipt,
  CalendarClock,
  CalendarDays,
  Activity,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/tareas", label: "Tareas", icon: KanbanSquare },
  { href: "/admin/cobros", label: "Cobros", icon: Receipt },
  { href: "/admin/vencimientos", label: "Vencimientos", icon: CalendarClock },
  { href: "/admin/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/admin/actividad", label: "Actividad", icon: Activity },
  { href: "/admin/datos", label: "Datos relevantes", icon: KeyRound },
];
