"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { errorMessage, formatDate, localized } from "@/lib/format";
import { resources } from "@/lib/resources";
import type { ContentItem } from "@/lib/types";
import { usePreviewLanguage, useToast } from "@/components/layout/admin-shell";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  EmptyState,
  ErrorBox,
  Loading,
  PageHeader,
} from "@/components/ui/feedback";
import { PreviewLanguageSwitch } from "@/components/ui/preview-language-switch";
import { ResourceForm } from "./resource-form";
import { ResourcePreview } from "./resource-preview";

export function ResourcePage({ resource }: { resource: string }) {
  const definition = resources[resource];
  const notify = useToast();
  const { language } = usePreviewLanguage();
  const [items, setItems] = useState<ContentItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<{ item: ContentItem | null } | null>(
    null,
  );
  const [categories, setCategories] = useState<ContentItem[]>([]);
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingVisibilityId, setSavingVisibilityId] = useState<string | null>(
    null,
  );

  const load = useCallback(async () => {
    try {
      const result = await api.list(resource, page);
      setItems(result.items);
      setTotal(result.total);
      setError("");
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }, [resource, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () =>
      items?.filter((item) =>
        [item.title, item.question, item.name, item.slug].some((value) =>
          localized(value, language)
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      ) || [],
    [items, search, language],
  );

  async function openEditor(item: ContentItem | null) {
    if (resource === "products" || resource === "categories") {
      try {
        setCategories(await api.allCategories());
      } catch (cause) {
        notify(errorMessage(cause), true);
        return;
      }
    }
    setEditor({ item });
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await api.remove(resource, pendingDelete.id);
      setPendingDelete(null);
      notify("Запись удалена");
      await load();
    } catch (cause) {
      notify(errorMessage(cause), true);
    } finally {
      setDeleting(false);
    }
  }

  async function toggleVisibility(item: ContentItem) {
    if (savingVisibilityId) return;
    setSavingVisibilityId(item.id);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      const updated = await api.update(
        resource,
        item.id,
        {
          active: !item.active,
        },
        controller.signal,
      );
      const isVisible = updated.active ?? !item.active;
      setItems(
        (current) =>
          current?.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  active: isVisible,
                  updatedAt: updated.updatedAt ?? entry.updatedAt,
                }
              : entry,
          ) ?? null,
      );
      notify(isVisible ? "Запись показана на сайте" : "Запись скрыта с сайта");
    } catch (cause) {
      notify(
        controller.signal.aborted
          ? "Сохранение заняло слишком долго. Проверяем текущий статус записи."
          : errorMessage(cause),
        true,
      );
      void load();
    } finally {
      window.clearTimeout(timeout);
      setSavingVisibilityId(null);
    }
  }

  return (
    <>
      <PageHeader
        title={definition.title}
        description={definition.description}
        action={
          <button className="btn primary" onClick={() => void openEditor(null)}>
            ＋ &nbsp;Добавить {definition.singular}
          </button>
        }
      />

      <PreviewLanguageSwitch />

      {error ? (
        <ErrorBox message={error} />
      ) : !items ? (
        <Loading />
      ) : (
        <div className="card">
          <div className="toolbar">
            <div className="search">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по названию на этой странице"
                aria-label="Поиск записей"
              />
            </div>
            <span className="subtle">Всего: {total}</span>
          </div>

          <div className="table-wrap">
            {filtered.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>
                      {resource === "products"
                        ? "Категория"
                        : "Адрес / информация"}
                    </th>
                    <th>Видимость</th>
                    <th>Обновлено</th>
                    <th className="align-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const name =
                      localized(
                        item.title || item.question || item.name,
                        language,
                      ) || "Нет перевода";
                    const image = item.image || item.logo || item.images?.[0];
                    const info =
                      resource === "products"
                        ? localized(item.category?.title, language) ||
                          "Нет перевода"
                        : item.slug || item.url || item.pdfRu || "—";

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="item-cell">
                            {image ? (
                              // The backend may return both local and external images.
                              // eslint-disable-next-line @next/next/no-img-element
                              <img className="thumb" src={image} alt="" />
                            ) : (
                              <span className="thumb placeholder">
                                {definition.icon}
                              </span>
                            )}
                            <span>
                              <strong>{name}</strong>
                              <small>{item.slug || ""}</small>
                            </span>
                          </div>
                        </td>
                        <td>{info}</td>
                        <td>
                          <button
                            type="button"
                            className={`visibility-toggle ${item.active ? "visible" : "hidden"}`}
                            disabled={savingVisibilityId !== null}
                            aria-label={`${item.active ? "Скрыть" : "Показать"} «${name}» на сайте`}
                            title={
                              item.active
                                ? "Нажмите, чтобы скрыть"
                                : "Нажмите, чтобы показать"
                            }
                            onClick={() => void toggleVisibility(item)}
                          >
                            <span
                              className="visibility-indicator"
                              aria-hidden="true"
                            />
                            <span>
                              {savingVisibilityId === item.id
                                ? "Сохраняем…"
                                : item.active
                                  ? "На сайте"
                                  : "Скрыто"}
                            </span>
                            <small>{item.active ? "Скрыть" : "Показать"}</small>
                          </button>
                        </td>
                        <td>{formatDate(item.updatedAt)}</td>
                        <td>
                          <div className="actions">
                            <button
                              className="icon-btn"
                              title="Предпросмотр на выбранном языке"
                              aria-label={`Предпросмотр: ${name}`}
                              onClick={() => setPreviewItem(item)}
                            >
                              ◉
                            </button>
                            <button
                              className="icon-btn"
                              title="Редактировать"
                              onClick={() => void openEditor(item)}
                            >
                              ✎
                            </button>
                            <button
                              className="icon-btn"
                              title="Удалить"
                              aria-label={`Удалить: ${name}`}
                              onClick={() => setPendingDelete(item)}
                            >
                              ⌫
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState
                title={search ? "Ничего не найдено" : "Пока пусто"}
                description={
                  search
                    ? "Попробуйте другое слово."
                    : `Добавьте первый ${definition.singular}.`
                }
              />
            )}
          </div>

          <div className="pagination">
            <span>
              Страница {page} из {Math.max(1, Math.ceil(total / 20))}
            </span>
            <span className="pagination-controls">
              <button
                className="btn ghost sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Назад
              </button>
              <button
                className="btn ghost sm"
                disabled={page * 20 >= total}
                onClick={() => setPage(page + 1)}
              >
                Далее →
              </button>
            </span>
          </div>
        </div>
      )}

      {editor && (
        <ResourceForm
          key={editor.item?.id || "new"}
          definition={definition}
          item={editor.item}
          categories={categories}
          onClose={() => setEditor(null)}
          onSave={() => void load()}
          save={(payload) =>
            editor.item
              ? api.update(resource, editor.item.id, payload)
              : api.create(resource, payload)
          }
        />
      )}
      {previewItem && (
        <ResourcePreview
          item={previewItem}
          definition={definition}
          onClose={() => setPreviewItem(null)}
          onEdit={() => {
            const item = previewItem;
            setPreviewItem(null);
            void openEditor(item);
          }}
        />
      )}
      {pendingDelete && (
        <ConfirmDialog
          title="Удалить запись?"
          description={
            <>
              «
              {localized(
                pendingDelete.title ||
                  pendingDelete.question ||
                  pendingDelete.name,
                language,
              ) ||
                pendingDelete.slug ||
                "Запись"}
              » будет удалена без возможности восстановления.
            </>
          }
          confirmLabel="Да, удалить"
          destructive
          busy={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </>
  );
}
