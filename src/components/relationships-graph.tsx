"use client";

export type RelationshipNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  sub: string;
  color: string;
};

export type RelationshipEdge = {
  from: string;
  to: string;
  label?: string;
  color: string;
  dash?: boolean;
};

export function RelationshipsGraph({
  title,
  nodes,
  edges,
  viewBox = "0 0 720 300"
}: {
  title: string;
  nodes: RelationshipNode[];
  edges: RelationshipEdge[];
  viewBox?: string;
}) {
  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <section className="relationships-graph">
      <header>
        <h3>{title}</h3>
      </header>
      <svg viewBox={viewBox} role="img" aria-label={title}>
        {edges.map((edge, i) => {
          const from = byId.get(edge.from);
          const to = byId.get(edge.to);
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          return (
            <g key={`edge-${i}`}>
              <line
                opacity={0.55}
                stroke={edge.color}
                strokeDasharray={edge.dash ? "3 4" : undefined}
                strokeWidth={1.2}
                x1={from.x}
                x2={to.x}
                y1={from.y}
                y2={to.y}
              />
              {edge.label ? (
                <g transform={`translate(${mx}, ${my})`}>
                  <rect
                    fill="var(--bg)"
                    height={16}
                    rx={3}
                    stroke={edge.color}
                    width={Math.max(28, edge.label.length * 7 + 8)}
                    x={-Math.max(28, edge.label.length * 7 + 8) / 2}
                    y={-9}
                  />
                  <text
                    fill={edge.color}
                    fontFamily="var(--font-mono)"
                    fontSize={10}
                    textAnchor="middle"
                    y={3}
                  >
                    {edge.label}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
        {nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <rect
              fill="var(--surface-2)"
              height={44}
              rx={8}
              stroke={node.color}
              width={144}
              x={-72}
              y={-22}
            />
            <text
              fill="var(--text)"
              fontFamily="Inter, sans-serif"
              fontSize={12}
              fontWeight={500}
              textAnchor="middle"
              y={-2}
            >
              {node.label}
            </text>
            <text
              fill={node.color}
              fontFamily="var(--font-mono)"
              fontSize={9.5}
              textAnchor="middle"
              y={14}
            >
              {node.sub}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
