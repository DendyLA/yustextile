/**
 * Seed ten hidden sample articles through the admin API.
 * Preview: node scripts/seed-test-blog.mjs
 * Apply: node --env-file=../backend/.env scripts/seed-test-blog.mjs --apply
 */
import { slugify } from "../src/lib/slug.ts";

const apiOrigin = process.env.API_ORIGIN || "http://127.0.0.1:4000";
const apply = process.argv.includes("--apply");

const articles = [
  {
    cover: "cotton-turkmenbashi",
    title: {
      ru: "Как выбрать хлопковую ткань для дома",
      tk: "Öý üçin pagta matasyny nädip saýlamaly",
      en: "How to Choose Cotton Fabric for Your Home",
    },
    text: {
      ru: "Хлопковая ткань подходит для вещей, которые используются каждый день: она приятна на ощупь и легко стирается. Перед покупкой потрогайте материал, посмотрите на равномерность переплетения и уточните рекомендации по уходу. Для постельного белья и полотенец выбирайте ткань под конкретную задачу, а не только по внешнему виду.",
      tk: "Pagta matasy gündelik ulanylýan önümler üçin amatly: el degirmek ýakymly we ýuwmak aňsat. Saýlanyňyzda matanyň ýüzüne, dokalyşynyň deňligine we ideg görkezmelerine üns beriň. Ýorgan-düşek ýa-da polotensa üçin matany diňe görnüşine görä däl, ulanylyşyna görä saýlaň.",
      en: "Cotton fabric works well for everyday items because it feels comfortable and is easy to wash. Before choosing a fabric, check its texture, the evenness of the weave, and the care instructions. Pick the material for the intended use rather than its appearance alone.",
    },
  },
  {
    cover: "ranfors-kaka",
    title: {
      ru: "Что означает плотность ткани",
      tk: "Matanyň dykyzlygy näme aňladýar",
      en: "What Fabric Density Means",
    },
    text: {
      ru: "Плотность помогает понять, насколько близко расположены нити в ткани. Но одно число не рассказывает всё о качестве: важны также пряжа, переплетение и отделка. Сравнивая два образца, оцените их вместе — на свет, на ощупь и после стирки.",
      tk: "Dykyzlyk matadaky sapaklaryň näderejede ýakyn ýerleşendigini görkezýär. Emma bir san matanyň hilini doly düşündirmeýär: ýüplük, dokalyş we gutarnykly işleniş hem möhümdir. Iki nusgany deňeşdireniňizde olaryň görnüşine, el degirişine we ýuwlandan soňky ýagdaýyna serediň.",
      en: "Fabric density describes how closely the threads sit together. One number cannot explain overall quality, because yarn, weave, and finishing also matter. Compare samples by looking at them, feeling them, and checking how they behave after washing.",
    },
  },
  {
    cover: "towel1-ashgabat",
    title: {
      ru: "Уход за махровыми полотенцами",
      tk: "Mahra polotensalara ideg etmek",
      en: "Caring for Terry Towels",
    },
    text: {
      ru: "Новое полотенце полезно постирать перед первым использованием. Не перегружайте стиральную машину: петлям махры нужно место, чтобы хорошо промыться. Сушите полотенца полностью и храните их только сухими, чтобы они дольше оставались мягкими.",
      tk: "Täze polotensany ilkinji gezek ulanmazdan öň ýuwmak peýdalydyr. Kir ýuwujy maşyny artykmaç doldurmaň: mahra halkalary gowy arassalanmak üçin ýere mätäç. Polotensalary doly guradyň we diňe gury görnüşde saklaň.",
      en: "Wash a new towel before its first use. Avoid overloading the washing machine so the terry loops have room to rinse properly. Dry towels completely and store them only when dry to help keep them soft.",
    },
  },
  {
    cover: "bed-sheets1-ashgabat",
    title: {
      ru: "Как подобрать постельное бельё по сезону",
      tk: "Möwsüme görä ýorgan-düşek toplumyny saýlamak",
      en: "Choosing Bedding for Each Season",
    },
    text: {
      ru: "Для тёплого времени года обычно выбирают лёгкие, хорошо пропускающие воздух ткани. В прохладный сезон важнее ощущение тепла и уютная фактура. Проверьте размеры матраса, подушек и одеяла до покупки: правильная посадка влияет на удобство не меньше, чем материал.",
      tk: "Yssy möwsümde ýeňil we howany gowy geçirýän matalar amatly bolýar. Salkyn wagtda ýylylyk duýgusy we ýakymly ýüz gurluşy has möhümdir. Satyn almazdan öň düşegiň, ýassygyň we ýorganyň ölçeglerini barlaň.",
      en: "Light, breathable fabrics are often comfortable in warm weather. In cooler months, a warmer feel and a cozy texture may matter more. Check the sizes of your mattress, pillows, and duvet before buying, because fit is as important as fabric.",
    },
  },
  {
    cover: "yarn1-ashgabat",
    title: {
      ru: "Путь хлопковой нити до готовой ткани",
      tk: "Pagta ýüplüginden taýýar mata çenli ýol",
      en: "From Cotton Yarn to Finished Fabric",
    },
    text: {
      ru: "Будущая ткань начинается с пряжи: волокна превращают в ровную нить. Затем нити соединяют на ткацком оборудовании и получают полотно. После этого материал могут окрасить и обработать, чтобы подготовить его к пошиву изделий.",
      tk: "Taýýar mata ýüplükden başlanýar: süýümler birmeňzeş sapaga öwrülýär. Soňra sapaklar dokma enjamlarynda birleşdirilip mata alynýar. Ondan soň mata boýalyp we işlenip, önüm tikmäge taýýarlanyp bilner.",
      en: "Fabric begins with yarn, when fibers are turned into an even thread. The threads are then woven into cloth. Dyeing and finishing can follow before the material is ready to be cut and sewn into products.",
    },
  },
  {
    cover: "denim2-turkmenbashi-denim",
    title: {
      ru: "Почему деним выглядит по-разному",
      tk: "Denim näme üçin dürli görnüşde bolýar",
      en: "Why Denim Can Look So Different",
    },
    text: {
      ru: "Два изделия из денима могут отличаться оттенком, плотностью и фактурой. На внешний вид влияют пряжа, способ переплетения и последующая обработка ткани. Если подбираете деним для коллекции, сравните образцы при дневном свете и проверьте их после стирки.",
      tk: "Iki denim önümi reňki, dykyzlygy we ýüz gurluşy boýunça tapawutlanyp biler. Ýüplük, dokalyş usuly we soňky işleniş onuň görnüşine täsir edýär. Kolleksiýa üçin denim saýlanyňyzda nusgalary gündiz ýagtylygynda we ýuwlandan soň deňeşdiriň.",
      en: "Two denim fabrics may differ in shade, weight, and texture. Yarn, weave, and later finishing all influence the result. When choosing denim for a collection, compare samples in daylight and inspect them again after washing.",
    },
  },
  {
    cover: "dyed-waffle-ashgabat",
    title: {
      ru: "Вафельная ткань в повседневных изделиях",
      tk: "Gündelik önümlerde wafli mata",
      en: "Waffle Fabric in Everyday Products",
    },
    text: {
      ru: "Вафельную ткань легко узнать по объёмному рисунку из небольших ячеек. Такая фактура делает даже простые изделия выразительными и удобными в использовании. При выборе обращайте внимание на состав, толщину и рекомендации по уходу.",
      tk: "Wafli matany kiçijik öýjüklerden ybarat göwrümli nagyşyndan tanamak aňsat. Bu ýüz gurluşy ýönekeý önümlere hem aýratyn görnüş berýär. Saýlanyňyzda düzümine, galyňlygyna we ideg görkezmelerine üns beriň.",
      en: "Waffle fabric is easy to recognize by its raised grid of small squares. This texture adds character to simple everyday products. When selecting it, check the fiber content, thickness, and care instructions.",
    },
  },
  {
    cover: "satin-babadaykhan",
    title: {
      ru: "Сатин: гладкая поверхность и уход",
      tk: "Satin: tekiz ýüz we ideg",
      en: "Satin: Smooth Texture and Care",
    },
    text: {
      ru: "Сатин ценят за гладкую поверхность и мягкий блеск. Ощущение ткани зависит не только от названия переплетения, но и от состава волокон. Перед стиркой изучите ярлык изделия и следуйте указанной температуре, чтобы сохранить внешний вид.",
      tk: "Satin tekiz ýüzi we ýumşak öwüşgini üçin halanýar. Matanyň duýgusy diňe dokalyş adyna däl, süýümleriň düzümine hem baglydyr. Ýuwmazdan öň önüm etiketkasyny okaň we görkezilen temperatura eýeriň.",
      en: "Satin is valued for its smooth surface and soft sheen. The feel depends on fiber content as well as the type of weave. Read the product label before washing and follow its temperature guidance to preserve the finish.",
    },
  },
  {
    cover: "gabardine-kaka",
    title: {
      ru: "Что проверить перед оптовым заказом ткани",
      tk: "Matany lomaý sargyt etmezden öň nämeleri barlamaly",
      en: "What to Check Before a Wholesale Fabric Order",
    },
    text: {
      ru: "Перед крупным заказом согласуйте состав, ширину, цвет и предполагаемое применение ткани. Попросите образец и проверьте его в условиях, близких к будущему использованию. Зафиксируйте требования к упаковке и срокам в одном списке — так проще сравнивать предложения.",
      tk: "Uly sargytdan öň matanyň düzümini, giňligini, reňkini we ulanylyşyny anyklaň. Nusga sorap, ony geljekki ulanylyşa ýakyn şertlerde barlaň. Gaplama we möhlet baradaky talaplary bir sanawda ýazyp goýuň.",
      en: "Before placing a large order, agree on fiber content, width, color, and intended use. Ask for a sample and test it in conditions close to real use. Put packaging and timing requirements in one checklist so offers are easier to compare.",
    },
  },
  {
    cover: "bathrobes1-bayramali",
    title: {
      ru: "Простые правила хранения домашнего текстиля",
      tk: "Öý dokma önümlerini saklamagyň ýönekeý düzgünleri",
      en: "Simple Ways to Store Home Textiles",
    },
    text: {
      ru: "Перед хранением убедитесь, что бельё, полотенца и халаты полностью высохли. Складывайте вещи в чистом, проветриваемом месте и не прижимайте их слишком плотно. Разделяйте комплекты по назначению, чтобы нужный текстиль было легко найти.",
      tk: "Saklamazdan öň düşek esbaplarynyň, polotensalaryň we halatlaryň doly gurandygyny barlaň. Olary arassa we howa geçýän ýerde goýuň, aşa dykyz ýerleşdirmäň. Gerekli önümi aňsat tapmak üçin toplumlary aýratyn saklaň.",
      en: "Make sure bedding, towels, and robes are completely dry before storing them. Keep them in a clean, airy place without packing them too tightly. Group sets by use so the textile you need is easy to find.",
    },
  },
];

const planned = articles.map((article) => slugify(article.title.ru));
console.log(
  `Подготовлено ${articles.length} тестовых статей: ${planned.join(", ")}`,
);
if (!apply) {
  console.log("Предпросмотр завершён. Для создания добавьте --apply.");
  process.exit(0);
}

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) {
  throw new Error("Нужны ADMIN_EMAIL и ADMIN_PASSWORD из backend/.env.");
}

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
const headers = {
  Authorization: `Bearer ${login.accessToken}`,
  "content-type": "application/json",
};

async function all(resource) {
  const first = await request(
    `/api/admin/content/${resource}?page=1&limit=100`,
    { headers },
  );
  const result = [...first.items];
  for (let page = 2; page <= Math.ceil(first.total / 100); page += 1) {
    const next = await request(
      `/api/admin/content/${resource}?page=${page}&limit=100`,
      { headers },
    );
    result.push(...next.items);
  }
  return result;
}

const [existing, products] = await Promise.all([all("blog"), all("products")]);
const existingSlugs = new Set(existing.map((item) => item.slug));
const coverImages = new Map(
  products.map((item) => [item.slug, item.images?.[0]]),
);
let created = 0;

for (const [index, article] of articles.entries()) {
  const slug = planned[index];
  if (existingSlugs.has(slug)) {
    console.log(`Уже есть: ${slug}`);
    continue;
  }

  const image = coverImages.get(article.cover);
  if (!image) throw new Error(`Нет обложки для ${slug}: ${article.cover}`);

  await request("/api/blog", {
    method: "POST",
    headers,
    body: JSON.stringify({
      slug,
      title: article.title,
      text: article.text,
      image,
      active: false,
      publishedAt: new Date(Date.UTC(2026, 9, 9 - index, 12)).toISOString(),
    }),
  });
  existingSlugs.add(slug);
  created += 1;
  console.log(`Создано ${created}/${articles.length}: ${slug}`);
}

const result = await all("blog");
const seeded = result.filter((item) => planned.includes(item.slug));
if (seeded.length !== articles.length || seeded.some((item) => item.active)) {
  throw new Error(
    `Проверка не прошла: найдено ${seeded.length} из ${articles.length} скрытых статей.`,
  );
}
console.log(
  `Готово: ${seeded.length} скрытых тестовых статей доступны в админке.`,
);
