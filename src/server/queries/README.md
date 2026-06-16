# Server queries

Prisma-запити для server components. Тільки server-side — не імпортувати з client components.

| Модуль | Сторінка |
| --- | --- |
| `dashboard.ts` | `/dashboard` |
| `workouts-list.ts` | `/workouts` |
| `stats.ts` | `/stats` |
| `calendar.ts` | `/calendar` |
| `templates.ts` | `/templates`, `/workouts/new` |

API routes залишаються в `src/app/api/`; при потребі спільну логіку виносити в `features/*/lib` або сюди.
