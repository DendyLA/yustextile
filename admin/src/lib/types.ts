export type Language = "ru" | "tk" | "en";
export type Localized = Record<Language, string>;

export interface ContentItem {
  id: string;
  slug?: string;
  title?: Localized;
  question?: Localized;
  name?: Localized;
  image?: string | null;
  logo?: string | null;
  images?: string[];
  url?: string | null;
  pdfRu?: string | null;
  categoryId?: string;
  category?: { title: Localized };
  active?: boolean;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type OrderStatus = "NEW" | "CONTACTED" | "CLOSED" | "CANCELLED";

export interface Order {
  id: string;
  name?: string;
  phone: string;
  email: string;
  country: string;
  address: string;
  comment?: string;
  status: OrderStatus;
  createdAt: string;
  items: Array<{ id: string; productTitle: Localized; quantity: number }>;
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export type FieldType =
  | "text"
  | "url"
  | "number"
  | "date"
  | "boolean"
  | "localized"
  | "localizedText"
  | "category"
  | "parent"
  | "image"
  | "file"
  | "images"
  | "specs";

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
}

export interface ResourceDefinition {
  title: string;
  singular: string;
  description: string;
  icon: string;
  fields: FieldDefinition[];
}
