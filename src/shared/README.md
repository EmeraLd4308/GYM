# Shared

Код, який використовується кількома features.

| Папка | Зміст |
| --- | --- |
| `lib/` | Prisma, auth, сесія, дати, rate-limit, sort-order |
| `ui/` | `styles.ts`, ConfirmDialog, EmptyState, лоадери |
| `shell/` | Nav, Providers, Theme, Toast |
| `filters/` | DateWeightFilters (workouts + stats) |

Не імпортуй сюди нічого з `features/`.
