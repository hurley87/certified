# CCA-F Practice Exam

A practice exam app for the **Claude Certified Architect - Foundations (CCA-F)** certification. Generates unique exams from a 160-question bank across all 5 exam domains, with immediate feedback and explanations after every answer.

## Features

- **Randomized exams** — choose 15, 30, 60, or All questions from the 160-question bank, shuffled each attempt
- **Immediate feedback** — see correct/incorrect with detailed explanations after every answer
- **Domain scoring** — performance breakdown across all 5 weighted domains
- **Pass/fail determination** — uses a practice scaled score (100-1000) with the official 720 passing threshold
- **Review mode** — revisit all questions and explanations after completing an exam
- **Countdown timer** — timed for 15/30/60-question modes, no timer for All-questions mode
- **Dark mode** — automatic via `prefers-color-scheme`

## Exam Domains

| Domain | Weight |
|--------|--------|
| Agentic Architecture & Orchestration | 27% |
| Tool Design & MCP Integration | 18% |
| Claude Code Configuration & Workflows | 20% |
| Prompt Engineering & Structured Output | 20% |
| Context Management & Reliability | 15% |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run test` | Run exam engine tests |
| `npm run lint` | Run ESLint |

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
