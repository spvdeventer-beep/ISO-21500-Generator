# Document Generation & Comprehensive Download Suite Repair

This plan resolves the Step 4 synthesis freeze and repairs the document download pipeline, restoring full-fidelity export for direct PDF, Word (.docx), and Markdown (.md) documents with fail-safe client-side synthesis.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following requirements were confirmed during the clarification interview:
> - **Failure Point Identified**: The workflow breaks or hangs during Step 4 Generation when processing documents.
> - **Prioritized Formats**: Full suite of direct file downloads including client-side binary PDF (`.pdf`), Microsoft Word (`.docx`), and Markdown (`.md`), alongside the existing index.css print view.

- **Confirmed Decision 1**: Implement resilient timeout and error recovery for Step 4 generation. If the Gemini proxy endpoint stalls or fails, the application will automatically fall back to the deterministic client-side synthesizer within 8 seconds instead of hanging indefinitely.
- **Confirmed Decision 2**: Fix the fatal runtime error in the completion modal (`markdown` prop undefined error in `StageDocDownloadModal`) that broke the app when advancing to Step 5.
- **Confirmed Decision 3**: Upgrade `downloadBlob` and export utilities with immediate user download dispatch, ensuring reliable file downloads across all browser frames and sandboxed environments.

---

### 1. Overview & Core Concept

- **What It Does**: Enables enterprise project managers to ingest project source materials, run ISO 21500 / PMBOK 7th gap analysis, reliably generate comprehensive governance artifacts without hang-ups, and download their completed documents in any desired format (Clean PDF, Word `.docx`, Markdown `.md`, or CSV action registers).
- **Target Audience / Persona**: Project Management Office (PMO) directors, project managers, and governance leads at Advannotech who require audit-proof, formally formatted governance documents.
- **Key Value**: Eliminates workflow-blocking freezes during synthesis and provides instant, working file downloads without browser sandbox failures or UI crashes.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Generation Initiation (Steps 2 & 3)*: User clicks "Generate Document" or "Quick Generate". The UI smoothly transitions to Step 4 with an active synthesis progress checklist.
  2. *Deterministic Completion (Step 4 -> Step 5)*: Within 3–8 seconds, the document is synthesized (either via Gemini or instantaneous client-side ISO engine). The system safely transitions to Step 5 Review without screen blanking.
  3. *Immediate Download Pop-Up*: The `StageDocDownloadModal` automatically appears, showing verified word count, conforming ISO sections, and 1-click action buttons:
     - **Direct Clean PDF**: Instant `.pdf` binary generation with Advannotech letterhead, table formatting, and digital sign-off blocks.
     - **Export Word (.docx)**: Formal Microsoft Word document with native Word tables, headers, and footers.
     - **Download Markdown (.md)**: Raw editable markdown.
     - **Browser Print Preview**: Clean print layout leveraging the custom `@media print` rules.
  4. *In-Canvas Export Toolbar*: The top toolbar in Step 5 provides persistent, accessible download buttons for quick re-export anytime.

- **Visual Identity & Theme**:
  - *Theme Tokens*: Advannotech Enterprise Dark mode (`#0B1528` background, `#0F172A` card surfaces, `cyan-400` / `sky-400` active accents, `emerald-400` for ISO conformance pass badges).
  - *Typography*: High-contrast sans typography with tabular monospace numerals (`font-mono` / `tabular-nums`) for Document IDs, timestamps, and section metrics.
  - *Feedback & Motion*: Animated spinner and progress checklist during synthesis; non-blocking success toast upon export trigger; graceful fallback banner if network issues occur.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Layer Synthesis (Fast-Failover Architecture)**
  - *Chosen Approach*: The client sends generation requests to `/api/generate` with an 8-second client abort timeout. If the server does not respond with valid markdown within 8 seconds, or if the server returns an error, the client instantly executes `synthesizeDocumentFromSource` locally.
  - *Why*: Guarantees that users never experience an infinite spinner or freeze, even if the LLM backend is rate-limited, cold-starting, or encountering API key issues.
  - *Alternatives Considered*: Waiting 60+ seconds for backend retries. Rejected because it causes user abandonment and perceived application failure.

- **Decision 2: Direct Binary PDF Export (jsPDF) + Native Print Styles**
  - *Chosen Approach*: Provide both direct binary PDF file download (`exportDocumentPdf`) and print stylesheet triggering (`window.print()`).
  - *Why*: Some sandboxed browser environments restrict `window.print()` inside iframes. Having direct binary `.pdf` file generation via `jsPDF` ensures 100% reliable document delivery on all devices.

- **Decision 3: Hardened Download Dispatch (`downloadBlob`)**
  - *Chosen Approach*: Append temporary download anchor to the DOM, invoke click asynchronously, and provide an automatic copy-to-clipboard / modal fallback if download triggers are blocked by iframe sandbox restrictions.
  - *Why*: Prevents browser security exceptions from dropping file download requests.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER WORKSTATION                              │
│                                                                         │
│  ┌───────────────────────┐              ┌────────────────────────────┐  │
│  │ Step 3: Clarifications│ ──Proceed──> │ Step 4: Generation Status  │  │
│  └───────────────────────┘              │  (8s Timeout Guard)        │  │
│                                         └─────────────┬──────────────┘  │
│                                                       │                 │
│                 ┌─────────────────────────────────────┴────────────┐    │
│                 ▼                                                  ▼    │
│      ┌──────────────────────┐                         ┌────────────────┐│
│      │ POST /api/generate   │ (Failure / Timeout)     │ Client-Side    ││
│      │ Express + Gemini API │ ──────────────────────> │ Synthesis      ││
│      └──────────┬───────────┘                         │ Engine (ISO)   ││
│                 │                                     └────────┬───────┘│
│                 │ (Success)                                    │        │
│                 └─────────────────────┬────────────────────────┘        │
│                                       ▼                                 │
│                         ┌───────────────────────────┐                   │
│                         │ Step 5: Document Review   │                   │
│                         └─────────────┬─────────────┘                   │
│                                       ▼                                 │
│                         ┌───────────────────────────┐                   │
│                         │ StageDocDownloadModal     │                   │
│                         │ (wordCount safe prop fix) │                   │
│                         └─────────────┬─────────────┘                   │
│                                       │                                 │
│        ┌──────────────────────────────┼─────────────────────────┐       │
│        ▼                              ▼                         ▼       │
│  ┌───────────┐                 ┌─────────────┐            ┌───────────┐ │
│  │ jsPDF     │                 │ docx Packer │            │ Markdown  │ │
│  │ .pdf File │                 │ .docx File  │            │ .md File  │ │
│  └───────────┘                 └─────────────┘            └───────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Interactive Component & State Mapping**:
  - `App.tsx`: Manages `currentStep`, `isGenerating`, `generationError`, and `generatedMarkdown`. Wraps `fetch('/api/generate')` in `AbortController` (8s timeout) and falls back seamlessly to `synthesizeDocumentFromSource`. Passes `generatedMarkdown` consistently.
  - `Step4Generate.tsx`: Displays generation stages with animated feedback and clear error recovery CTAs ("Back to Clarifications", "Retry with Local Synthesizer").
  - `Step5Review.tsx`: Receives valid markdown, passes `markdown={markdown}` into `StageDocDownloadModal` (resolving the crash), and provides top-bar triggers for PDF, Word, Markdown, and CSV.
  - `StageDocDownloadModal.tsx`: Adds safe nullish coalescing `(markdown || '').trim()` to prevent rendering crashes, and routes clicks directly to `exportDocumentPdf`, `exportDocx`, and `exportMarkdown`.
  - `exportUtils.ts`: Hardens `downloadBlob` with DOM attachment, click queueing, error catching, and MIME type enforcement.
