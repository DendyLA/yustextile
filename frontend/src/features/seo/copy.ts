import type { Locale } from "../content/types";

const copy = {
  tm: {
    homeTitle: "Yustextile — Türkmenistandan dokma önümleri",
    homeDescription: "Türkmenistandan ýokary hilli dokma önümleri: mata, polotense, düşek örtükleri we beýleki önümler. Lomaý söwda we eksport üçin Yustextile.",
    productsDescription: "Türkmenistandan dokma önümleriniň katalogy. Önümleri we kategoriýalary gözden geçiriň, lomaý sargyt üçin habarlaşyň.",
    aboutDescription: "Yustextile barada maglumat: dokma önümçiligi, hil gözegçiligi we halkara eksport.",
    productionDescription: "Yustextile bilen işleýän Türkmenistanyň dokma önümçilik toplumlary bilen tanyşyň.",
    blogDescription: "Yustextile blogy: dokma önümleri, önümçilik we kompaniýanyň täzelikleri.",
    contactsDescription: "Yustextile bilen habarlaşyň. Telefon, e-poçta we salgymyz.",
  },
  ru: {
    homeTitle: "Yustextile — текстиль из Туркменистана",
    homeDescription: "Текстиль из Туркменистана: ткани, полотенца, постельное бельё и другие изделия. Оптовые поставки и экспорт от Yustextile.",
    productsDescription: "Каталог текстильных товаров из Туркменистана. Выбирайте продукцию и категории для оптового заказа.",
    aboutDescription: "О компании Yustextile: текстильное производство, контроль качества и международный экспорт.",
    productionDescription: "Узнайте о текстильных производственных комплексах Туркменистана, с которыми сотрудничает Yustextile.",
    blogDescription: "Блог Yustextile: материалы о текстиле, производстве и новости компании.",
    contactsDescription: "Контакты Yustextile: телефон, электронная почта, адрес и способы связи.",
  },
  en: {
    homeTitle: "Yustextile — Textiles from Turkmenistan",
    homeDescription: "Textiles from Turkmenistan, including fabrics, towels and bedding. Wholesale supply and export with Yustextile.",
    productsDescription: "Explore textiles from Turkmenistan. Browse products and categories for wholesale orders.",
    aboutDescription: "Learn about Yustextile, textile production, quality control and international export.",
    productionDescription: "Explore the textile production facilities in Turkmenistan working with Yustextile.",
    blogDescription: "Yustextile blog: textile products, production and company news.",
    contactsDescription: "Contact Yustextile by phone or email and find our address.",
  },
} as const;

export function seoCopy(lang: Locale) { return copy[lang]; }
