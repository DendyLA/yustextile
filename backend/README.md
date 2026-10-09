# Yus Textile API

NestJS + PostgreSQL + Prisma. Все переводимые поля — объект с обязательными `tk`, `ru`, `en`. Без `?lang=` API отдаёт все переводы; с `?lang=ru` — строки выбранного языка. Slug стабилен и не зависит от языка.

## Структура

- `src/modules/content` — промо, каталоги, категории, товары, блоки «О нас», партнёры, комплексы, FAQ и блог: маршруты, сервис и схемы содержимого.
- `src/modules/site` — основной текст «О нас» и контакты компании.
- `src/modules/orders` — заявки и позиции заказа.
- `src/modules/newsletter` — подписчики рассылки.
- `src/modules/auth` — вход и защита админских маршрутов.
- `src/modules/uploads` — загрузка и раздача файлов.
- `src/common` — общая валидация и многоязычные ответы; `src/database` — подключение Prisma.
- `prisma` — схема PostgreSQL и миграции; `test` — проверки API-логики; `scripts` — диагностические команды.

## Запуск

Для локального запуска через Docker в этой папке:

```powershell
Copy-Item .env.example .env
# Укажите реальные ADMIN_API_KEY, ADMIN_EMAIL и ADMIN_PASSWORD в .env
docker compose up -d --build
```

Compose запускает NestJS на `http://localhost:4000` и PostgreSQL на локальном порту `5433`. API применяет ожидающие миграции при старте. Данные базы и загруженные файлы сохраняются в отдельных Docker volumes.

Для запуска NestJS прямо на компьютере требуются Node.js 20+, pnpm и доступная PostgreSQL. На этой Windows-машине Docker Desktop открывает порт базы через IPv6, поэтому в локальном `.env` используется `[::1]:5433`.

```powershell
pnpm install
pnpm db:generate
pnpm db:deploy
pnpm dev
```

API слушает порт 4000. Для админки: `POST /api/admin/login` с `{"email":"...","password":"..."}` из `.env`; ответ содержит `accessToken`, который передаётся как `Authorization: Bearer <accessToken>` и действует 8 часов. Для серверных скриптов также поддерживается `x-admin-key: <ADMIN_API_KEY>`. Ключ нельзя помещать в публичный браузерный код.

## Маршруты

| Раздел | Публичное чтение | Запись с токеном администратора или `x-admin-key` |
| --- | --- | --- |
| Промо | `GET /api/promos` | `POST /api/promos`, `PATCH/DELETE /api/promos/:id` |
| PDF каталоги | `GET /api/catalogs` | `POST /api/catalogs`, `PATCH/DELETE /api/catalogs/:id` |
| Категории | `GET /api/categories`, `GET /api/categories/tree`, `GET /api/categories/:slug` | `POST /api/categories`, `PATCH/DELETE /api/categories/:id` |
| Товары | `GET /api/products`, `GET /api/products/:slug` | `POST /api/products`, `PATCH/DELETE /api/products/:id` |
| Блоки «О нас» | `GET /api/about-blocks` | `POST /api/about-blocks`, `PATCH/DELETE /api/about-blocks/:id` |
| Партнёры | `GET /api/partners` | `POST /api/partners`, `PATCH/DELETE /api/partners/:id` |
| Производственные комплексы | `GET /api/complexes`, `GET /api/complexes/:slug` | `POST /api/complexes`, `PATCH/DELETE /api/complexes/:id` |
| FAQ | `GET /api/faqs` | `POST /api/faqs`, `PATCH/DELETE /api/faqs/:id` |
| Блог | `GET /api/blog`, `GET /api/blog/:slug` | `POST /api/blog`, `PATCH/DELETE /api/blog/:id` |
| Текст страницы «О нас» | `GET /api/site/about` | `PATCH /api/site/about` |
| Контакты | `GET /api/site/contact` | `PATCH /api/site/contact` |
| Заказы | `POST /api/orders` | `GET /api/orders`, `GET /api/orders/:id`, `PATCH /api/orders/:id/status` |
| Рассылка | `POST /api/newsletter` | `GET /api/admin/newsletter` |
| Файлы | `GET /uploads/:filename` | `POST /api/admin/uploads` (`multipart/form-data`, поле `file`) |

Списки поддерживают `page` и `limit` (до 100). Скрытые записи не попадают в публичное чтение. Для их просмотра администратором есть `GET /api/admin/content/:resource`, `GET /api/admin/content/:resource/:idOrSlug` и `GET /api/admin/categories/tree`.

`GET /api/products?categoryId=<uuid>` или `?categorySlug=postelnoe-bele` фильтрует товары по категории и всем её потомкам, `?recommended=true` — рекомендуемые товары. Категории образуют дерево через `parentId`, глубина не ограничена. `GET /api/categories/tree` включает `directProductCount` и `productCount` с учётом потомков. Так можно показать количество рядом с основной категорией, как на примере.

## Примеры тела запроса

Создание конечной категории (для главной категории `parentId` пропустить):

```json
{
  "slug": "pododeyalniki",
  "parentId": "UUID_родительской_категории",
  "title": { "tk": "Ýorgan örtükleri", "ru": "Пододеяльники", "en": "Duvet covers" },
  "sortOrder": 2
}
```

Создание товара (текст, характеристики и метаданные карточки разделены):

```json
{
  "slug": "bannyy-halat",
  "categoryId": "UUID_конечной_категории",
  "title": { "tk": "Hammam halady", "ru": "Банный халат", "en": "Bathrobe" },
  "text": { "tk": "Doly beýany", "ru": "Подробное описание", "en": "Detailed description" },
  "manufacturer": { "tk": "Aşgabat dokma toplumy", "ru": "Ашхабадский текстильный комплекс", "en": "Ashgabat Textile Complex" },
  "priceLabel": { "tk": "Isleg boýunça", "ru": "По запросу", "en": "On request" },
  "minimumOrder": { "tk": "Bir ýük ulagyndan", "ru": "От одной фуры", "en": "From one truckload" },
  "images": ["/uploads/example.jpg"],
  "recommended": true,
  "specs": [
    {
      "name": { "tk": "Hil standarty", "ru": "Стандарт качества", "en": "Quality standard" },
      "value": { "tk": "Zawodlaryň hil şahadatnamalary", "ru": "Сертификаты качества от фабрик", "en": "Factory quality certificates" }
    }
  ]
}
```

Заказ:

```json
{
  "phone": "+99360000000",
  "email": "customer@example.com",
  "country": "Turkmenistan",
  "address": "Ashgabat",
  "items": [{ "productId": "UUID_товара", "quantity": 1 }]
}
```

PDF каталога задаётся в `pdfTk`, `pdfRu`, `pdfEn` отдельно. Фото и PDF сначала загружаются через `/api/admin/uploads`; ответ содержит URL для записи в контент. Локальное хранилище `uploads/` следует перенести на постоянный диск при развёртывании или заменить объектным хранилищем.

Контакты компании включают `email`, `phone`, `whatsapp`, `telegramPhone`, переводимый `address` и `logo`. `telegramPhone` можно оставить пустым, пока номер Telegram не указан.

Для отправки заявки в WhatsApp фронтенд может построить ссылку из `whatsapp` контактов компании и номера заказа. Сам API хранит заказ и его позиции; автоматическую отправку в WhatsApp он пока не выполняет.
