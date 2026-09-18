# NutriFlow Admin

Веб-админка для NUTRIFLOW_BACKEND: управление ингредиентами, рецептами и тегами.
Стек и структура — по образцу `ArtCRM_FRONT` (Vue 3 + Vite + Ant Design Vue + Pinia + axios).

## Стек

- **Vue 3** + **Vite**
- **Ant Design Vue 4** — UI-компоненты (тема: `colorPrimary: '#4CAF50'`, см. `src/App.vue`)
- **Pinia** — только `stores/auth.js` (сессия/пользователь); CRUD-страницы ходят в API напрямую через `services/api.js`, без отдельных сторов на каждую сущность — сущностей мало, и не гоняются между разными компонентами
- **axios** — `services/api.js`, токен подставляется interceptor'ом из `services/auth.js` (localStorage), 401 сбрасывает сессию и уводит на `/auth`
- **vue-router** — гард в `router/index.js` требует сессию для всех роутов, кроме `/auth`

## Структура

```
src/
├── services/
│   ├── api.js         # axios-инстанс, auth-заголовок, обработка 401
│   ├── auth.js         # localStorage-кэш user/session (низкоуровневый)
│   ├── const.js        # ROLES, TAG_TYPES — совпадают с бэкендом
│   ├── notify.js        # уведомления + маппинг серверных ошибок на русский
│   └── nutrients.js      # список нутриентных полей ингредиента (зеркало бэкенда)
├── stores/auth.js       # Pinia: login/logout, гидратируется из localStorage при старте
├── layouts/
│   ├── Empty.vue         # для /auth
│   └── Home.vue          # сайдбар + шапка, для остальных страниц
├── pages/
│   ├── Auth/index.vue
│   ├── Ingredients/{index,Edit}.vue
│   ├── Recipes/{index,Edit}.vue      # состав рецепта + теги + КБЖУ на порцию
│   └── Tags/{index,Edit}.vue
└── router/index.js
```

## Как создать новое приложение из этого шаблона

Смотрите README `NUTRIFLOW_BACKEND` — бэкендовые модели/сервисы уже готовы под
ingredient/recipe/tag/dictionary_update; здесь просто добавляйте страницы под
новые роуты по образцу существующих `pages/*`.

## Запуск

1. `cp .env.example .env` (или используйте `.env.development` — уже указывает на `http://localhost:3000`)
2. `npm install`
3. Поднять `NUTRIFLOW_BACKEND` (см. его README) — как минимум одному пользователю
   нужно выставить `role = 'admin'` в `my_user`, иначе создание/редактирование
   сущностей будет получать 403 (чтение доступно любому авторизованному пользователю)
4. `npm run dev`
