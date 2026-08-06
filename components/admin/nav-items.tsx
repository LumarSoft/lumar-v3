import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Receipt,
  FileText,
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

export interface NavGroup {
  /** Título de la sección. null = ítems sueltos arriba de todo. */
  title: string | null;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: null,
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operación",
    items: [
      { href: "/admin/clientes", label: "Clientes", icon: Users },
      { href: "/admin/tareas", label: "Tareas", icon: KanbanSquare },
      { href: "/admin/calendario", label: "Calendario", icon: CalendarDays },
      { href: "/admin/actividad", label: "Actividad", icon: Activity },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { href: "/admin/cobros", label: "Cobros", icon: Receipt },
      { href: "/admin/facturas", label: "Facturas", icon: FileText },
      {
        href: "/admin/vencimientos",
        label: "Vencimientos",
        icon: CalendarClock,
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/admin/datos", label: "Datos relevantes", icon: KeyRound },
    ],
  },
];

/** Lista plana (por si algún consumidor necesita recorrer todos los ítems). */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
