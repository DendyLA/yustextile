"use client";

import { languages, localized } from "@/lib/format";
import type { ContentItem, Language, ResourceDefinition } from "@/lib/types";
import { usePreviewLanguage } from "@/components/layout/admin-shell";
import { Drawer } from "@/components/ui/drawer";

type Specification = { name?: unknown; value?: unknown };

export function ResourcePreview({
  item,
  definition,
  onClose,
  onEdit,
}: {
  item: ContentItem;
  definition: ResourceDefinition;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { language, setLanguage } = usePreviewLanguage();
  const name = localized(item.title || item.question || item.name, language);
  const images = item.images?.length
    ? item.images
    : [item.image || item.logo].filter((image): image is string =>
        Boolean(image),
      );
  const pdfKey = { ru: "pdfRu", tk: "pdfTk", en: "pdfEn" }[language];
  const pdf = item[pdfKey];
  const specifications = Array.isArray(item.specs)
    ? (item.specs as Specification[])
    : [];
  const translatedFields = definition.fields.filter(
    (field) => field.type === "localized" || field.type === "localizedText",
  );

  return (
    <Drawer
      eyebrow="Предпросмотр записи"
      title={name || "Перевод не заполнен"}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>
            Закрыть
          </button>
          <button className="btn primary" onClick={onEdit}>
            Редактировать
          </button>
        </>
      }
    >
      <p className="preview-hint">
        Так выглядят сохранённые данные на выбранном языке.
      </p>
      <div
        className="langs"
        role="tablist"
        aria-label="Язык предпросмотра записи"
      >
        {(Object.keys(languages) as Language[]).map((code) => (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={language === code}
            className={language === code ? "active" : ""}
            onClick={() => setLanguage(code)}
          >
            {languages[code]}
          </button>
        ))}
      </div>

      {images.length > 0 && (
        <div className="preview-images">
          {images.map((image, index) => (
            // Media may be served by the backend or an external host.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${image}-${index}`}
              src={image}
              alt={`${name || "Изображение"} ${index + 1}`}
            />
          ))}
        </div>
      )}

      <dl className="preview-details">
        {translatedFields.map((field) => (
          <div key={field.key}>
            <dt>{field.label}</dt>
            <dd
              className={
                !localized(item[field.key], language)
                  ? "missing-translation"
                  : ""
              }
            >
              {localized(item[field.key], language) ||
                `Нет перевода на ${languages[language]}`}
            </dd>
          </div>
        ))}
        {item.category?.title && (
          <div>
            <dt>Категория</dt>
            <dd>
              {localized(item.category.title, language) ||
                `Нет перевода на ${languages[language]}`}
            </dd>
          </div>
        )}
        {specifications.length > 0 && (
          <div>
            <dt>Характеристики</dt>
            <dd>
              <ul className="preview-specs">
                {specifications.map((spec, index) => (
                  <li key={index}>
                    <strong>
                      {localized(spec.name, language) || "Без перевода"}
                    </strong>
                    <span>
                      {localized(spec.value, language) || "Без перевода"}
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {definition.fields.some((field) => field.type === "file") && (
          <div>
            <dt>PDF-каталог · {languages[language]}</dt>
            <dd>
              {typeof pdf === "string" && pdf ? (
                <a href={pdf} target="_blank" rel="noopener noreferrer">
                  Открыть PDF ↗
                </a>
              ) : (
                <span className="missing-translation">
                  Файл для этого языка не добавлен
                </span>
              )}
            </dd>
          </div>
        )}
        {item.url && (
          <div>
            <dt>Ссылка</dt>
            <dd>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.url} ↗
              </a>
            </dd>
          </div>
        )}
      </dl>
    </Drawer>
  );
}
