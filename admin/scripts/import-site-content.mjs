/**
 * One-time, repeatable import from the older YUS Textile website.
 * Preview: node scripts/import-site-content.mjs --source <site-directory>
 * Apply:   node --env-file=../backend/.env scripts/import-site-content.mjs --source <site-directory> --apply
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { basename, dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const adminDir = resolve(scriptDir, "..");
const manifestPath = join(scriptDir, ".import-manifest.json");
const sourceArg = process.argv.indexOf("--source");
const sourceDir =
  sourceArg >= 0 ? resolve(process.argv[sourceArg + 1] || "") : "";
const apply = process.argv.includes("--apply");
const apiOrigin = process.env.API_ORIGIN || "http://127.0.0.1:4000";
const languageFiles = { tk: "tm", ru: "ru", en: "en" };
const langs = ["tk", "ru", "en"];

if (!sourceDir) {
  throw new Error("Укажите путь к старому сайту после --source.");
}

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const content = {};
const common = {};

for (const [lang, folder] of Object.entries(languageFiles)) {
  content[lang] = await readJson(
    join(sourceDir, "src", "locales", folder, "content.json"),
  );
  common[lang] = await readJson(
    join(sourceDir, "src", "locales", folder, "common.json"),
  );
}

const localized = (getValue) => {
  const result = Object.fromEntries(
    langs.map((lang) => [lang, String(getValue(lang) ?? "").trim()]),
  );
  if (Object.values(result).some((value) => !value)) {
    throw new Error(`Неполный перевод: ${JSON.stringify(result)}`);
  }
  return result;
};

const asset = (relativePath) => {
  const clean = relativePath.replace(/^\/+/, "");
  const absolute = resolve(sourceDir, "public", clean);
  if (!absolute.startsWith(resolve(sourceDir, "public") + sep)) {
    throw new Error(`Файл вне public: ${relativePath}`);
  }
  return absolute;
};

const slugOf = (path) =>
  basename(path, extname(path))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const productMaps = Object.fromEntries(
  langs.map((lang) => [
    lang,
    new Map(
      content[lang].categories.flatMap((category) =>
        category.products.map((item) => [item.image, item]),
      ),
    ),
  ]),
);

const omittedProducts = [];
const products = [];

for (const [categoryIndex, category] of content.ru.categories.entries()) {
  for (const [position, ruProduct] of category.products.entries()) {
    const image = ruProduct.image;
    const translated = Object.fromEntries(
      langs.map((lang) => [lang, productMaps[lang].get(image)]),
    );
    if (langs.some((lang) => !translated[lang])) {
      omittedProducts.push(image);
      continue;
    }

    products.push({
      slug: slugOf(image),
      categoryIndex,
      title: localized((lang) => translated[lang].title),
      text: localized((lang) => translated[lang].description),
      manufacturer: localized((lang) =>
        lang === "ru" &&
        !translated.ru.manufacturer &&
        image.includes("turkmenbashi-denim")
          ? content.ru.facilities[5].title
          : translated[lang].manufacturer,
      ),
      priceLabel: localized((lang) => translated[lang].price),
      minimumOrder: localized((lang) => translated[lang].minOrderQty),
      image,
      recommended: false,
      sortOrder: position,
      active: true,
      specs: ruProduct.specs.map((_, index) => ({
        name: localized((lang) => translated[lang].specs[index]?.title),
        value: localized((lang) => translated[lang].specs[index]?.value),
        sortOrder: index,
      })),
    });
  }
}

const categories = content.ru.categories.map((category, index) => ({
  slug: ["bed-sheets", "bathrobes", "towels", "yarn", "fabrics"][index],
  title: localized((lang) => {
    if (index === 3 && lang === "ru") return "Пряжа"; // The source category says "Пряжки".
    if (index === 3 && lang === "tk") return "Ýüplük"; // Product titles use the yarn meaning.
    return content[lang].categories[index].title;
  }),
  image: products.find((product) => product.categoryIndex === index)?.image,
  sortOrder: index,
  active: true,
  parentId: null,
}));

const promos = content.ru.sliders.map((slide, index) => ({
  title: localized((lang) => content[lang].sliders[index].title),
  text: localized((lang) => content[lang].sliders[index].description),
  image: slide.image,
  sortOrder: index,
  active: true,
}));

const complexes = content.ru.facilities.map((facility, index) => ({
  slug: slugOf(facility.image),
  title: localized((lang) => content[lang].facilities[index].title),
  text: localized((lang) => content[lang].facilities[index].description),
  image: facility.image,
  foundedYear:
    index === 2
      ? null // RU says 2007; TM and EN say 2010.
      : Number(facility.foundatedAt.match(/(?:19|20)\d{2}/)?.[0]) || null,
  sortOrder: index,
  active: true,
}));

const faqs = content.ru.faqs.map((_, index) => ({
  question: localized((lang) => content[lang].faqs[index].question),
  answer: localized((lang) => {
    if (index === 8 && lang === "en") {
      return "Depending on the product, we offer bags, packages, or pallet packaging.";
    }
    if (index === 5 && lang === "tk") {
      return "Iň az sargyt möçberi bir doly ýük ulagyndan başlanýar.";
    }
    return content[lang].faqs[index].answer;
  }),
  sortOrder: index,
  active: true,
}));

const aboutBlocks = [
  ...common.ru.homePage.aboutUsSection.featureCards.map((card, index) => ({
    title: localized(
      (lang) => common[lang].homePage.aboutUsSection.featureCards[index].title,
    ),
    lead: localized(
      (lang) =>
        common[lang].homePage.aboutUsSection.featureCards[index].badgeLabel,
    ),
    text: localized(
      (lang) =>
        common[lang].homePage.aboutUsSection.featureCards[index].description,
    ),
    image: card.imageUrl,
    sortOrder: index,
    active: true,
  })),
  ...common.ru.homePage.aboutUsSection.processCards.map((_, index) => ({
    title: localized(
      (lang) => common[lang].homePage.aboutUsSection.processCards[index].title,
    ),
    lead: null,
    text: localized(
      (lang) =>
        common[lang].homePage.aboutUsSection.processCards[index].description,
    ),
    image: null,
    sortOrder: index + 2,
    active: true,
  })),
];

const partnerBrands = [
  { file: "ruhabat-logo.svg", label: "Ruhabat" },
  { file: "gala-logo.svg", label: "Gala" },
  { file: "bedew-logo.svg", label: "Bedew" },
  { file: "adt-logo.svg", label: "ADT" },
  { file: "nusay.svg", label: "Nusay" },
];

const aboutPage = {
  title: localized((lang) => common[lang].homePage.aboutUsSection.badgeLabel),
  text: localized((lang) => common[lang].homePage.aboutUsSection.headline),
};

const contact = {
  email: "info@yustextile.com",
  phone: "+993 62 103133",
  whatsapp: "+7 925 913 15 11",
  telegramPhone: null,
  address: localized((lang) => common[lang].address),
};

const assets = new Set([
  ...products.map((item) => item.image),
  ...categories.map((item) => item.image),
  ...promos.map((item) => item.image),
  ...complexes.map((item) => item.image),
  ...aboutBlocks.map((item) => item.image),
  "/download/catalog.pdf",
  ...partnerBrands.map((brand) => `/logos/${brand.file}`),
]);

for (const path of assets) {
  if (path) await access(asset(path));
}
await access(join(adminDir, "public", "logo.png"));

console.log(
  `Категории: ${categories.length}; товары: ${products.length}; промо: ${promos.length}; комплексы: ${complexes.length}; FAQ: ${faqs.length}; блоки «О нас»: ${aboutBlocks.length}; партнёры: ${partnerBrands.length}; PDF: 1.`,
);
console.log(
  `Изображения и файлы для загрузки: ${[...assets].filter(Boolean).length + 1}.`,
);
if (omittedProducts.length) {
  console.log(
    `Пропущены товары без трёх переводов (${omittedProducts.length}): ${omittedProducts.join(", ")}`,
  );
}

if (!apply) {
  console.log("Это предварительный просмотр. Для записи добавьте --apply.");
  process.exit(0);
}

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password)
  throw new Error(
    "Для импорта нужны ADMIN_EMAIL и ADMIN_PASSWORD из backend/.env.",
  );

async function request(path, options = {}) {
  const response = await fetch(new URL(path, apiOrigin), options);
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `${options.method || "GET"} ${path}: ${response.status} ${JSON.stringify(result)}`,
    );
  }
  return result;
}

const login = await request("/api/admin/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const auth = { Authorization: `Bearer ${login.accessToken}` };
const manifest = await readJson(manifestPath).catch(() => ({ uploads: {} }));
const saveManifest = () =>
  writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

async function upload(
  path,
  absolute = path === "admin-logo"
    ? join(adminDir, "public", "logo.png")
    : asset(path),
) {
  if (manifest.uploads[path]) return manifest.uploads[path];

  let bytes = await readFile(absolute);
  let filename = basename(absolute);
  let mime =
    extname(filename).toLowerCase() === ".pdf"
      ? "application/pdf"
      : "image/webp";

  if (extname(filename).toLowerCase() === ".svg") {
    bytes = await sharp(bytes)
      .resize({ width: 900, withoutEnlargement: true })
      .png()
      .toBuffer();
    filename = filename.replace(/\.svg$/i, ".png");
    mime = "image/png";
  } else if (extname(filename).toLowerCase() === ".png") {
    mime = "image/png";
  } else if (
    extname(filename).toLowerCase() === ".jpg" ||
    extname(filename).toLowerCase() === ".jpeg"
  ) {
    mime = "image/jpeg";
  }

  const body = new FormData();
  body.append("file", new Blob([bytes], { type: mime }), filename);
  const result = await request("/api/admin/uploads", {
    method: "POST",
    headers: auth,
    body,
  });
  manifest.uploads[path] = result.url;
  await saveManifest();
  return result.url;
}

async function list(resource) {
  const first = await request(
    `/api/admin/content/${resource}?page=1&limit=100`,
    { headers: auth },
  );
  const items = [...first.items];
  for (let page = 2; page <= Math.ceil(first.total / 100); page += 1) {
    const result = await request(
      `/api/admin/content/${resource}?page=${page}&limit=100`,
      { headers: auth },
    );
    items.push(...result.items);
  }
  return items;
}

async function create(resource, payload) {
  return request(`/api/${resource}`, {
    method: "POST",
    headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function patch(path, payload) {
  return request(path, {
    method: "PATCH",
    headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

const counts = {};
async function importList(resource, planned, keyOf, payloadOf) {
  const existing = await list(resource);
  const keys = new Set(existing.map(keyOf));
  let created = 0;
  for (const item of planned) {
    const key = keyOf(item);
    if (keys.has(key)) continue;
    const payload = await payloadOf(item);
    const record = await create(resource, payload);
    existing.push(record);
    keys.add(key);
    created += 1;
  }
  counts[resource] = created;
  console.log(
    `${resource}: добавлено ${created}, уже было ${existing.length - created}`,
  );
  return existing;
}

const importedCategories = await importList(
  "categories",
  categories,
  (item) => item.slug,
  async (item) => ({
    ...item,
    image: item.image ? await upload(item.image) : null,
  }),
);
const categoryIds = new Map(
  importedCategories.map((item) => [item.slug, item.id]),
);

await importList(
  "products",
  products,
  (item) => item.slug,
  async (item) => {
    const { categoryIndex, image, ...rest } = item;
    return {
      ...rest,
      categoryId: categoryIds.get(categories[categoryIndex].slug),
      images: [await upload(image)],
    };
  },
);

await importList(
  "promos",
  promos,
  (item) => item.title.ru,
  async (item) => {
    const { image, ...rest } = item;
    return { ...rest, images: [await upload(image)] };
  },
);

await importList(
  "complexes",
  complexes,
  (item) => item.slug,
  async (item) => ({
    ...item,
    image: await upload(item.image),
  }),
);

await importList(
  "faqs",
  faqs,
  (item) => item.question.ru,
  async (item) => item,
);

await importList(
  "about-blocks",
  aboutBlocks,
  (item) => item.title.ru,
  async (item) => ({
    ...item,
    image: item.image ? await upload(item.image) : null,
  }),
);

const importedPartners = await importList(
  "partners",
  partnerBrands.map((brand, index) => ({ ...brand, sortOrder: index })),
  (item) =>
    item.label ||
    item.name?.ru ||
    partnerBrands.find(
      (brand) => manifest.uploads[`/logos/${brand.file}`] === item.logo,
    )?.label ||
    item.logo,
  async (item) => ({
    logo: await upload(`/logos/${item.file}`),
    name: { tk: item.label, ru: item.label, en: item.label },
    url: null,
    sortOrder: item.sortOrder,
    active: true,
  }),
);

for (const partner of importedPartners) {
  if (partner.name) continue;
  const brand = partnerBrands.find(
    (item) => manifest.uploads[`/logos/${item.file}`] === partner.logo,
  );
  if (brand) {
    await patch(`/api/partners/${partner.id}`, {
      name: { tk: brand.label, ru: brand.label, en: brand.label },
    });
  }
}

await importList(
  "catalogs",
  [
    {
      title: {
        ru: "Каталог продукции",
        tk: "Önüm katalogy",
        en: "Product catalog",
      },
    },
  ],
  (item) => item.title.ru,
  async (item) => ({
    ...item,
    pdfRu: await upload("/download/catalog.pdf"),
    pdfTk: null,
    pdfEn: null,
    active: true,
  }),
);

if (!(await request("/api/site/about"))) {
  await patch("/api/site/about", aboutPage);
  counts.about = 1;
}
if (!(await request("/api/site/contact"))) {
  await patch("/api/site/contact", {
    ...contact,
    logo: await upload("admin-logo"),
  });
  counts.contact = 1;
}

console.log(
  `Готово. Добавлено записей: ${Object.values(counts).reduce((sum, value) => sum + value, 0)}.`,
);
