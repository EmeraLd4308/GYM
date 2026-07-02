export function getBackInfo(pathname: string): { href: string; label: string } | null {
  if (pathname === "/dashboard") return null;
  if (pathname === "/templates") return null;
  if (pathname === "/templates/new") return { href: "/templates", label: "До шаблонів" };
  if (pathname.startsWith("/templates/")) return { href: "/templates", label: "До шаблонів" };
  if (pathname === "/workouts") return null;
  if (pathname === "/workouts/new") return { href: "/workouts", label: "До списку" };
  if (pathname.startsWith("/workouts/")) return { href: "/workouts", label: "До списку" };
  if (pathname === "/stats") return null;
  if (pathname === "/calendar") return null;
  if (pathname === "/profile") return null;
  return null;
}

export function getPageContext(pathname: string): string {
  if (pathname === "/dashboard") return "";
  if (pathname === "/calendar") return "";
  if (pathname === "/templates") return "";
  if (pathname === "/workouts") return "";
  if (pathname === "/stats") return "";
  if (pathname === "/profile") return "";
  if (pathname === "/templates/new") return "Новий шаблон";
  if (pathname.startsWith("/templates/")) return "";
  if (pathname === "/workouts/new") return "Нове тренування";
  if (/^\/workouts\/[^/]+$/.test(pathname)) return "";
  return "";
}
