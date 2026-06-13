import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { requireAdminSession } from "@/server/auth/admin-auth";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  await requireAdminSession();

  return (
    <div className="min-h-screen bg-[#f7f5fb] text-ink-900 lg:flex">
      <AdminSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1480px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
