"use client";

import countriesData from "intl-tel-input/data";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Locale } from "../content/types";
import { countrySelectLabels } from "../i18n/ui";

type Country = { iso2: string; dialCode: string; name: string };
type MenuPosition = { position: "fixed" | "absolute"; top: number; left: number; width: number; maxHeight: number };
type Props = {
  lang: Locale;
  label: string;
  value: string;
  invalid: boolean;
  onChange: (countryName: string) => void;
  onTouched: () => void;
};

function searchKey(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase();
}

function getMenuPosition(field: HTMLElement, parent: HTMLElement): MenuPosition {
  const rect = field.getBoundingClientRect();
  const inDialog = parent !== document.body;
  const bounds = inDialog ? parent.getBoundingClientRect() : { top: 0, left: 0, bottom: window.innerHeight };
  const below = bounds.bottom - rect.bottom - 12;
  const above = rect.top - bounds.top - 12;
  const placeAbove = below < 240 && above > below;
  const maxHeight = Math.max(120, Math.min(320, placeAbove ? above : below));
  const top = placeAbove ? rect.top - maxHeight - 6 : rect.bottom + 6;
  return {
    position: inDialog ? "absolute" : "fixed",
    top: top - bounds.top,
    left: rect.left - bounds.left,
    width: rect.width,
    maxHeight,
  };
}

export function CountrySelect({ lang, label, value, invalid, onChange, onTouched }: Props) {
  const t = countrySelectLabels(lang);
  const inputId = useId();
  const listId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [portalParent, setPortalParent] = useState<HTMLElement | null>(null);

  const countries = useMemo(() => {
    const locale = lang === "tm" ? "tk" : lang;
    const names = new Intl.DisplayNames([locale, "en"], { type: "region" });
    return countriesData.map(({ iso2, dialCode }) => ({
      iso2,
      dialCode,
      name: names.of(iso2.toUpperCase()) || iso2.toUpperCase(),
    })).sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [lang]);

  const matches = useMemo(() => {
    const term = searchKey(query.trim());
    return term ? countries.filter((country) =>
      searchKey(country.name).includes(term) || country.iso2.includes(term) || country.dialCode.includes(term.replace(/^\+/, "")),
    ) : countries;
  }, [countries, query]);

  useEffect(() => {
    if (!open || !portalParent) return;
    const field = fieldRef.current;
    if (!field) return;
    const positionMenu = () => {
      setMenuPosition(getMenuPosition(field, portalParent));
    };
    document.addEventListener("scroll", positionMenu, true);
    window.addEventListener("resize", positionMenu);
    return () => {
      document.removeEventListener("scroll", positionMenu, true);
      window.removeEventListener("resize", positionMenu);
    };
  }, [open, portalParent]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!fieldRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
        setQuery("");
        onTouched();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open, onTouched]);

  const openMenu = () => {
    if (fieldRef.current) {
      const parent = fieldRef.current.closest<HTMLElement>('[role="dialog"]') ?? document.body;
      setPortalParent(parent);
      setMenuPosition(getMenuPosition(fieldRef.current, parent));
    }
    setQuery("");
    setHighlighted(0);
    setOpen(true);
  };

  const select = (country: Country) => {
    onChange(country.name);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return <div className="flex flex-col gap-2">
    <label htmlFor={inputId}>{label}</label>
    <div ref={fieldRef} className={`flex min-h-12 items-center rounded-xl bg-white focus-within:ring-2 focus-within:ring-primary/50 ${invalid ? "ring-2 ring-red-600" : ""}`}>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && matches[highlighted] ? `${listId}-${matches[highlighted].iso2}` : undefined}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
        autoComplete="off"
        value={open ? query : value}
        placeholder={t.search}
        onFocus={() => { if (!open) openMenu(); }}
        onChange={(event) => {
          setQuery(event.target.value);
          setHighlighted(0);
          if (value) onChange("");
        }}
        onBlur={() => { if (!open) onTouched(); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!open) openMenu();
            else setHighlighted((index) => Math.min(index + 1, matches.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlighted((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter" && open) {
            event.preventDefault();
            if (matches[highlighted]) select(matches[highlighted]);
          } else if (event.key === "Escape" && open) {
            event.preventDefault();
            setOpen(false);
            setQuery("");
          }
        }}
        className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
      />
      <button type="button" aria-label={t.choose} aria-expanded={open} onClick={() => { if (open) { setOpen(false); setQuery(""); } else { inputRef.current?.focus(); openMenu(); } }} className="flex size-12 shrink-0 items-center justify-center rounded-r-xl text-primary/70 hover:bg-primary/5">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={`size-5 transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
    {invalid && <p id={errorId} role="alert" className="text-sm text-red-700">{t.required}</p>}
    {open && portalParent && menuPosition && createPortal(
      <div ref={menuRef} role="listbox" id={listId} aria-label={label} className="z-[120] overflow-y-auto rounded-xl border border-primary/10 bg-white p-1 shadow-xl" style={menuPosition}>
        {matches.length ? matches.map((country, index) => <div
          key={country.iso2}
          id={`${listId}-${country.iso2}`}
          role="option"
          aria-selected={country.name === value}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => select(country)}
          className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${index === highlighted ? "bg-secondary" : "hover:bg-[#f3f5f7]"}`}
        >
          <span aria-hidden="true" className={`iti__flag iti__${country.iso2} shrink-0`} />
          <span className="min-w-0 flex-1">{country.name}</span>
          <span className="text-textSecondary">+{country.dialCode}</span>
        </div>) : <p className="px-3 py-3 text-sm text-textSecondary">{t.noResults}</p>}
      </div>, portalParent,
    )}
  </div>;
}
