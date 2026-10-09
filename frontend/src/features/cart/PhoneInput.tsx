"use client";

import IntlTelInput from "@intl-tel-input/react";
import { ru as ruTranslations } from "intl-tel-input/locale";
import { useEffect, useId, useRef, useState } from "react";
import { Locale } from "../content/types";

type Props = {
  lang: Locale;
  label: string;
  invalidMessage: string;
  number: string;
  valid: boolean;
  showError: boolean;
  onNumberChange: (number: string) => void;
  onValidityChange: (valid: boolean) => void;
  onTouched: () => void;
};

const tmTranslations = {
  selectedCountryAriaLabel: "Telefon üçin ýurdy üýtgetmek: ${countryName} (+${dialCode})",
  noCountrySelected: "Telefon üçin ýurdy saýlaň",
  countryListAriaLabel: "Ýurtlaryň sanawy",
  searchPlaceholder: "Ýurdy ýa-da kody gözläň",
  clearSearchAriaLabel: "Gözlegi arassalaň",
  closeCountrySelectorAriaLabel: "Ýap",
  searchEmptyState: "Netije tapylmady",
  searchSummaryAria: (count: number) => `${count} netije tapyldy`,
};

export function PhoneInput({ lang, label, invalidMessage, number, valid, showError, onNumberChange, onValidityChange, onTouched }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [selectorParent, setSelectorParent] = useState<HTMLElement | null>(null);
  const phoneId = useId();
  const errorId = useId();

  useEffect(() => {
    setSelectorParent(hostRef.current?.closest<HTMLElement>('[role="dialog"]') ?? document.body);
  }, []);

  return <div className="flex flex-col gap-2">
    <label htmlFor={phoneId}>{label}</label>
    <div ref={hostRef} className="checkout-phone">
      {selectorParent ? <IntlTelInput
        initialCountry="tm"
        countryNameLocale={lang === "tm" ? "tk" : lang}
        uiTranslations={lang === "ru" ? ruTranslations : lang === "tm" ? tmTranslations : undefined}
        dropdownParent={selectorParent}
        fullscreenParent={selectorParent}
        loadUtils={() => import("intl-tel-input/utils")}
        onChangeNumber={onNumberChange}
        onChangeValidity={onValidityChange}
        inputProps={{
          id: phoneId,
          name: "phoneDisplay",
          required: true,
          autoComplete: "tel",
          inputMode: "tel",
          "aria-invalid": showError && !valid,
          "aria-describedby": showError && !valid ? errorId : undefined,
          onBlur: onTouched,
          onInvalid: onTouched,
          className: "rounded-xl bg-white text-primary outline-primary",
        }}
      /> : <div aria-hidden="true" className="h-12 rounded-xl bg-white" />}
    </div>
    {showError && !valid && <p id={errorId} className="text-sm text-red-700" role="alert">{invalidMessage}</p>}
    <input type="hidden" name="phone" value={number} readOnly />
  </div>;
}
