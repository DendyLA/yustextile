const letters: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  ә: "a",
  ғ: "g",
  қ: "k",
  ң: "n",
  ө: "o",
  ү: "u",
  ұ: "u",
  һ: "h",
  і: "i",
  ä: "a",
  ç: "c",
  ğ: "g",
  ı: "i",
  ň: "n",
  ö: "o",
  ş: "s",
  ü: "u",
  ý: "y",
  ž: "z",
};

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\x00-\x7f]/g, (character) => letters[character] ?? character)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
