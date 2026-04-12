# GYM — журнал силових тренувань

Вебзастосунок для запису тренувань (SBD та інші вправи), шаблонів, календаря, статистики (RPE, відвідуваність, динаміка максимумів з профілю), профілю з IPF Goodlift, досягнень і рейтингу атлетів. Інтерфейс українською.

**English:** Powerlifting-oriented workout tracker on **Next.js 16** (App Router), **React 19**, **Prisma**, **PostgreSQL**. Авторизація через сесійний cookie, без OAuth.

---

## Зміст

- [Можливості](#можливості)
- [Стек](#стек)
- [Вимоги](#вимоги)
- [Швидкий старт](#швидкий-старт)
- [Змінні середовища](#змінні-середовища)
- [Скрипти](#скрипти)
- [Архітектура](#архітектура)
- [Як це працює](#як-це-працює)
- [База даних](#база-даних)

---

## Можливості

| Область      | Що є                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Облік       | Тренування → вправи → підходи (вага, повтори, RPE, розминка), drag-and-drop; кнопка **копіювання тренування текстом** у буфер (форматований текст) |
| Список       | Пошук за назвою тренування або вправи (`q`), діапазон дат і вага — з форми (URL оновлюється після «Застосувати»)                           |
| Онбординг    | Після входу на дашборді чекліст: профіль → перше тренування → статистика (закриття в `localStorage`)                                      |
| Шаблони      | Збережені плани залу, створення / редагування                                                                                                |
| Календар     | Дні з тренуваннями, перехід до запису за датою                                                                                              |
| Статистика   | Фільтри дат/ваги, streak, порівняння тижнів, графіки Recharts (lazy)                                                                        |
| RPE          | З журналу або оцінка з **максимумів у профілі** + ваги підходу                                                                              |
| Максимуми    | Історія змін у `ProfileSbdMaxSnapshot` → графік суми SBD на статистиці                                                                       |
| Профіль      | Аватар (пресети), позивний, тіло/макс SBD, IPF GL, зміна логіну; **досягнення** та до трьох **закріплених** для картки профілю й таблиці рейтингу |
| Рейтинг      | Лідерборд за total / bench / squat / deadlift; колонка досягнень перед рівнем GL                                                            |

---

## Стек

- **Next.js** 16.2 (Turbopack), App Router, Server Components + Route Handlers
- **React** 19.2, **TypeScript**
- **Prisma** 6 + **PostgreSQL**
- **Tailwind CSS** v4
- **Recharts** (динамічний імпорт, `optimizePackageImports`)
- **Vitest**, **Playwright** (e2e)

---

## Вимоги

- Node.js **20+**
- PostgreSQL (Neon, Supabase або локально)

---

## Швидкий старт

```bash
git clone <repo-url> && cd GYM
cp .env.example .env
```

У `.env` вкажи `DATABASE_URL` (PostgreSQL connection string).

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Відкрий [http://localhost:3000](http://localhost:3000) — реєстрація / вхід за логіном (сесія в cookie `gym_session`).

Продакшен:

```bash
npm run build
npm start
```

---

## Змінні середовища

| Змінна                | Опис                                                                          |
| --------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`        | Обовʼязково. PostgreSQL для Prisma.                                          |
| `ALLOWED_DEV_ORIGINS` | Опційно (dev). Через кому: дозволені origins для HMR з інших хостів у мережі.   |
| `VERCEL_URL`          | Зазвичай підставляється на Vercel для редіректів.                             |

Детальніше — у `.env.example`, якщо є в репозиторії.

---

## Скрипти

| Команда                | Дія                                                  |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Dev-сервер (`0.0.0.0` для доступу з телефона в LAN). |
| `npm run build`        | `prisma generate` + `migrate deploy` + `next build`.  |
| `npm run start`        | Продакшен-сервер після `build`.                       |
| `npm run lint`         | ESLint.                                              |
| `npm run format`       | Prettier — запис у файли.                             |
| `npm run format:check` | Prettier без запису (CI).                             |
| `npm test`             | Vitest.                                              |
| `npm run test:e2e`     | Playwright.                                          |

---

## Архітектура

```
src/app/                    # App Router: сторінки, layout, API route.ts
  (protected)/              # Залогінена зона: dashboard, workouts, stats, profile, …
  api/                      # Route Handlers (JSON / plain text)
src/components/             # Клієнтські та нейтральні UI-компоненти
src/lib/                    # Prisma client, auth, фільтри, GL, тижні, RPE, досягнення
prisma/
  schema.prisma
  migrations/
```

- **Авторизація:** `src/lib/auth.ts` — cookie → хеш у `Session` → `User`.
- **API:** зміни даних через `fetch` на `src/app/api/**/route.ts`.
- **Захищені сторінки:** `getSessionUser()` у server component; редірект на `/`, якщо немає сесії.
- **Rate limiting:** `src/lib/rate-limit.ts` — обмеження за IP на `/api/auth/*`, важкі POST (тренування, дублікат, `PATCH /api/profile`). При перевищенні — **429** або редірект з `?err=` для HTML-форм. Лічильники **в пам’яті процесу**; на кількох інстансах для жорсткого глобального ліміту потрібен зовнішній store (Redis тощо).

---

## Як це працює

### Тренування та підходи

- Сторінка сесії (`WorkoutSession`) завантажує тренування з API, локально оновлює стан, зберігає підходи PATCH на `/api/sets/[id]`.
- **Копіювання текстом:** клієнт робить `GET /api/workouts/[id]/share-text` (лише для власника, авторизований), отримує `text/plain`, копіює в буфер. Окремого завантаження файлу немає.
- Базовий рух вправи (`BaseLift`) використовується для статистики SBD / RPE.

### Список тренувань (`/workouts`)

- Фільтри в UI: після «Застосувати» в URL — `from`, `to`, `wMin`, `wMax`, **`q`**, плюс `page` / `pageSize`.
- Умови відбору: `src/lib/workout-list-where.ts`, парсинг query: `src/lib/stats-filters.ts`.

### Статистика

- Тренування за діапазоном дат; вага (`wMin`, `wMax`) фільтрує підходи для **середнього RPE**.
- **Відвідуваність** і **сума максимумів з профілю** не залежать від фільтра ваги.
- Графік суми SBD з `ProfileSbdMaxSnapshot`.

### IPF Goodlift

- Розрахунок у `src/lib/ipf-gl.ts`, превʼю на профілі; рівень профілю та рейтинг узгоджені з GL-полями.

### Досягнення та рейтинг

- Розблокування за правилами в `src/lib/achievements.ts`, синхронізація в БД, оголошення нових через `AchievementAnnounceClient`.
- Закріплення до трьох ідентифікаторів у профілі; колонка «Досягнення» в таблиці рейтингу (`/api/leaderboard`).

### Мобільна навігація

- Нижня панель (`MobileBottomNav`); шапка — аватар, шаблони, тема, вихід.

### Онбординг

- Дашборд: `OnboardingChecklist` + `StatsOnboardingMark` і `localStorage`.

---

## База даних

- Схема в `prisma/schema.prisma`.
- Розробка: `prisma migrate dev`; прод: `prisma migrate deploy`.
- `binaryTargets` у `generator` для Linux (наприклад Vercel + OpenSSL 3).

---
