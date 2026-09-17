export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold text-navy">Common questions</h2>
      <div className="mt-4 divide-y divide-navy/10 rounded-xl border border-navy/10 bg-white">
        {items.map((f) => (
          <details key={f.q} className="px-4 py-3">
            <summary className="cursor-pointer font-medium text-navy">{f.q}</summary>
            <p className="mt-2 text-sm leading-relaxed text-navy/70">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
