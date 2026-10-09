"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { errorMessage, localized } from "@/lib/format";
import { siteSections } from "@/lib/resources";
import type { ContentItem } from "@/lib/types";
import { usePreviewLanguage } from "@/components/layout/admin-shell";
import { ErrorBox, Loading, PageHeader } from "@/components/ui/feedback";
import { PreviewLanguageSwitch } from "@/components/ui/preview-language-switch";
import { ResourceForm } from "@/components/resources/resource-form";

export function SitePage({ section }: { section: keyof typeof siteSections }) {
  const definition = siteSections[section];
  const { language } = usePreviewLanguage();
  const [data, setData] = useState<Record<string, unknown> | null | undefined>(
    undefined,
  );
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await api.site(section));
      setError("");
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }, [section]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeader
        title={definition.title}
        description={definition.description}
        action={
          <button
            className="btn primary"
            onClick={() => setEditing(true)}
            disabled={data === undefined}
          >
            ✎ &nbsp;Изменить
          </button>
        }
      />
      <PreviewLanguageSwitch />
      {error ? (
        <ErrorBox message={error} />
      ) : data === undefined ? (
        <Loading />
      ) : (
        <div className="card site-card">
          {data ? (
            <dl className="site-details">
              {definition.fields.map((field) => (
                <div key={field.key}>
                  <dt>{field.label}</dt>
                  <dd>{localized(data[field.key], language) || "—"}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="muted">
              Данные пока не заполнены. Нажмите «Изменить».
            </p>
          )}
        </div>
      )}

      {editing && (
        <ResourceForm
          key={section}
          definition={{
            singular: section === "about" ? "страницу" : "контакты",
            fields: definition.fields,
          }}
          item={data ? ({ id: "main", ...data } as ContentItem) : null}
          onClose={() => setEditing(false)}
          onSave={() => void load()}
          save={(payload) => api.saveSite(section, payload)}
        />
      )}
    </>
  );
}
