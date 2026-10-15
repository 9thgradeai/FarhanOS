# FarhanOS Knowledge Base

Production-grade RAG knowledge system for Caffeine.

## Structure

- `profile/` — Identity, bio, and current focus
- `experience/roles/` — Detailed role documents
- `projects/` — One document per product/research project
- `research/papers/` — Individual research papers
- `skills/` — Skill domain documents
- `technologies/` — Technology index and relationships
- `certifications/` — Professional certifications
- `contact/` — Contact information
- `resume/` — Resume sections
- `timeline/` — Career and project milestones
- `faq/` — Frequently asked questions
- `architecture/` — Knowledge graph and maintenance guides
- `achievements/` — Achievements and impact metrics
- `education/` — Educational background
- `metadata/` — Schema standards
- `assets/` — Images, PDFs, and media

## Usage

This knowledge base is consumed by `api/knowledge-loader.ts`, which provides:
- `searchKnowledge(query, options)` — TF-IDF hybrid retrieval with metadata filtering
- `getRelated(docId, limit)` — Relationship-based expansion
- `getAllDocs()` — Full public document list
- `listCategories()` — Category index

## Retrieval Strategy

- Hybrid keyword/semantic search
- Metadata filtering (category, tags, priority, confidence)
- Relationship graph traversal
- Time-based and priority-weighted ranking

## Maintenance

See `architecture/MAINTENANCE.md` for guidelines on adding documents, updating relationships, and re-indexing.
