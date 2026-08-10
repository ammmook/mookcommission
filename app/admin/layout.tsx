import { AdminDataProvider } from "@/lib/store/admin-store";

/**
 * Holds the in-memory admin state so edits made on one screen (moving a
 * customer between lots, closing a lot) are visible on the others.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminDataProvider>{children}</AdminDataProvider>;
}
