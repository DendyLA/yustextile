import { Locale } from "../content/types";

const labels = {
  ru: { home: "Главная", products: "Товары", about: "О нас", production: "Производство", blog: "Блог", cart: "Корзина", faq: "Вопросы", contacts: "Контакты", partners: "Партнёры", newsletter: "Рассылка", recommended: "Рекомендуемые товары", allProducts: "Все товары", viewAll: "Смотреть все", details: "Подробнее", addToCart: "В корзину", added: "Добавлено", empty: "Пока ничего нет", unavailable: "Не удалось загрузить данные. Попробуйте позже.", category: "Категория", allCategories: "Все категории", search: "Найти", searchProducts: "Поиск товаров", searchResults: "Найдено товаров", noSearchResults: "По вашему запросу товары не найдены", previous: "Назад", next: "Далее", manufacturer: "Производитель", price: "Цена", minimumOrder: "Минимальный заказ", quantity: "Количество", remove: "Удалить", order: "Оформить заказ", name: "Имя", phone: "Телефон", email: "Эл. почта", country: "Страна", address: "Адрес", map: "Как нас найти", openMap: "Открыть карту", comment: "Комментарий", submit: "Отправить заказ", success: "Заказ отправлен. Мы свяжемся с вами.", failure: "Не удалось отправить заказ. Проверьте данные и попробуйте снова.", subscribe: "Подписаться", subscribed: "Подписка оформлена", published: "Опубликовано", founded: "Основан", catalog: "Каталог PDF" },
  en: { home: "Home", products: "Products", about: "About us", production: "Production", blog: "Blog", cart: "Cart", faq: "FAQ", contacts: "Contacts", partners: "Partners", newsletter: "Newsletter", recommended: "Recommended products", allProducts: "All products", viewAll: "View all", details: "Details", addToCart: "Add to cart", added: "Added", empty: "Nothing here yet", unavailable: "Content is unavailable. Please try again later.", category: "Category", allCategories: "All categories", search: "Search", searchProducts: "Search products", searchResults: "Products found", noSearchResults: "No products match your search", previous: "Previous", next: "Next", manufacturer: "Manufacturer", price: "Price", minimumOrder: "Minimum order", quantity: "Quantity", remove: "Remove", order: "Place an order", name: "Name", phone: "Phone", email: "Email", country: "Country", address: "Address", map: "Find us", openMap: "Open map", comment: "Comment", submit: "Send order", success: "Order sent. We will contact you.", failure: "Could not send the order. Check your details and try again.", subscribe: "Subscribe", subscribed: "Subscribed", published: "Published", founded: "Founded", catalog: "Catalog PDF" },
  tm: { home: "Baş sahypa", products: "Önümler", about: "Biz barada", production: "Önümçilik", blog: "Blog", cart: "Sebet", faq: "Soraglar", contacts: "Habarlaşmak", partners: "Hyzmatdaşlar", newsletter: "Täzelikler", recommended: "Maslahat berilýän önümler", allProducts: "Ähli önümler", viewAll: "Hemmesini görmek", details: "Giňişleýin", addToCart: "Sebede goş", added: "Goşuldy", empty: "Häzirlikçe hiç zat ýok", unavailable: "Maglumat ýükläp bolmady. Soňrak synanyşyň.", category: "Kategoriýa", allCategories: "Ähli kategoriýalar", search: "Gözle", searchProducts: "Önümleri gözle", searchResults: "Tapylan önümler", noSearchResults: "Gözlegiňize laýyk önüm tapylmady", previous: "Yza", next: "Indiki", manufacturer: "Öndüriji", price: "Bahasy", minimumOrder: "Iň az sargyt", quantity: "Mukdar", remove: "Aýyr", order: "Sargyt etmek", name: "Ady", phone: "Telefon", email: "E-poçta", country: "Ýurt", address: "Salgy", map: "Bizi nireden tapmaly", openMap: "Kartany aç", comment: "Teswir", submit: "Sargydy iber", success: "Sargyt iberildi. Siziň bilen habarlaşarys.", failure: "Sargyt iberilmedi. Maglumatlary barlap gaýtadan synanyşyň.", subscribe: "Ýazylmak", subscribed: "Ýazyldy", published: "Çap edildi", founded: "Döredildi", catalog: "PDF katalog" },
} as const;

export function ui(lang: Locale) { return labels[lang]; }
export function isLocale(value: string): value is Locale { return value === "tm" || value === "ru" || value === "en"; }
export function closeLabel(lang: Locale) { return { tm: "Ýap", ru: "Закрыть", en: "Close" }[lang]; }

export function checkoutValidation(lang: Locale) {
  return {
    ru: { phone: "Введите корректный номер для выбранной страны.", email: "Введите корректный email, например name@example.com." },
    en: { phone: "Enter a valid number for the selected country.", email: "Enter a valid email, for example name@example.com." },
    tm: { phone: "Saýlanan ýurt üçin dogry telefon belgisini giriziň.", email: "Dogry e-poçta salgysyny giriziň, meselem name@example.com." },
  }[lang];
}

export function countrySelectLabels(lang: Locale) {
  return {
    ru: { search: "Найти страну", choose: "Открыть список стран", noResults: "Страна не найдена", required: "Выберите страну из списка." },
    en: { search: "Search countries", choose: "Open country list", noResults: "No country found", required: "Choose a country from the list." },
    tm: { search: "Ýurdy gözläň", choose: "Ýurtlaryň sanawyny aç", noResults: "Ýurt tapylmady", required: "Sanawdan ýurt saýlaň." },
  }[lang];
}

export function galleryLabels(lang: Locale) {
  return {
    ru: { photos: "Фотографии товара", open: "Открыть фото на весь экран", zoomIn: "Увеличить фото", zoomOut: "Уменьшить фото", noPhotos: "Фотографий пока нет" },
    en: { photos: "Product photos", open: "Open photo full screen", zoomIn: "Zoom in", zoomOut: "Zoom out", noPhotos: "No photos yet" },
    tm: { photos: "Önümiň suratlary", open: "Suraty doly ekranda aç", zoomIn: "Suraty ulalt", zoomOut: "Suraty kiçelt", noPhotos: "Häzirlikçe surat ýok" },
  }[lang];
}
