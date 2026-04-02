/** Логічне «назад» у межах застосунку (без системної кнопки). */
export function getBackInfo(pathname: string): { href: string; label: string } | null {
  if (pathname === "/dashboard") return null;
  if (pathname === "/templates") return { href: "/dashboard", label: "На головну" };
  if (pathname === "/templates/new") return { href: "/templates", label: "До шаблонів" };
  if (pathname.startsWith("/templates/")) return { href: "/templates", label: "До шаблонів" };
  if (pathname === "/workouts/new") return { href: "/dashboard", label: "На головну" };
  if (pathname.startsWith("/workouts/")) return { href: "/dashboard", label: "На головну" };
  if (pathname === "/stats") return { href: "/dashboard", label: "На головну" };
  return { href: "/dashboard", label: "На головну" };
}

export function getPageContext(pathname: string): string {
  if (pathname === "/dashboard") return "";
  if (pathname === "/templates") return "Шаблони тренувань";
  if (pathname === "/templates/new") return "Новий шаблон";
  if (pathname.startsWith("/templates/")) return "Редагування шаблону";
  if (pathname === "/workouts/new") return "Нове тренування";
  if (pathname.startsWith("/workouts/")) return "Тренування";
  if (pathname === "/stats") return "Статистика";
  return "";
}
