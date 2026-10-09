import { notFound } from "next/navigation";
import { NewsletterPage } from "@/components/newsletter/newsletter-page";
import { OrdersPage } from "@/components/orders/orders-page";
import { ResourcePage } from "@/components/resources/resource-page";
import { SitePage } from "@/components/site/site-page";
import { resources, siteSections } from "@/lib/resources";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (section === "orders") return <OrdersPage />;
  if (section === "newsletter") return <NewsletterPage />;
  if (section in siteSections) {
    return (
      <SitePage key={section} section={section as keyof typeof siteSections} />
    );
  }
  if (section in resources)
    return <ResourcePage key={section} resource={section} />;

  notFound();
}
