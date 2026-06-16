# Архітектура GYM

Проєкт організований як **Next.js App Router** застосунок з **feature folders** і спільним шаром `shared/`. Маршрути залишаються у `src/app/` (вимога Next.js).

## Структура `src/`

```text
src/
├── app/                    # Сторінки та API route handlers (тонкі композиції)
│   ├── (protected)/        # Layout з перевіркою сесії
│   └── api/                # REST endpoints
├── features/               # Домени продукту
│   ├── auth/
│   ├── workouts/
│   ├── templates/
│   ├── stats/
│   ├── calendar/
│   ├── profile/
│   └── dashboard/
├── shared/                 # Крос-доменні речі
│   ├── lib/                # Prisma, auth, дати, rate-limit, sort-order
│   ├── ui/                 # Дизайн-система, діалоги, лоадери
│   ├── shell/              # Nav, провайдери, тема, toast
│   └── filters/            # DateWeightFilters (workouts + stats)
├── server/
│   └── queries/            # Prisma для server pages (dashboard, workouts, stats…)
└── (немає src/components, src/lib — перенесено)
```

У кожній `features/<domain>/`:

- `components/` — React UI цієї області
- `lib/` — чиста логіка, типи, хуки, без JSX (де можливо)

## Правила залежностей

```text
app/  →  features/*  →  shared/*
app/  →  shared/*
features/A  ↛  features/B/components   (уникай циклічних UI-звʼязків)
shared/*  ↛  features/*
```

- **Сторінки** (`app/**/page.tsx`) — server components: `getSessionUser()`, виклик `server/queries/*`, передача даних у client components.
- **API** (`app/api/**`) — тонкі handlers: auth → prisma → domain lib → JSON.
- **Важкі client UI** — `WorkoutSession` (розбито на header/exercise-card/hook), `ProfileClient` (розбито на preview/edit/leaderboard/hook).

## Імпорти

Єдиний alias `@/*` → `src/*`. Приклади:

```ts
import { getSessionUser } from "@/shared/lib/auth";
import { WorkoutSession } from "@/features/workouts/components/WorkoutSession";
import { uiButtonPrimaryClass } from "@/shared/ui/styles";
import { parseStatsFiltersFromSearchParams } from "@/features/stats/lib/stats-filters";
```

Не використовуємо barrel-файли (`index.ts`) — явні шляхи простіші для пошуку та tree-shaking.

## Auth

- Cookie `gym_session` + таблиця `Session`
- Захист маршрутів: `(protected)/layout.tsx` → `getSessionUser()` → `redirect("/")`
- Спільна логіка: `features/auth/server/enter-user.ts`, `session-response.ts`
- **Канонічний UI-вхід:** `POST /api/auth/enter-form` (find-or-create, form + redirect)
- **JSON API:** `POST /api/auth/login` (лише існуючі), `POST /api/auth/register` (лише нові)
- `login-form` / `register-form` — deprecated re-export на `enter-form`

## Дані

| Шар | Відповідальність |
| --- | --- |
| Prisma schema | `prisma/schema.prisma` |
| Інфра БД | `shared/lib/prisma.ts`, `db-errors.ts` |
| Server page queries | `server/queries/*` |
| Домен тренувань | `features/workouts/lib/*` (теги, RPE, списки) |
| Статистика | `features/stats/lib/*` |
| Профіль / GL | `features/profile/lib/*` |

Після змін підходів — `schedule-metrics-refresh.ts` відкладає перерахунок тегів і lift records.

## Тести

- **Unit:** `**/*.test.ts` поруч із модулем у `shared/lib` або `features/*/lib`
- **E2E:** `e2e/` (Playwright)

## Додавання нової фічі

1. Створи `src/features/<name>/components/` та за потреби `lib/`
2. Сторінку — у `src/app/(protected)/<name>/page.tsx`
3. API — у `src/app/api/...`
4. Спільне для кількох доменів — у `shared/`, не копіюй у feature

## Міграція структури

Одноразовий скрипт: `node scripts/refactor-structure.mjs` (вже виконано). Не запускай повторно без потреби.
