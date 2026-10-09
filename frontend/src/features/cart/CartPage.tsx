"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { assetUrl } from "../content/assets";
import { Locale } from "../content/types";
import { checkoutValidation, ui } from "../i18n/ui";
import { useCart } from "./store";
import { PhoneInput } from "./PhoneInput";
import { CountrySelect } from "./CountrySelect";

type Props = { lang: Locale };

export function CartPage({ lang }: Props) {
  const t = ui(lang);
  const validation = checkoutValidation(lang);
  const items = useCart((state) => state.items);
  const remove = useCart((state) => state.remove);
  const setQuantity = useCart((state) => state.setQuantity);
  const clear = useCart((state) => state.clear);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [countryName, setCountryName] = useState("");
  const [showCountryError, setShowCountryError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    if (!phoneValid || !/^\+[1-9]\d{6,14}$/.test(phoneNumber)) {
      setShowPhoneError(true);
      return;
    }
    if (!countryName) {
      setShowCountryError(true);
      return;
    }

    setPending(true);
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const body = {
      name: String(data.get("name") || ""),
      phone: phoneNumber,
      email: String(data.get("email") || ""),
      country: countryName,
      address: String(data.get("address") || ""),
      comment: String(data.get("comment") || ""),
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Order failed");
      clear();
      form.reset();
      setMessage(t.success);
    } catch {
      setMessage(t.failure);
    } finally {
      setPending(false);
    }
  }

  return <div className="container mx-auto px-4 py-12 md:py-20">
    <h1 className="mb-12 text-4xl md:text-5xl">{t.cart}</h1>
    {!items.length ? <div className="rounded-3xl bg-[#f3f5f7] p-8 md:p-12">
      <p className="mb-6 text-lg" role="status">{message || t.empty}</p>
      <Link href={`/${lang}/products`} className="defaultButton w-max bg-primary text-white">{t.allProducts} →</Link>
    </div> : <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col gap-5">
        {items.map((item) => <div key={item.productId} className="flex gap-4 border-b border-primary/10 pb-5 md:gap-5">
          <Link href={`/${lang}/products/${item.slug}`} className="size-24 shrink-0 overflow-hidden rounded-2xl bg-[#f3f5f7] md:size-28">
            <Image src={assetUrl(item.image)} alt={item.title} width={112} height={112} sizes="112px" className="h-full w-full object-cover" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/${lang}/products/${item.slug}`} className="text-lg hover:underline md:text-xl">{item.title}</Link>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1 text-sm">{t.quantity}
                <input type="number" min="1" max="100000" value={item.quantity} onChange={(event) => setQuantity(item.productId, Number(event.target.value))} className="w-24 rounded-xl border border-primary/15 px-3 py-2" />
              </label>
              <button type="button" onClick={() => remove(item.productId)} className="pb-2 text-sm underline hover:text-red-700">{t.remove}</button>
            </div>
          </div>
        </div>)}
      </div>
      <form onSubmit={submit} className="flex flex-col gap-4 self-start rounded-3xl bg-[#f3f5f7] p-6 md:p-9">
        <h2 className="mb-2 text-2xl">{t.order}</h2>
        <label className="flex flex-col gap-2">{t.name}
          <input name="name" type="text" autoComplete="name" maxLength={120} className="rounded-xl bg-white px-4 py-3 outline-primary" />
        </label>
        <PhoneInput
          lang={lang}
          label={t.phone}
          invalidMessage={validation.phone}
          number={phoneNumber}
          valid={phoneValid}
          showError={showPhoneError}
          onNumberChange={setPhoneNumber}
          onValidityChange={setPhoneValid}
          onTouched={() => setShowPhoneError(true)}
        />
        <label className="flex flex-col gap-2">{t.email}
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={120}
            pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}"
            title={validation.email}
            className="rounded-xl bg-white px-4 py-3 outline-primary"
            onChange={(event) => event.currentTarget.setCustomValidity("")}
            onInvalid={(event) => {
              if (event.currentTarget.validity.typeMismatch || event.currentTarget.validity.patternMismatch) event.currentTarget.setCustomValidity(validation.email);
            }}
          />
        </label>
        <CountrySelect lang={lang} label={t.country} value={countryName} invalid={showCountryError && !countryName} onChange={setCountryName} onTouched={() => setShowCountryError(true)} />
        <label className="flex flex-col gap-2">{t.address}
          <input name="address" type="text" required maxLength={500} autoComplete="street-address" className="rounded-xl bg-white px-4 py-3 outline-primary" />
        </label>
        <label className="flex flex-col gap-2">{t.comment}
          <textarea name="comment" maxLength={2000} rows={4} className="rounded-xl bg-white px-4 py-3 outline-primary" />
        </label>
        <button type="submit" disabled={pending} className="defaultButton bg-primary text-white disabled:opacity-50">{pending ? "..." : t.submit}</button>
        <p role="status">{message}</p>
      </form>
    </div>}
  </div>;
}
