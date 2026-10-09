"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { errorMessage, formatDate, statusLabels } from "@/lib/format";
import type { Order } from "@/lib/types";
import {
  EmptyState,
  ErrorBox,
  Loading,
  PageHeader,
} from "@/components/ui/feedback";

interface Overview {
  orders: Order[];
  products: number;
  categories: number;
  subscribers: number;
}

export function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      api.orders(),
      api.list("products"),
      api.list("categories"),
      api.subscribers(),
    ])
      .then(([orders, products, categories, subscribers]) => {
        if (!active) return;
        setOverview({
          orders,
          products: products.total,
          categories: categories.total,
          subscribers: subscribers.length,
        });
      })
      .catch((cause) => active && setError(errorMessage(cause)));

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Добро пожаловать!"
        description="Здесь всё важное о вашем сайте — в одном месте."
      />

      {error ? (
        <ErrorBox message={error} />
      ) : !overview ? (
        <Loading />
      ) : (
        <>
          <div className="hero">
            <div>
              <p className="eyebrow hero-eyebrow">YUS TEXTILE · ТУРКМЕНИСТАН</p>
              <h2>Ваш сайт под контролем</h2>
              <p>
                Добавляйте товары, отвечайте на заявки и обновляйте страницы —
                всё просто и в пару кликов.
              </p>
              <Link className="btn" href="/products">
                Добавить товар &nbsp;→
              </Link>
            </div>
            <span className="hero-symbol">YUS</span>
          </div>

          <div className="stats">
            {[
              [
                "Новые заявки",
                overview.orders.filter((o) => o.status === "NEW").length,
                "▤",
                "Ждут вашего ответа",
              ],
              ["Товары", overview.products, "◫", "В каталоге"],
              ["Категории", overview.categories, "▧", "Разделы каталога"],
              ["Подписчики", overview.subscribers, "✉", "В рассылке"],
            ].map(([title, value, icon, description]) => (
              <div className="stat" key={title}>
                <div className="stat-top">
                  <span>{title}</span>
                  <span className="stat-icon">{icon}</span>
                </div>
                <div className="stat-num">{value}</div>
                <div className="stat-desc">{description}</div>
              </div>
            ))}
          </div>

          <div className="grid-two">
            <div className="card">
              <div className="card-title">
                <h3>Последние заявки</h3>
                <Link className="text-link" href="/orders">
                  Все заявки →
                </Link>
              </div>
              {overview.orders.length ? (
                overview.orders.slice(0, 5).map((order) => (
                  <div className="order-line" key={order.id}>
                    <span className="order-avatar">
                      {(order.name || order.email || "К")[0].toUpperCase()}
                    </span>
                    <span className="order-line-info">
                      <strong>{order.name || order.email}</strong>
                      <small>
                        {formatDate(order.createdAt)} · {order.phone}
                      </small>
                    </span>
                    <span className={`badge ${order.status}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="Заявок пока нет"
                  description="Когда клиент отправит заявку, она появится здесь."
                />
              )}
            </div>

            <div className="card">
              <div className="card-title">
                <h3>Быстрые действия</h3>
              </div>
              <div className="quick-grid">
                {[
                  ["/products", "◫", "Добавить товар"],
                  ["/categories", "▧", "Категории"],
                  ["/promos", "✧", "Обновить промо"],
                  ["/contact", "☎", "Контакты"],
                ].map(([href, icon, label]) => (
                  <Link className="quick" href={href} key={href}>
                    <span>{icon}</span>
                    {label} &nbsp;→
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
