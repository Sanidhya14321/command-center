'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ZoomIn, ZoomOut } from 'lucide-react';

interface ArchComponent {
  id: string;
  type: 'llm' | 'vectordb' | 'api' | 'agent' | 'pipeline';
  label: string;
  x: number;
  y: number;
  color: string;
}

interface Connection {
  from: string;
  to: string;
}

const COMPONENT_TYPES = [
  { type: 'llm', label: 'LLM', icon: '🧠', color: '#d0bcff' },
  { type: 'vectordb', label: 'Vector DB', icon: '🗄️', color: '#64b5f6' },
  { type: 'api', label: 'API', icon: '🔌', color: '#81c784' },
  { type: 'agent', label: 'Agent', icon: '🤖', color: '#ffb74d' },
  { type: 'pipeline', label: 'Pipeline', icon: '⚙️', color: '#ba68c8' },
];

export function SystemDesignSimulator({ sectionId = 'system-simulator' }: { sectionId?: string }) {
  const [components, setComponents] = useState<ArchComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);

  const addComponent = (type: string) => {
    const componentType = COMPONENT_TYPES.find((c) => c.type === type);
    if (!componentType) return;

    const newComponent: ArchComponent = {
      id: `${type}-${Date.now()}`,
      type: type as ArchComponent['type'],
      label: `${componentType.label} ${components.filter((c) => c.type === type).length + 1}`,
      x: Math.random() * 300,
      y: Math.random() * 200,
      color: componentType.color,
    };

    setComponents([...components, newComponent]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
    setConnections(connections.filter((conn) => conn.from !== id && conn.to !== id));
  };

  const connectComponents = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const alreadyConnected = connections.some((c) => c.from === fromId && c.to === toId);
    if (!alreadyConnected) {
      setConnections([...connections, { from: fromId, to: toId }]);
    }
    setSelectedFrom(null);
  };

  const handleComponentClick = (id: string) => {
    if (selectedFrom === id) {
      setSelectedFrom(null);
    } else if (selectedFrom) {
      connectComponents(selectedFrom, id);
    } else {
      setSelectedFrom(id);
    }
  };

  const analyzeBottlenecks = () => {
    const analysis: string[] = [];

    // Check for isolated components
    components.forEach((comp) => {
      const hasConnection =
        connections.some((c) => c.from === comp.id || c.to === comp.id);
      if (!hasConnection && components.length > 1) {
        analysis.push(`⚠️ ${comp.label} is isolated - may indicate missing integration`);
      }
    });

    // Check for API bottlenecks
    const apiCount = components.filter((c) => c.type === 'api').length;
    if (apiCount > 2) {
      analysis.push('⚡ Multiple APIs detected - consider API gateway for centralization');
    }

    // Check for vector DB connections
    const vectorDbComps = components.filter((c) => c.type === 'vectordb');
    const llmComps = components.filter((c) => c.type === 'llm');
    if (vectorDbComps.length > 0 && llmComps.length > 0) {
      const hasConnection = connections.some(
        (c) =>
          (vectorDbComps.some((v) => v.id === c.from) && llmComps.some((l) => l.id === c.to)) ||
          (vectorDbComps.some((v) => v.id === c.to) && llmComps.some((l) => l.id === c.from))
      );
      if (!hasConnection) {
        analysis.push('🔗 Vector DB detected but not connected to LLM - configure RAG pipeline');
      }
    }

    // Check for agent setup
    const agents = components.filter((c) => c.type === 'agent');
    if (agents.length > 0 && llmComps.length === 0) {
      analysis.push('⚠️ Agent without LLM foundation - agents need language models');
    }

    if (analysis.length === 0 && components.length > 0) {
      analysis.push('✅ Architecture looks good - all components are connected');
    }

    return analysis;
  };

  const getBottlenecks = analyzeBottlenecks();

  return (
    <section id={sectionId} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="rounded-[24px] border border-[var(--m3-outline)]/30 bg-gradient-to-br from-[var(--m3-surface-container-low)] to-[var(--m3-surface-container)] p-6 md:p-8"
      >
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-bold text-[var(--m3-on-surface)]">
            🏗️ System Design Simulator
          </h2>
          <p className="text-sm text-[var(--m3-on-surface-variant)]">
            Drag & drop AI system components. Click to connect. See bottlenecks instantly.
          </p>
        </div>

        {/* Component Palette */}
        <div className="mb-6 space-y-3">
          <p className="text-xs font-semibold text-[var(--m3-on-surface-variant)] uppercase">
            Add Components
          </p>
          <div className="flex flex-wrap gap-2">
            {COMPONENT_TYPES.map((comp) => (
              <button
                key={comp.type}
                onClick={() => addComponent(comp.type)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition border border-[var(--m3-outline)]/40 hover:bg-[var(--m3-surface-container-high)]"
              >
                <Plus className="w-4 h-4" />
                {comp.icon} {comp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="mb-6 rounded-xl border-2 border-[var(--m3-outline)]/30 bg-[var(--m3-surface-container-lowest)] overflow-hidden relative">
          <div className="flex items-center justify-between p-3 border-b border-[var(--m3-outline)]/20 bg-[var(--m3-surface-container-high)]/50">
            <span className="text-xs text-[var(--m3-on-surface-variant)]">
              {components.length} components • {connections.length} connections
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                className="p-2 hover:bg-[var(--m3-surface-container)] rounded text-sm"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs px-2 py-2">{(scale * 100).toFixed(0)}%</span>
              <button
                onClick={() => setScale(Math.min(2, scale + 0.1))}
                className="p-2 hover:bg-[var(--m3-surface-container)] rounded text-sm"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
          >
            {connections.map((conn) => {
              const fromComp = components.find((c) => c.id === conn.from);
              const toComp = components.find((c) => c.id === conn.to);
              if (!fromComp || !toComp) return null;

              return (
                <line
                  key={`${conn.from}-${conn.to}`}
                  x1={fromComp.x + 60}
                  y1={fromComp.y + 40}
                  x2={toComp.x + 60}
                  y2={toComp.y + 40}
                  stroke="var(--m3-primary)"
                  strokeWidth="2"
                  opacity="0.6"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                <polygon points="0 0, 10 5, 0 10" fill="var(--m3-primary)" />
              </marker>
            </defs>
          </svg>

          <div
            className="relative w-full h-96 overflow-auto bg-gradient-to-br from-[var(--m3-surface-container-low)] to-[var(--m3-surface-container-high)]"
            style={{ background: 'url(\'data:image/svg+xml,%3Csvg width="40" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23381e72" fill-opacity="0.05"%3E%3Cpath d="M0 0h40v40H0z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')' }}
          >
            <AnimatePresence>
              {components.map((comp) => {
                const typeInfo = COMPONENT_TYPES.find((c) => c.type === comp.type);
                return (
                  <div
                    key={comp.id}
                    className="absolute"
                    style={{
                      left: `${comp.x}px`,
                      top: `${comp.y}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: '0 0',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onMouseDown={() => setDraggingId(comp.id)}
                      onClick={() => handleComponentClick(comp.id)}
                      className={`w-24 py-3 px-2 rounded-lg border-2 transition cursor-pointer text-center text-xs font-semibold ${
                        selectedFrom === comp.id
                          ? 'border-[var(--m3-accent)] bg-[var(--m3-accent)]/20'
                          : 'border-[var(--m3-outline)]/40 hover:border-[var(--m3-primary)]/60'
                      }`}
                      style={{ backgroundColor: `${typeInfo?.color}20` }}
                    >
                      <div className="text-lg mb-1">{typeInfo?.icon}</div>
                      <div className="text-[var(--m3-on-surface)]">{comp.label}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeComponent(comp.id);
                        }}
                        className="mt-1 text-xs text-[var(--m3-error)] hover:bg-[var(--m3-error)]/20 w-full p-1 rounded"
                      >
                        <Trash2 className="w-3 h-3 inline" />
                      </button>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-lg bg-[var(--m3-surface-container-high)]/40 border border-[var(--m3-outline)]/20 text-xs text-[var(--m3-on-surface-variant)]">
          <p className="mb-2 font-semibold">How to use:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Add components from the palette above</li>
            <li>Click a component, then click another to create a connection</li>
            <li>Bottleneck analysis updates automatically</li>
          </ul>
        </div>
      </motion.div>

      {/* Bottleneck Analysis */}
      {getBottlenecks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-[var(--m3-outline)]/30 bg-gradient-to-br from-[var(--m3-surface-container-high)]/50 to-[var(--m3-surface-container)] p-6"
        >
          <h3 className="font-bold text-[var(--m3-on-surface)] mb-4">🔍 Architecture Analysis</h3>
          <div className="space-y-2">
            {getBottlenecks.map((bottleneck, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-lg bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline)]/20 text-sm text-[var(--m3-on-surface)]"
              >
                {bottleneck}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
