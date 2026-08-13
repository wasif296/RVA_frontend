const platformItems = ['Dashboard', 'Courses', 'My Progress'] as const;
const supportItems = ['Help centre', 'Contact support'] as const;
const legalItems = ['Privacy', 'Terms of use'] as const;

function FooterSection({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item}>
            <span className="text-sm text-fg-muted" aria-disabled="true">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-3 md:px-8">
        <FooterSection title="Platform" items={platformItems} />
        <FooterSection title="Support" items={supportItems} />
        <FooterSection title="Legal" items={legalItems} />
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-sm text-fg-muted md:px-8">
          © {year} Remote VA&apos;s Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
