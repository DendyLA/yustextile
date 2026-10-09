"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
  errorMessage,
  formatDate,
  localized,
  statusLabels,
} from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { usePreviewLanguage, useToast } from "@/components/layout/admin-shell";
import { Drawer } from "@/components/ui/drawer";
import { PreviewLanguageSwitch } from "@/components/ui/preview-language-switch";
import {
  EmptyState,
  ErrorBox,
  Loading,
  PageHeader,
} from "@/components/ui/feedback";

export function OrdersPage() {
  const notify = useToast();
  const { language } = usePreviewLanguage();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [status, setStatus] = useState<OrderStatus>("NEW");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setOrders(await api.orders());
      setError("");
    } catch (cause) {
      setError(errorMessage(cause));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () =>
      orders?.filter((order) => {
        if (filter && order.status !== filter) return false;
        return [
          order.name,
          order.phone,
          order.email,
          order.country,
          order.id,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        );
      }) || [],
    [orders, search, filter],
  );

  function open(order: Order) {
    setSelected(order);
    setStatus(order.status);
  }

  async function saveStatus() {
    if (!selected) return;
    setSaving(true);
    try {
      await api.orderStatus(selected.id, status);
      setSelected(null);
      notify("Статус обновлён");
      await load();
    } catch (cause) {
      notify(errorMessage(cause), true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Заявки"
        description="Все обращения клиентов и их текущий статус."
      />

      <PreviewLanguageSwitch />

      {error ? (
        <ErrorBox message={error} />
      ) : !orders ? (
        <Loading />
      ) : (
        <div className="card">
          <div className="toolbar">
            <div className="search">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по имени, телефону или почте"
                aria-label="Поиск заявок"
              />
            </div>
            <select
              className="select"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as OrderStatus | "")
              }
              aria-label="Фильтр по статусу"
            >
              <option value="">Все статусы</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Клиент</th>
                    <th>Контакт</th>
                    <th>Товары</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th className="align-right">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.name || "Без имени"}</strong>
                        <br />
                        <span className="subtle">{order.country}</span>
                      </td>
                      <td>
                        {order.phone}
                        <br />
                        <span className="subtle">{order.email}</span>
                      </td>
                      <td>{order.items.length} поз.</td>
                      <td>
                        <span className={`badge ${order.status}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td className="align-right">
                        <button
                          className="btn soft sm"
                          onClick={() => open(order)}
                        >
                          Открыть →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Заявок не найдено"
              description="Здесь появятся обращения клиентов."
            />
          )}
        </div>
      )}

      {selected && (
        <Drawer
          eyebrow={`Заявка от ${formatDate(selected.createdAt)}`}
          title={selected.name || "Клиент"}
          onClose={() => setSelected(null)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setSelected(null)}>
                Закрыть
              </button>
              <button
                className="btn primary"
                onClick={saveStatus}
                disabled={saving}
              >
                {saving ? "Сохраняем…" : "Сохранить статус"}
              </button>
            </>
          }
        >
          <div className="order-detail">
            <h3>Контактные данные</h3>
            <div className="detail-grid">
              {[
                ["Телефон", selected.phone],
                ["Почта", selected.email],
                ["Страна", selected.country],
                ["Адрес", selected.address],
              ].map(([label, value]) => (
                <div className="detail-box" key={label}>
                  <small>{label}</small>
                  <strong>{value || "—"}</strong>
                </div>
              ))}
            </div>

            {selected.comment && (
              <p>
                <strong>Комментарий:</strong> {selected.comment}
              </p>
            )}
            <hr className="divider" />
            <h3>Товары</h3>
            {selected.items.map((item) => (
              <div className="order-line" key={item.id}>
                <div className="order-line-info">
                  <strong>
                    {localized(item.productTitle, language) || "Нет перевода"}
                  </strong>
                  <small>Количество: {item.quantity}</small>
                </div>
              </div>
            ))}
            <hr className="divider" />
            <div className="field">
              <label htmlFor="order-status">Статус заявки</label>
              <select
                id="order-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as OrderStatus)
                }
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}
