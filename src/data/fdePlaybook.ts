export const fdePlaybookMarkdown = `
# Awesome Forward Deployment Engineering

> Forward Deployment Engineers are technical special ops: they bridge perfect code and messy reality.

## FDE Persona vs SWE

| Dimension | FDE | Traditional SWE |
| --- | --- | --- |
| Mission | Solve mission-critical business outcomes in live customer environments | Build product features against backlog |
| Context | Ambiguous, multi-stakeholder, fast-changing | Usually bounded by roadmap and specs |
| Core Skill | Diagnose, architect, and deploy under uncertainty | Implement, test, and ship inside product constraints |
| Success Metric | Time-to-value, adoption, reliability in production | Velocity, code quality, release cadence |
| Communication | Executive + technical translation | Engineering-team primary |

### FDE Mindset

- Operate at the edge where data quality, stakeholders, and infra constraints collide.
- Build confidence through artifact discipline and high-tempo iteration.
- Optimize for mission outcomes first, elegance second.

## The Master Curriculum (Phases 1-3)

### Phase 1: Data and Systems Foundations

- Python and Go for production automation and services
- Advanced SQL, DuckDB, and dbt for reliable transformation pipelines
- Data modeling for operational and analytical workflows
- Production debugging and observability fundamentals

### Phase 2: Cloud and Infrastructure Competence

- Terraform for reproducible infrastructure
- GCP design patterns for secure data and model operations
- Workflow and orchestration patterns for deployment pipelines
- CI/CD discipline across analytics and AI systems

### Phase 3: Consulting and Deployment Leadership

- Discovery sessions that convert ambiguity into scoped outcomes
- Storytelling with architecture and metrics for executive trust
- Change management across cross-functional stakeholders
- Program leadership under tight delivery windows

## Applied AI Playbook

### Multi-agent ADK

- Define specialist agents: Planner, Retriever, Tool Operator, and Verifier
- Separate control plane (policy, routing) from execution plane (actions)
- Add deterministic guard steps before user-visible responses

### Evals and AutoSxS

- Build benchmark suites before scaling agent behavior
- Run side-by-side AutoSxS checks for regressions and quality drifts
- Track accuracy, latency, and hallucination rate as release gates

### RAG Blueprint

- Retrieval pipeline: ingest -> chunk -> embed -> index -> rerank -> ground
- Prefer domain-tuned chunking and source-aware metadata
- Validate evidence alignment before final generation

\`\`\`python
# Minimal retrieval + grounding sketch
query_embedding = embed(query)
candidates = vector_index.search(query_embedding, top_k=20)
reranked = rerank(query, candidates)[:5]
answer = generate_with_citations(query, reranked)
\`\`\`

## Consulting Soft Stack

### The Three Whys

1. Why this problem now?
2. Why this approach over alternatives?
3. Why this result should be trusted?

### Pyramid Principle

- Lead with recommendation
- Group supporting arguments by decision theme
- Layer evidence beneath each argument

## Interview Blackbook

### C.A.S.E Framework

- **C - Context**: Frame constraints and mission pressure
- **A - Approach**: Explain architecture and tradeoffs
- **S - Signal**: Quantify outcomes and reliability metrics
- **E - Execute**: Show deployment path and iteration plan

## Artifact Templates

### Site Survey

- Business objective map
- Data landscape and ownership map
- Critical integration surfaces
- Delivery risks and assumptions

### WES (Weekly Executive Summary)

- Outcomes delivered this week
- Risk and mitigation status
- Decision requests for leadership
- Next-week execution plan

### SOW (Statement of Work)

- Scope boundaries and success criteria
- Milestones and acceptance gates
- Governance and communication cadence
- Security and compliance expectations

## Essential Toolchain

- Programming: Python, Go, SQL
- Analytics Engineering: dbt, DuckDB
- Infrastructure: Terraform, GCP
- AI Delivery: ADK, AutoSxS eval harnesses, RAG systems
- Artifacts: Site surveys, Mermaid architecture maps, executive status reports

## Key Lesson

> The best FDEs are not defined by stack depth alone. They are defined by execution clarity under ambiguity.
`;
