import {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Child routes also light this item up. */
  matchPrefix?: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard },
  {
    href: "/admin/customers",
    label: "ลูกค้า",
    icon: Users,
    matchPrefix: "/admin/customers",
  },
  { href: "/admin/lots", label: "Lot", icon: Package, matchPrefix: "/admin/lots" },
  {
    href: "/admin/settings",
    label: "ตั้งค่า",
    icon: Settings,
    matchPrefix: "/admin/settings",
  },
];

export function isNavItemActive(item: AdminNavItem, pathname: string): boolean {
  if (item.matchPrefix) return pathname.startsWith(item.matchPrefix);
  return pathname === item.href;
}
