# GYM — трекер силових тренувань

Вебзастосунок для ведення тренувань з акцентом на SBD: вправи, підходи, суперсети, дочірні вправи, календар, статистика, профіль (IPF GL), досягнення і рейтинг. Інтерфейс українською.

**English:** Powerlifting-oriented training tracker on **Next.js 16**, **React 19**, **Prisma**, **PostgreSQL**.

---

## Можливості

| Область | Що є |
| --- | --- |
| Тренування | Тренування → вправи → підходи (вага, повтори, RPE, розминка), зміна порядку, дублювання, копіювання текстом |
| Суперсети | Об'єднання сусідніх підходів вправи в один блок, який рахується як один підхід; роз'єднання одним кліком |
| Дочірні вправи | Допоміжна вправа, «приклеєна» до базової (жим/присід/тяга); не враховується в аналітиці |
| Авто-RPE | RPE рахується з ваги/повторів і максимумів профілю для базових вправ (без округлення) |
| Авто-теги | Тег інтенсивності дня: `Важке` / `Середнє` / `Легке`, кольорові бейджі в списку тренувань |
| Шаблони | Шаблони тренувань з вправами, застосування до дня |
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
src/
  app/                      # Next.js: сторінки + api/
  features/                 # Домени: auth, workouts, templates, stats, calendar, profile, dashboard
  shared/                   # lib, ui, shell, filters
prisma/
  schema.prisma
  migrations/
```

Ключове:
- Авторизація: **httpOnly** cookie-сесія (`gym_session`) + таблиця `Session`
- Дані тренувань: `Workout` / `WorkoutExercise` / `ExerciseSet`
- Дочірні вправи: `WorkoutExercise.parentId` (каскадне видалення, поза аналітикою)
- Суперсети: `ExerciseSet.supersetGroup` — підходи з одним id утворюють блок, що рахується як один підхід
- Профіль і прогрес: GL-поля, snapshots максимумів, досягнення, pinned-achievements

---

## База даних

- Міграції застосовуються через `prisma migrate deploy`
- Поточна точність `ExerciseSet.rpe` — `Decimal(6,4)`
- Теги інтенсивності зберігаються в `Workout.autoTag` (`HEAVY` / `MEDIUM` / `LIGHT`)
