"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { errorMessage, formatDate } from "@/lib/format";
import type { Subscriber } from "@/lib/types";
import {
  EmptyState,
  ErrorBox,
  Loading,
  PageHeader,
} from "@/components/ui/feedback";

export function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .subscribers()
      .then((data) => active && setSubscribers(data))
      .catch((cause) => active && setError(errorMessage(cause)));
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      subscribers?.filter((item) =>
        item.email.toLowerCase().includes(search.toLowerCase()),
      ) || [],
    [subscribers, search],
  );

  return (
    <>
      <PageHeader
        title="Подписчики"
        description="Люди, которые оставили почту для рассылки."
      />
      {error ? (
        <ErrorBox message={error} />
      ) : !subscribers ? (
        <Loading />
      ) : (
        <div className="card">
          <div className="toolbar">
            <div className="search">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по адресу почты"
                aria-label="Поиск по адресу почты"
              />
            </div>
            <span className="subtle">Всего: {subscribers.length}</span>
          </div>
          {filtered.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Электронная почта</th>
                    <th>Дата подписки</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>{item.email}</td>
                      <td>{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Подписчиков не найдено"
              description="Попробуйте другой адрес."
            />
          )}
        </div>
      )}
    </>
  );
}
