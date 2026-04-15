# GYM — трекер силових тренувань

Вебзастосунок для ведення тренувань з акцентом на SBD: вправи, підходи, календар, статистика, профіль (IPF GL), досягнення і рейтинг. Інтерфейс українською.

**English:** Powerlifting-oriented training tracker on **Next.js 16**, **React 19**, **Prisma**, **PostgreSQL**.

---

## Можливості

| Область | Що є |
| --- | --- |
| Тренування | Тренування → вправи → підходи (вага, повтори, RPE, розминка), reorder, дублювання, копіювання текстом |
| Авто-RPE | RPE рахується з ваги/повторів і максимумів профілю для базових вправ (без округлення) |
| Авто-теги | Тег інтенсивності дня: `Важке` / `Середнє` / `Легке`, кольорові бейджі в списку тренувань |
| Календар | Дні з тренуваннями + колір інтенсивності дня; клік веде до тренування за датою |
| Статистика | Фільтри дат/ваги, streak, порівняння **цей місяць vs попередній**, графіки (attendance, SBD total, RPE) |
| Профіль | Аватар, позивний, GL-поля, зміна логіну, досягнення, pinned-achievements |
| Рейтинг | Лідерборд за GL (total/bench), досягнення і рівень |
| Онбординг | Дашборд-чекліст і підказки першого запуску |

---

## Поточні правила тегів

- `Важке`: якщо є хоча б один робочий сет базової вправи з `RPE > 8.5`
- `Середнє`: якщо важкий сет відсутній і `avg RPE >= 7.3`
- `Легке`: якщо важкий сет відсутній і `avg RPE < 7.3`

Для дня з кількома тренуваннями в календарі показується найінтенсивніший тег дня.

---

## Стек

- **Next.js** 16.2 (App Router, Turbopack)
- **React** 19.2 + **TypeScript**
- **Prisma** 6 + **PostgreSQL**
- **Tailwind CSS** v4
- **Recharts**
- **Vitest**, **Playwright**

---

## Вимоги

- Node.js **20+**
- PostgreSQL (Neon / Supabase / local)

---

## Швидкий старт

```bash
git clone <repo-url>
cd GYM
cp .env.example .env
```

У `.env` задай `DATABASE_URL`.

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Відкрий [http://localhost:3000](http://localhost:3000).

---

## Змінні середовища

| Змінна | Опис |
| --- | --- |
| `DATABASE_URL` | Обовʼязково. PostgreSQL URL |
| `ALLOWED_DEV_ORIGINS` | Опційно для dev/HMR у локальній мережі |
| `VERCEL_URL` | Опційно, для коректних редіректів у deploy |

---

## Скрипти

| Команда | Що робить |
| --- | --- |
| `npm run dev` | dev-сервер |
| `npm run build` | `prisma generate` + `migrate deploy` + `next build` |
| `npm run start` | старт production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (write) |
| `npm run format:check` | Prettier check |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright |

---

## Архітектура

```text
src/app/
  (protected)/              # захищені сторінки: dashboard/workouts/stats/calendar/profile/templates
  api/                      # route handlers
src/components/             # UI-компоненти
src/lib/                    # бізнес-логіка, auth, RPE, теги, фільтри, GL
prisma/
  schema.prisma
  migrations/
```

Ключове:
- Авторизація: cookie-сесія (`gym_session`) + таблиця `Session`
- Дані тренувань: `Workout` / `WorkoutExercise` / `ExerciseSet`
- Профіль і прогрес: GL-поля, snapshots максимумів, досягнення, pinned-achievements

---

## База даних

- Міграції застосовуються через `prisma migrate deploy`
- Поточна точність `ExerciseSet.rpe` — `Decimal(6,4)`
- Теги інтенсивності зберігаються в `Workout.autoTag` (`HEAVY` / `MEDIUM` / `LIGHT`)

