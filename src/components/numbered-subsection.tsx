export function NumberedSubsection({
  num,
  title,
  formula,
  takeaway,
  children
}: {
  num: string;
  title: string;
  formula?: string;
  takeaway?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="numbered-subsection">
      <header className="numbered-subsection-header">
        <div className="numbered-subsection-title">
          <span className="numbered-subsection-num">{num}</span>
          <h3>{title}</h3>
        </div>
        {formula ? <code className="numbered-subsection-formula">{formula}</code> : null}
      </header>
      <div className="numbered-subsection-body">{children}</div>
      {takeaway ? (
        <p className="numbered-subsection-takeaway">
          <span aria-hidden>→</span>
          {takeaway}
        </p>
      ) : null}
    </section>
  );
}
