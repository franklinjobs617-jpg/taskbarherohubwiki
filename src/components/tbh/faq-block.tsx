import { faqPage } from "@/lib/schema-ld";

export type FaqItem = { question: string; answer: string };

export function FaqBlock({
  faqs,
  title,
}: {
  faqs: FaqItem[];
  title?: string;
}) {
  if (!faqs.length) return null;

  const jsonLd = faqPage(faqs.map((f) => ({ question: f.question, answer: f.answer })));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mt-8 border border-border-default bg-bg-panel p-5">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          {title ?? "FAQ"}
        </h2>
        <dl className="divide-y divide-border-default">
          {faqs.map((faq, i) => (
            <div key={i} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-sm font-medium text-text-primary">
                {faq.question}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-text-secondary">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
