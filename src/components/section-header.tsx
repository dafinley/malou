export function SectionHeader({
  kicker,
  title,
  copy,
  badge
}: {
  kicker: string;
  title: string;
  copy: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="section-header">
      <div className="section-header-top">
        <p className="eyebrow">{kicker}</p>
        {badge}
      </div>
      <h2>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

export function RoadmapBadge({ children = "roadmap" }: { children?: React.ReactNode }) {
  return <span className="roadmap-badge">{children}</span>;
}
