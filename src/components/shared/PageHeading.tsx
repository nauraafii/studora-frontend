import type { ReactNode } from "react";

export function PageHeading({ title, description, action, aside }: {
  title: string;
  description?: string;
  action?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div className="page-heading-row">
        <div>
          <div className="title-line"><h1>{title}</h1>{aside}</div>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </div>
    </header>
  );
}
