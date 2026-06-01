// Admin landing page. Lives inside app/admin/layout.tsx, so it is only
// reachable by authenticated ADMIN users. Product and order management pages
// (issues 006/007) will be added under /admin and linked from here.
export default function AdminHome() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-2 text-muted-foreground">
        Management panel. Product and order management arrive in later slices.
      </p>
    </main>
  );
}
