'use client';

import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Boxes,
  Database,
  GitBranch,
  LayoutTemplate,
  Link2,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Unlink2,
  Workflow,
  Wrench,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { SectionCard } from '@/components/primitives/SectionCard';

type ComponentType = 'llm' | 'vectordb' | 'api' | 'agent' | 'pipeline';

type ArchComponent = {
  id: string;
  type: ComponentType;
  label: string;
  x: number;
  y: number;
};

type Connection = {
  from: string;
  to: string;
};

type ArchitectureTemplate = {
  id: string;
  label: string;
  nodes: Array<{ type: ComponentType; label: string; x: number; y: number }>;
  edges: Array<{ from: string; to: string }>;
};

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
} | null;

const COMPONENT_TYPES: Array<{ type: ComponentType; label: string; icon: React.ReactNode }> = [
  { type: 'llm', label: 'LLM', icon: <Bot className="size-4" /> },
  { type: 'vectordb', label: 'Vector DB', icon: <Database className="size-4" /> },
  { type: 'api', label: 'API', icon: <Boxes className="size-4" /> },
  { type: 'agent', label: 'Agent', icon: <Workflow className="size-4" /> },
  { type: 'pipeline', label: 'Data Pipeline', icon: <GitBranch className="size-4" /> },
];

const NODE_WIDTH = 168;
const NODE_HEIGHT = 72;
const CANVAS_W = 1300;
const CANVAS_H = 760;

const ARCH_TEMPLATES: ArchitectureTemplate[] = [
  {
    id: 'rag-blueprint',
    label: 'RAG Blueprint',
    nodes: [
      { type: 'api', label: 'API Gateway', x: 70, y: 220 },
      { type: 'agent', label: 'Orchestrator Agent', x: 320, y: 220 },
      { type: 'vectordb', label: 'Vector Store', x: 570, y: 140 },
      { type: 'llm', label: 'Inference LLM', x: 570, y: 300 },
      { type: 'pipeline', label: 'Ingestion Pipeline', x: 850, y: 140 },
    ],
    edges: [
      { from: 'API Gateway', to: 'Orchestrator Agent' },
      { from: 'Orchestrator Agent', to: 'Vector Store' },
      { from: 'Orchestrator Agent', to: 'Inference LLM' },
      { from: 'Ingestion Pipeline', to: 'Vector Store' },
    ],
  },
  {
    id: 'agent-platform',
    label: 'Agent Platform',
    nodes: [
      { type: 'api', label: 'Task API', x: 90, y: 210 },
      { type: 'agent', label: 'Planner Agent', x: 330, y: 120 },
      { type: 'agent', label: 'Executor Agent', x: 330, y: 300 },
      { type: 'llm', label: 'Reasoning LLM', x: 580, y: 120 },
      { type: 'pipeline', label: 'Telemetry Stream', x: 580, y: 300 },
    ],
    edges: [
      { from: 'Task API', to: 'Planner Agent' },
      { from: 'Planner Agent', to: 'Reasoning LLM' },
      { from: 'Planner Agent', to: 'Executor Agent' },
      { from: 'Executor Agent', to: 'Telemetry Stream' },
    ],
  },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function SystemDesignSimulator({ sectionId = 'system-simulator' }: { sectionId?: string }) {
  const [components, setComponents] = useState<ArchComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [scale, setScale] = useState(1);
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const addComponent = (type: ComponentType) => {
    const componentType = COMPONENT_TYPES.find((c) => c.type === type);
    if (!componentType) return;

    const index = components.length;
    const col = index % 4;
    const row = Math.floor(index / 4);

    const newComponent: ArchComponent = {
      id: `${type}-${index + 1}`,
      type,
      label: `${componentType.label} ${components.filter((c) => c.type === type).length + 1}`,
      x: 40 + col * 220,
      y: 40 + row * 120,
    };

    setComponents((prev) => [...prev, newComponent]);
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setConnections((prev) => prev.filter((conn) => conn.from !== id && conn.to !== id));
    if (selectedFrom === id) {
      setSelectedFrom(null);
    }
    if (selectedConnection?.startsWith(`${id}-`) || selectedConnection?.endsWith(`-${id}`)) {
      setSelectedConnection(null);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = ARCH_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;

    const normalizedNodes: ArchComponent[] = template.nodes.map((node, index) => ({
      id: `tpl-${template.id}-${index + 1}`,
      type: node.type,
      label: node.label,
      x: node.x,
      y: node.y,
    }));

    const resolvedEdges: Connection[] = template.edges
      .map((edge) => {
        const from = normalizedNodes.find((node) => node.label === edge.from)?.id;
        const to = normalizedNodes.find((node) => node.label === edge.to)?.id;
        if (!from || !to) return null;
        return { from, to };
      })
      .filter((edge): edge is Connection => Boolean(edge));

    setComponents(normalizedNodes);
    setConnections(resolvedEdges);
    setSelectedFrom(null);
    setSelectedConnection(null);
  };

  const removeSelectedConnection = () => {
    if (!selectedConnection) return;
    const [from, to] = selectedConnection.split('::');
    setConnections((prev) => prev.filter((conn) => !(conn.from === from && conn.to === to)));
    setSelectedConnection(null);
  };

  const connectComponents = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const alreadyConnected = connections.some((c) => c.from === fromId && c.to === toId);
    if (!alreadyConnected) {
      setConnections((prev) => [...prev, { from: fromId, to: toId }]);
    }
    setSelectedFrom(null);
  };

  const handleNodeClick = (id: string) => {
    if (selectedFrom === id) {
      setSelectedFrom(null);
      return;
    }
    if (selectedFrom) {
      connectComponents(selectedFrom, id);
      return;
    }
    setSelectedFrom(id);
  };

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>, node: ArchComponent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const pointerX = (event.clientX - rect.left + canvas.scrollLeft) / scale;
    const pointerY = (event.clientY - rect.top + canvas.scrollTop) / scale;

    setDragging({ id: node.id, offsetX: pointerX - node.x, offsetY: pointerY - node.y });
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const pointerX = (event.clientX - rect.left + canvasRef.current.scrollLeft) / scale;
    const pointerY = (event.clientY - rect.top + canvasRef.current.scrollTop) / scale;

    setComponents((prev) =>
      prev.map((node) => {
        if (node.id !== dragging.id) return node;
        return {
          ...node,
          x: clamp(pointerX - dragging.offsetX, 8, CANVAS_W - NODE_WIDTH - 8),
          y: clamp(pointerY - dragging.offsetY, 8, CANVAS_H - NODE_HEIGHT - 8),
        };
      }),
    );
  };

  const endDrag = () => setDragging(null);

  const bottlenecks = useMemo(() => {
    const analysis: string[] = [];

    components.forEach((comp) => {
      const hasConnection = connections.some((c) => c.from === comp.id || c.to === comp.id);
      if (!hasConnection && components.length > 1) {
        analysis.push(`${comp.label} is isolated and likely missing an integration path.`);
      }
    });

    const apiCount = components.filter((c) => c.type === 'api').length;
    if (apiCount > 2) {
      analysis.push('Multiple API nodes detected. Consider an API gateway for request fan-in and governance.');
    }

    const vectorDbComps = components.filter((c) => c.type === 'vectordb');
    const llmComps = components.filter((c) => c.type === 'llm');
    if (vectorDbComps.length > 0 && llmComps.length > 0) {
      const hasRetrievalPath = connections.some(
        (c) =>
          (vectorDbComps.some((v) => v.id === c.from) && llmComps.some((l) => l.id === c.to)) ||
          (vectorDbComps.some((v) => v.id === c.to) && llmComps.some((l) => l.id === c.from)),
      );
      if (!hasRetrievalPath) {
        analysis.push('Vector storage exists but no retrieval path to LLM nodes is connected.');
      }
    }

    if (!analysis.length && components.length) {
      analysis.push('No critical bottlenecks detected. Architecture topology is consistent.');
    }

    return analysis;
  }, [components, connections]);

  const flowSummary = useMemo(() => {
    if (!components.length) {
      return 'Add nodes to generate an architecture flow summary.';
    }

    const ordered = [...components]
      .sort((a, b) => a.x - b.x || a.y - b.y)
      .map((c) => c.label)
      .join(' -> ');

    return `Current flow path: ${ordered}.`;
  }, [components]);

  const architectureHealth = useMemo(() => {
    if (!components.length) return 'No architecture nodes yet.';
    const connectedCount = components.filter((comp) =>
      connections.some((conn) => conn.from === comp.id || conn.to === comp.id),
    ).length;
    const ratio = Math.round((connectedCount / components.length) * 100);

    if (ratio < 50) return `Low connectivity (${ratio}%). Add integration paths between core services.`;
    if (ratio < 80) return `Moderate connectivity (${ratio}%). Review isolated components before deployment.`;
    return `High connectivity (${ratio}%). Topology is well-linked for a draft design.`;
  }, [components, connections]);

  return (
    <SectionCard
      id={sectionId}
      title="System Design Simulator"
      subtitle="Create architecture diagrams visually, connect components, and inspect flow bottlenecks in real time"
      icon={<Wrench className="size-6" />}
    >
      <div className="space-y-4">
        <div className="surface-muted p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">Component Palette</p>
            <div className="flex flex-wrap items-center gap-2">
              {ARCH_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template.id)}
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-2 py-1 text-xs text-[var(--m3-on-surface-variant)]"
                >
                  <LayoutTemplate className="size-3" />
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMPONENT_TYPES.map((comp) => (
              <button
                key={comp.type}
                type="button"
                onClick={() => addComponent(comp.type)}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-3 py-2 text-sm text-[var(--m3-on-surface)]"
              >
                <Plus className="size-4" />
                {comp.icon}
                {comp.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setComponents([]);
                setConnections([]);
                setSelectedFrom(null);
                setSelectedConnection(null);
              }}
              className="ml-auto inline-flex items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-3 py-2 text-sm text-[var(--m3-on-surface-variant)]"
            >
              <RefreshCcw className="size-4" />
              Clear Canvas
            </button>
          </div>
        </div>

        <div className="surface-muted overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--m3-outline)] px-3 py-2">
            <div className="text-sm text-[var(--m3-on-surface-variant)]">
              {components.length} nodes | {connections.length} connections
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={removeSelectedConnection}
                disabled={!selectedConnection}
                className="rounded-md border border-[var(--m3-outline)] px-2 py-1 text-[var(--m3-on-surface-variant)] disabled:opacity-50"
                title="Remove selected connection"
              >
                <Unlink2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setScale((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(2))))}
                className="rounded-md border border-[var(--m3-outline)] px-2 py-1 text-[var(--m3-on-surface-variant)]"
              >
                <ZoomOut className="size-4" />
              </button>
              <span className="w-12 text-center text-xs text-[var(--m3-on-surface-variant)]">{Math.round(scale * 100)}%</span>
              <button
                type="button"
                onClick={() => setScale((prev) => Math.min(1.5, Number((prev + 0.1).toFixed(2))))}
                className="rounded-md border border-[var(--m3-outline)] px-2 py-1 text-[var(--m3-on-surface-variant)]"
              >
                <ZoomIn className="size-4" />
              </button>
            </div>
          </div>

          <div
            ref={canvasRef}
            className="relative h-[420px] overflow-auto"
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div
              className="relative"
              style={{
                width: CANVAS_W * scale,
                height: CANVAS_H * scale,
                backgroundImage:
                  'linear-gradient(to right, color-mix(in oklab, var(--m3-outline) 18%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--m3-outline) 18%, transparent) 1px, transparent 1px)',
                backgroundSize: `${32 * scale}px ${32 * scale}px`,
              }}
            >
              <svg className="absolute left-0 top-0 h-full w-full">
                {connections.map((conn) => {
                  const fromNode = components.find((c) => c.id === conn.from);
                  const toNode = components.find((c) => c.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  const edgeKey = `${conn.from}::${conn.to}`;
                  const isSelected = selectedConnection === edgeKey;

                  return (
                    <g key={edgeKey}>
                      <line
                        x1={(fromNode.x + NODE_WIDTH) * scale}
                        y1={(fromNode.y + NODE_HEIGHT / 2) * scale}
                        x2={toNode.x * scale}
                        y2={(toNode.y + NODE_HEIGHT / 2) * scale}
                        stroke={isSelected ? 'var(--m3-accent)' : 'var(--m3-primary)'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        strokeDasharray="4 3"
                        className="pointer-events-auto cursor-pointer"
                        onClick={() => setSelectedConnection(edgeKey)}
                      />
                    </g>
                  );
                })}
              </svg>

              {components.map((node) => {
                const typeInfo = COMPONENT_TYPES.find((c) => c.type === node.type);
                return (
                  <motion.div
                    key={node.id}
                    className="absolute"
                    style={{ left: node.x * scale, top: node.y * scale, width: NODE_WIDTH * scale }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onPointerDown={(e) => beginDrag(e, node)}
                      onClick={() => handleNodeClick(node.id)}
                      className={`surface flex cursor-pointer items-start justify-between gap-2 p-2 text-left ${
                        selectedFrom === node.id ? 'border-[var(--m3-primary)]' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium text-[var(--m3-on-surface)]">
                          {typeInfo?.icon}
                          <span className="truncate">{node.label}</span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--m3-on-surface-variant)]">Drag to move | click to connect</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeComponent(node.id);
                        }}
                        className="rounded-md border border-[var(--m3-outline)] p-1 text-[var(--m3-on-surface-variant)]"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--m3-outline)] px-3 py-2 text-xs text-[var(--m3-on-surface-variant)]">
            <Link2 className="size-3" />
            Click one node and then another to create a directed connection.
            {selectedFrom ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--m3-outline)] px-2 py-0.5">
                <Unlink2 className="size-3" />
                Source: {components.find((c) => c.id === selectedFrom)?.label}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="surface-muted p-4">
            <div className="mb-2 flex items-center gap-2">
              <Search className="size-4 text-[var(--m3-on-surface-variant)]" />
              <h3 className="text-sm font-semibold text-[var(--m3-on-surface)]">Flow Explanation</h3>
            </div>
            <p className="text-sm leading-6 text-[var(--m3-on-surface-variant)]">{flowSummary}</p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-md border border-[var(--m3-outline)] px-3 py-2 text-xs text-[var(--m3-on-surface-variant)]">
              <ArrowRight className="size-3" />
              {architectureHealth}
            </p>
          </div>

          <div className="surface-muted p-4">
            <div className="mb-2 flex items-center gap-2">
              <Wrench className="size-4 text-[var(--m3-on-surface-variant)]" />
              <h3 className="text-sm font-semibold text-[var(--m3-on-surface)]">Bottleneck Analysis</h3>
            </div>
            <ul className="space-y-2 text-sm text-[var(--m3-on-surface-variant)]">
              {bottlenecks.map((line) => (
                <li key={line} className="rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-3 py-2">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
