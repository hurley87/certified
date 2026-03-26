# Claude Certified Architect - Foundations: Practice Exam App

## Product Requirements Document

### Design Decisions (Resolved)

| # | Decision | Resolution | Rationale |
|---|----------|------------|-----------|
| 1 | Question bank | 160 questions exist in `src/data/questions.ts`. Short task statement codes (e.g., "3.1") are acceptable — not displayed in UI. | Data layer is complete; targeted expansion improved topic coverage. |
| 2 | State management | React context only (no localStorage). | Keeps it simple. If a database is added later, context still handles client-side UI state while the DB handles persistence — no rework needed. |
| 3 | Scenario selection | Draw from all 6 scenarios per exam. | Practice tool prioritizes content coverage over exam simulation fidelity. |
| 4 | Timer | Timed for fixed-length modes (15/30/60), untimed for "All". | Supports both focused drills and simulation-style pacing without adding persistence complexity. |
| 5 | Exam history | Fire-and-forget. No localStorage persistence of past sessions. | Database is the right persistence layer if history is added later. |
| 6 | "Review All Questions" | Reuses `/exam` route with a `reviewMode` flag in context. All questions shown in answered state. | No new route or duplicate UI needed. |
| 7 | Dark mode | Supported via `prefers-color-scheme`. No manual toggle. | Tailwind v4 dark variants are near-zero effort. |
| 8 | Answer shuffling | Shuffled copies stored directly in context. Source data in `questions.ts` never mutated. | Every component reads `question.correctAnswer` directly — no mapping lookups. |
| 9 | Types location | Shared types in `src/lib/types.ts`. Data file imports from there. | Separates app types (`ExamSession`, `UserAnswer`) from the question data file. |
| 10 | Build order | Types/constants -> Exam logic -> Context provider -> Home -> Exam -> Results -> Polish | Data and logic validated before touching UI. |

---

## 1. Overview

### Purpose
A web-based practice exam application that simulates the Claude Certified Architect - Foundations (CCA-F) certification exam. The app draws from a large question bank to generate a unique test every attempt, provides immediate feedback with explanations after each answer, and tracks performance across all 5 exam domains.

### Target Users
Software architects and developers preparing for the CCA-F certification exam who have studied the official Anthropic Academy courses and exam guide materials.

### Success Criteria
- Each practice exam presents a different set of questions in randomized order
- Immediate right/wrong feedback with detailed explanations after every answer
- Final score calculated with proper domain weighting matching the real exam
- Pass/fail determination using the official 720/1000 threshold

---

## 2. Exam Background

### The Real Exam
The CCA-F certification validates that practitioners can make informed decisions about tradeoffs when implementing real-world solutions with Claude. It tests foundational knowledge across Claude Code, the Claude Agent SDK, the Claude API, and Model Context Protocol (MCP).

- **Format:** Multiple choice (1 correct answer, 3 distractors)
- **Scoring:** Scaled score 100-1,000. Minimum passing score: 720.
- **Structure:** Scenario-based. 4 scenarios presented per exam (randomly selected from 6 possible). Each scenario frames a set of questions.
- **No penalty for guessing.** Unanswered questions scored as incorrect.

### 5 Content Domains

| Domain | Name | Weight |
|--------|------|--------|
| 1 | Agentic Architecture & Orchestration | 27% |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

### 6 Exam Scenarios

| # | Name | Description |
|---|------|-------------|
| 1 | Customer Support Resolution Agent | Building a customer support agent using Claude Agent SDK with MCP tools (get_customer, lookup_order, process_refund, escalate_to_human). Target: 80%+ first-contact resolution. |
| 2 | Code Generation with Claude Code | Using Claude Code for code generation, refactoring, debugging, and documentation with custom slash commands and CLAUDE.md configurations. |
| 3 | Multi-Agent Research System | Coordinator agent delegates to specialized subagents: web search, document analysis, synthesis, and report generation. Produces comprehensive cited reports. |
| 4 | Developer Productivity with Claude | Building developer productivity tools using Claude Agent SDK. Agent helps explore codebases, understand legacy systems, generate boilerplate, and automate tasks with built-in tools and MCP. |
| 5 | Claude Code for Continuous Integration | Integrating Claude Code into CI/CD pipelines for automated code reviews, test generation, and PR feedback. Designing prompts for actionable feedback with minimal false positives. |
| 6 | Structured Data Extraction | Building a structured data extraction system using Claude. Extracts information from unstructured documents, validates with JSON schemas, handles edge cases, integrates with downstream systems. |

---

## 3. Data Model

### TypeScript Types

```typescript
// Domain identifiers matching the 5 exam domains
type DomainId = 1 | 2 | 3 | 4 | 5;

// Scenario identifiers matching the 6 exam scenarios
type ScenarioId = 1 | 2 | 3 | 4 | 5 | 6;

// Answer option labels
type AnswerLabel = "A" | "B" | "C" | "D";

// Individual question in the bank
// Note: domainName and scenarioName are looked up from DOMAIN_NAMES/SCENARIO_NAMES,
// not stored per-question (see src/data/questions.ts)
interface Question {
  id: number;
  domain: DomainId;
  scenario: ScenarioId;
  taskStatement: string; // e.g. "1.1", "2.3", "4.5"
  question: string;
  options: { label: AnswerLabel; text: string }[];
  correctAnswer: AnswerLabel;
  explanation: string;
}

// Domain metadata
interface DomainInfo {
  id: DomainId;
  name: string;
  weight: number; // percentage as decimal (0.27, 0.18, etc.)
  questionTarget: number; // ideal count in a 30-question exam
}

// Scenario metadata
interface ScenarioInfo {
  id: ScenarioId;
  name: string;
  description: string;
  primaryDomains: DomainId[];
}

// A user's answer to a single question
interface UserAnswer {
  questionId: number;
  selectedAnswer: AnswerLabel | null;
  isCorrect: boolean;
}

// Results for a single domain
interface DomainResult {
  domain: DomainId;
  domainName: string;
  weight: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}

// Complete exam session (held in React context, fire-and-forget)
interface ExamSession {
  questionCount: number;
  questions: Question[]; // shuffled copies with remapped correctAnswer
  answers: UserAnswer[];
  currentQuestionIndex: number;
  reviewMode: boolean; // true when navigating back from results via "Review All Questions"
  domainResults: DomainResult[];
  rawScore: number; // percentage correct (0-100)
  scaledScore: number; // 100-1000
  passed: boolean; // scaledScore >= 720
}
```

### Domain Definitions

```typescript
const DOMAINS: DomainInfo[] = [
  { id: 1, name: "Agentic Architecture & Orchestration", weight: 0.27, questionTarget: 8 },
  { id: 2, name: "Tool Design & MCP Integration", weight: 0.18, questionTarget: 5 },
  { id: 3, name: "Claude Code Configuration & Workflows", weight: 0.20, questionTarget: 6 },
  { id: 4, name: "Prompt Engineering & Structured Output", weight: 0.20, questionTarget: 6 },
  { id: 5, name: "Context Management & Reliability", weight: 0.15, questionTarget: 5 },
];
```

### Scenario Definitions

```typescript
const SCENARIOS: ScenarioInfo[] = [
  {
    id: 1,
    name: "Customer Support Resolution Agent",
    description: "You are building a customer support resolution agent using the Claude Agent SDK. The agent handles returns, billing disputes, and account issues through custom MCP tools. Your target is 80%+ first-contact resolution while knowing when to escalate.",
    primaryDomains: [1, 2, 5],
  },
  {
    id: 2,
    name: "Code Generation with Claude Code",
    description: "You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.",
    primaryDomains: [3, 5],
  },
  {
    id: 3,
    name: "Multi-Agent Research System",
    description: "You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system produces comprehensive, cited reports.",
    primaryDomains: [1, 2, 5],
  },
  {
    id: 4,
    name: "Developer Productivity with Claude",
    description: "You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks using built-in tools and MCP servers.",
    primaryDomains: [2, 3, 1],
  },
  {
    id: 5,
    name: "Claude Code for Continuous Integration",
    description: "You are integrating Claude Code into your CI/CD pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need prompts that provide actionable feedback and minimize false positives.",
    primaryDomains: [3, 4],
  },
  {
    id: 6,
    name: "Structured Data Extraction",
    description: "You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates output using JSON schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.",
    primaryDomains: [4, 5],
  },
];
```

---

## 4. Pages

### 4.1 Home Page (`/`)

**Purpose:** Welcome screen with exam overview, configuration options, and start button.

**Content:**
- App title: "CCA-F Practice Exam"
- Subtitle: "Claude Certified Architect - Foundations"
- Brief description of what the practice exam covers
- Domain overview: 5 cards/rows showing domain name, weight percentage, and a brief description
- Question count selector: dropdown or button group with options: 15, 30, 60, All
- "Start Exam" button (prominent, primary color)

### 4.2 Exam Page (`/exam`)

**Purpose:** The main exam experience. Shows one question at a time with immediate feedback.

**Layout:**
- **Top bar:** Progress indicator (e.g. "Question 7 of 30"), progress bar, current scenario name
- **Scenario banner:** Colored banner showing the current question's scenario name and a brief context paragraph (from ScenarioInfo.description)
- **Question area:** Question text displayed prominently
- **Answer options:** 4 cards (A, B, C, D) arranged vertically, each showing the label and answer text
- **Explanation panel:** Hidden until an answer is selected. Slides in below the options showing the explanation text.
- **Navigation:** "Next Question" button (appears after answering). On last question, button says "View Results".
- **Question nav dots:** Small dots/numbers at bottom allowing jump to any question. Dots colored: gray (unanswered), green (correct), red (incorrect).

**States per question:**
1. **Unanswered:** All 4 options shown as neutral cards. Clickable.
2. **Answered correctly:** Selected option has green background/border with checkmark. Other options dimmed. Explanation panel visible.
3. **Answered incorrectly:** Selected option has red background/border with X. Correct option has green background/border with checkmark. Other options dimmed. Explanation panel visible.
4. **Reviewed (navigated back):** Shows the locked-in answer state. Cannot change answer.

### 4.3 Results Page (`/exam/results`)

**Purpose:** Show exam results with scoring breakdown.

**Content:**
- **Score hero:** Large scaled score (e.g. "780") out of 1000. Pass/fail badge (green "PASS" or red "FAIL")
- **Raw stats:** X of Y correct (percentage)
- **Domain breakdown:** 5 rows/bars showing each domain's score. Each row: domain name, questions correct/total, percentage, visual bar. Color-coded (green if >=72%, yellow if 50-71%, red if <50%)
- **Missed questions review:** Expandable list of every incorrectly answered question. Each shows: scenario name, question text, your answer (in red), correct answer (in green), explanation.
- **Action buttons:** "Retake Exam" (returns to home), "Review All Questions" (sets `reviewMode: true` in context and navigates to `/exam` — reuses exam page in read-only state with all questions in their answered state)

---

## 5. User Flows

### 5.1 Start Exam
1. User lands on Home page
2. Selects question count (default: 30)
3. Clicks "Start Exam"
4. App generates randomized question set with proper domain weighting
5. App shuffles answer options within each question
6. App navigates to Exam page showing question 1

### 5.2 Answer Question (Correct)
1. User reads scenario banner and question
2. Clicks an answer option
3. Option highlights green with checkmark icon
4. Explanation panel slides in below with detailed reasoning
5. "Next Question" button appears

### 5.3 Answer Question (Incorrect)
1. User reads scenario banner and question
2. Clicks an answer option
3. Selected option highlights red with X icon
4. Correct option highlights green with checkmark icon
5. Explanation panel slides in below with detailed reasoning
6. "Next Question" button appears

### 5.4 Navigate Between Questions
1. User clicks a question dot/number in the bottom nav
2. If target question is already answered, shows it in locked/reviewed state
3. If target question is unanswered, shows it in active state

### 5.5 Complete Exam
1. User answers the last question
2. "View Results" button appears instead of "Next Question"
3. User clicks "View Results"
4. App calculates scores and navigates to Results page

### 5.6 Review Missed Questions
1. On Results page, user scrolls to missed questions section
2. Each missed question shows the scenario, question, selected answer (red), correct answer (green), and explanation
3. User can expand/collapse individual questions

### 5.7 Retake Exam
1. On Results page, user clicks "Retake Exam"
2. Returns to Home page
3. Starting a new exam generates a completely different question set with re-shuffled options

---

## 6. Randomization Logic

### Question Selection Algorithm

```
function generateExam(questionCount: number, allQuestions: Question[]): Question[] {
  1. Calculate target questions per domain:
     - For each domain, target = round(questionCount * domain.weight)
     - Adjust so totals sum to questionCount

  2. For each domain:
     - Filter available questions for this domain
     - Randomly select target count from available questions
     - If not enough questions in domain, select all available

  3. Fill remaining slots (if any) randomly from unused questions

  4. Shuffle the final question array

  5. Return the exam questions
}
```

### Answer Option Shuffling
- For each question, randomly reorder the 4 options (A, B, C, D)
- Update the correctAnswer to match the new position
- This ensures the same question shows answers in different order each time

### Guarantees
- No duplicate questions within a single exam
- Domain proportions approximate real exam weighting (within +/- 1 question)
- Consecutive exams are statistically very unlikely to have the same question set

---

## 7. Scoring Logic

### Raw Score
```
rawPercentage = (totalCorrect / totalQuestions) * 100
```

### Scaled Score (100-1,000)
```
scaledScore = 100 + (rawPercentage / 100) * 900
```
This maps 0% correct to 100 and 100% correct to 1000.
This is a practice-app approximation, not an official psychometric equating model.

### Pass/Fail
```
passed = scaledScore >= 720
```
720 corresponds to approximately 68.9% correct.

### Domain Breakdown
For each domain:
```
domainPercentage = (domainCorrect / domainTotal) * 100
```

---

## 8. UI/UX Requirements

### Visual Design
- Clean, professional appearance matching Anthropic's aesthetic
- Dark mode supported via `prefers-color-scheme` (no manual toggle)
- Primary color: dark/charcoal for text, green for correct/pass, red for incorrect/fail
- Card-based layout for questions and answer options
- Smooth transitions for explanation panel reveal

### Responsive Design
- Desktop: max-width container (768px) centered, comfortable reading width
- Tablet: full-width with padding
- Mobile (375px+): stacked layout, answer cards full-width, no horizontal scroll

### Accessibility
- All interactive elements keyboard-navigable
- Answer options selectable via keyboard (1-4 keys or A-D keys)
- Sufficient color contrast ratios
- Screen reader labels on progress indicators

### Feedback Animations
- Answer selection: brief highlight animation (150ms)
- Explanation panel: slide-down reveal (200ms ease-out)
- Progress bar: smooth width transition

---

## 9. Ranger Scenarios (Acceptance Criteria)

Each scenario below is an independently verifiable user flow for Ranger browser testing.

### S1: Landing Page Display
"User opens the app at localhost:3000. They see a page titled 'CCA-F Practice Exam' with a subtitle 'Claude Certified Architect - Foundations'. Below the title are 5 domain cards showing domain names and weight percentages. A question count selector shows options 15, 30, 60, and All with 30 selected by default. A prominent 'Start Exam' button is visible at the bottom."

### S2: Start Exam Flow
"User is on the home page with 30 selected as question count. User clicks the 'Start Exam' button. The page navigates to show the first exam question. A progress bar shows '1 of 30'. A colored scenario banner displays one of the 6 scenario names with its description. Below the banner is a question with 4 answer options labeled A through D."

### S3: Answer Question Correctly
"User is viewing an exam question with 4 answer options. User clicks the correct answer option. The selected option turns green with a checkmark. An explanation panel appears below the options with text explaining why this answer is correct. A 'Next Question' button appears."

### S4: Answer Question Incorrectly
"User is viewing an exam question with 4 answer options. User clicks an incorrect answer option. The selected option turns red. The correct answer option turns green. An explanation panel appears below the options explaining the correct answer. A 'Next Question' button appears."

### S5: Navigate to Next Question
"User has answered a question and sees the 'Next Question' button. User clicks 'Next Question'. The progress bar updates (e.g., from '1 of 30' to '2 of 30'). A new question appears with its scenario banner, question text, and 4 fresh answer options."

### S6: Question Navigation Dots
"User has answered 5 questions and is on question 6. At the bottom of the page, there are small navigation indicators. The first 5 indicators show green (if correct) or red (if incorrect). Indicator 6 is highlighted as current. The remaining indicators are gray. User clicks on indicator 3 to jump back. Question 3 appears showing the previously locked-in answer with its explanation."

### S7: Complete Exam and View Results
"User is on the last question of the exam. After answering, a 'View Results' button appears instead of 'Next Question'. User clicks 'View Results'. A results page appears showing a large scaled score number (between 100-1000), a 'PASS' or 'FAIL' badge, a raw score (e.g., '22 of 30 correct'), and 5 domain breakdown rows each showing the domain name and score percentage."

### S8: Domain Breakdown on Results
"User is on the results page after completing an exam. Below the overall score, there are 5 domain rows. Each row shows the domain name, a score fraction (e.g., '6/8'), a percentage, and a colored bar (green for >=72%, yellow for 50-71%, red for <50%). All 5 exam domains are represented."

### S9: Review Missed Questions
"User is on the results page and has at least one incorrect answer. Below the domain breakdown, there is a 'Missed Questions' section. Each missed question shows the scenario name, the question text, the user's incorrect answer highlighted in red, the correct answer highlighted in green, and the explanation text."

### S10: Retake Exam Generates Different Questions
"User is on the results page. User clicks 'Retake Exam'. The app returns to the home page. User clicks 'Start Exam' again with 30 questions selected. The first question that appears is different from the first question of the previous attempt (randomization produces a different sequence)."

### S11: Mobile Responsiveness
"User views the app at 375px viewport width on the home page. The layout is single-column with no horizontal scrollbar. Domain cards stack vertically. The 'Start Exam' button is full-width. User starts an exam - answer option cards stack vertically and are full-width. All text is readable without zooming."

### S12: Cannot Change Answer After Selection
"User is on an exam question. User clicks answer B. The answer is locked in (B highlights as correct or incorrect). User attempts to click a different answer option (A, C, or D). Nothing changes - the original selection remains locked and the other options are not clickable."

### S13: Keyboard Navigation
"User is on an exam question. User presses the 'A' key on their keyboard. Answer option A is selected and the feedback appears. User presses Enter or the right arrow key. The exam advances to the next question."

### S14: All Questions Question Count
"User is on the home page. User selects 'All' from the question count selector. User clicks 'Start Exam'. The progress bar shows '1 of N' where N is the total number of questions in the bank (160). The exam contains all available questions and does not show a timer."

### S15: Fifteen Questions Exam
"User is on the home page. User selects '15' from the question count selector. User clicks 'Start Exam'. The progress bar shows '1 of 15'. After answering all 15 questions, the results page appears with scores calculated from those 15 questions."

### S16: Sixty Questions Exam
"User is on the home page. User selects '60' from the question count selector. User clicks 'Start Exam'. The progress bar shows '1 of 60' and a countdown timer is visible in the top bar. After answering all 60 questions or when time expires, the app navigates to results with scores computed from all questions."

---

## 10. Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS v4
- **Language:** TypeScript (strict mode)
- **State Management:** React context (ExamContext provider at layout level). No localStorage.
- **Data:** Static TypeScript file (`src/data/questions.ts`) - no database. 160 questions.
- **Types:** Shared types in `src/lib/types.ts`, exam logic in `src/lib/exam.ts`
- **Routing:** Next.js App Router (`/`, `/exam`, `/exam/results`). `/exam` doubles as review mode via context flag.
- **Path aliases:** `@/*` mapped to `./src/*`

---

## 11. Question Bank Requirements

- **Minimum 150 questions** across all 5 domains
- **Domain distribution** matches exam weighting (D1: ~40, D2: ~27, D3: ~30, D4: ~30, D5: ~23)
- **All 6 scenarios** represented
- **All 30 task statements** covered (at least 2 questions per task statement)
- **Scenario-based format** - every question is framed within a realistic production context
- **Plausible distractors** - incorrect options represent choices a candidate with incomplete knowledge might make
- **Detailed explanations** - every question includes an explanation that teaches the concept, not just states the answer
- **Sources:** Adapted from exam guide samples, Anthropic Academy course quizzes, Architect's Playbook patterns, and original questions derived from the 30 task statements

---

## 12. File Structure

```
src/
├── lib/
│   ├── types.ts          # Shared types (ExamSession, UserAnswer, DomainResult, etc.)
│   ├── constants.ts      # DOMAINS, SCENARIOS arrays
│   └── exam.ts           # generateExam(), shuffleOptions(), calculateScore()
├── data/
│   └── questions.ts      # 160 questions (existing)
├── context/
│   └── ExamContext.tsx    # React context provider + useExam hook
└── app/
    ├── layout.tsx         # Root layout wrapping ExamContext provider
    ├── page.tsx           # Home page
    ├── exam/
    │   ├── page.tsx       # Exam page (also serves review mode)
    │   └── results/
    │       └── page.tsx   # Results page
    └── globals.css
```

---

## 13. Build Order

1. **Types + constants** — `src/lib/types.ts`, `src/lib/constants.ts`
2. **Exam logic** — `src/lib/exam.ts` (question selection, answer shuffling, scoring)
3. **Context provider** — `src/context/ExamContext.tsx`
4. **Home page** — Domain cards, question count selector, start button
5. **Exam page** — Question display, answer selection, feedback, nav dots
6. **Results page** — Score hero, domain breakdown, missed questions, action buttons
7. **Polish** — Keyboard navigation, animations, responsive tweaks, dark mode
