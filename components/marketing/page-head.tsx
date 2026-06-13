import type { ReactNode } from "react";

export function PageHead({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="pagehead">
      <div className="lk-wrap inner">
        <span className="selo sec-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {actions ? <div className="pagehead-acoes">{actions}</div> : null}
      </div>
    </section>
  );
}
