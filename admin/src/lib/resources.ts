import type { FieldDefinition, ResourceDefinition } from "./types";

const field = (
  key: string,
  label: string,
  type: FieldDefinition["type"],
  required = false,
): FieldDefinition => ({ key, label, type, required });

const visibility = [
  field("sortOrder", "Порядок показа", "number"),
  field("active", "Показывать на сайте", "boolean"),
];

export const resources: Record<string, ResourceDefinition> = {
  products: {
    title: "Товары",
    singular: "товар",
    description: "Карточки товаров, фотографии и характеристики",
    icon: "◫",
    fields: [
      field("slug", "Адрес страницы", "text", true),
      field("categoryId", "Категория", "category", true),
      field("title", "Название", "localized", true),
      field("text", "Описание", "localizedText", true),
      field("manufacturer", "Производитель", "localized"),
      field("priceLabel", "Цена или пометка", "localized"),
      field("minimumOrder", "Минимальный заказ", "localized"),
      field("images", "Фотографии", "images", true),
      field("specs", "Характеристики", "specs"),
      field("recommended", "Рекомендуемый товар", "boolean"),
      ...visibility,
    ],
  },
  categories: {
    title: "Категории",
    singular: "категорию",
    description: "Дерево разделов каталога",
    icon: "▧",
    fields: [
      field("slug", "Адрес страницы", "text", true),
      field("parentId", "Родительская категория", "parent"),
      field("title", "Название", "localized", true),
      field("image", "Изображение", "image"),
      ...visibility,
    ],
  },
  catalogs: {
    title: "PDF-каталоги",
    singular: "каталог",
    description: "Файлы каталога для каждого языка",
    icon: "▣",
    fields: [
      field("title", "Название", "localized", true),
      field("pdfTk", "PDF на туркменском", "file"),
      field("pdfRu", "PDF на русском", "file"),
      field("pdfEn", "PDF на английском", "file"),
      field("active", "Показывать на сайте", "boolean"),
    ],
  },
  promos: {
    title: "Промо-блоки",
    singular: "промо-блок",
    description: "Первый экран и рекламные блоки сайта",
    icon: "✧",
    fields: [
      field("title", "Заголовок", "localized", true),
      field("text", "Описание", "localizedText", true),
      field("images", "Изображения", "images", true),
      ...visibility,
    ],
  },
  "about-blocks": {
    title: "Блоки «О нас»",
    singular: "блок",
    description: "Секции страницы о компании",
    icon: "☷",
    fields: [
      field("title", "Заголовок", "localized", true),
      field("lead", "Краткое вступление", "localized"),
      field("text", "Основной текст", "localizedText", true),
      field("image", "Изображение", "image"),
      ...visibility,
    ],
  },
  complexes: {
    title: "Комплексы",
    singular: "комплекс",
    description: "Производственные площадки компании",
    icon: "⌂",
    fields: [
      field("slug", "Адрес страницы", "text", true),
      field("title", "Название", "localized", true),
      field("text", "Описание", "localizedText", true),
      field("image", "Изображение", "image", true),
      field("foundedYear", "Год основания", "number"),
      ...visibility,
    ],
  },
  partners: {
    title: "Партнёры",
    singular: "партнёра",
    description: "Логотипы и ссылки партнёров",
    icon: "♧",
    fields: [
      field("name", "Название", "localized"),
      field("logo", "Логотип", "image", true),
      field("url", "Ссылка на сайт", "url"),
      ...visibility,
    ],
  },
  faqs: {
    title: "Вопросы и ответы",
    singular: "вопрос",
    description: "Ответы на частые вопросы клиентов",
    icon: "?",
    fields: [
      field("question", "Вопрос", "localized", true),
      field("answer", "Ответ", "localizedText", true),
      ...visibility,
    ],
  },
  blog: {
    title: "Блог",
    singular: "статью",
    description: "Новости и полезные материалы",
    icon: "✎",
    fields: [
      field("slug", "Адрес страницы", "text", true),
      field("title", "Заголовок", "localized", true),
      field("text", "Текст статьи", "localizedText", true),
      field("image", "Обложка", "image", true),
      field("publishedAt", "Дата публикации", "date"),
      field("active", "Показывать на сайте", "boolean"),
    ],
  },
};

export const siteSections = {
  about: {
    title: "Страница «О нас»",
    description: "Главный текст о компании",
    fields: [
      field("title", "Заголовок", "localized", true),
      field("text", "Основной текст", "localizedText", true),
    ],
  },
  contact: {
    title: "Контакты",
    description: "Как клиенты могут связаться с компанией",
    fields: [
      field("email", "Электронная почта", "text", true),
      field("phone", "Телефон", "text", true),
      field("whatsapp", "WhatsApp", "text", true),
      field("telegramPhone", "Телефон Telegram", "text"),
      field("address", "Адрес", "localized", true),
      field("logo", "Логотип сайта", "image"),
    ],
  },
};

export const navigation = [
  {
    title: "Обзор",
    entries: [
      ["/", "Главная", "▦"],
      ["/orders", "Заявки", "▤"],
    ],
  },
  {
    title: "Каталог",
    entries: [
      ["/products", "Товары", "◫"],
      ["/categories", "Категории", "▧"],
      ["/catalogs", "PDF-каталоги", "▣"],
    ],
  },
  {
    title: "Сайт",
    entries: [
      ["/promos", "Промо-блоки", "✧"],
      ["/about", "Страница «О нас»", "◎"],
      ["/about-blocks", "Блоки «О нас»", "☷"],
      ["/complexes", "Комплексы", "⌂"],
      ["/partners", "Партнёры", "♧"],
      ["/faqs", "Вопросы и ответы", "?"],
      ["/blog", "Блог", "✎"],
      ["/contact", "Контакты", "☎"],
    ],
  },
  { title: "Аудитория", entries: [["/newsletter", "Подписчики", "✉"]] },
] as const;
