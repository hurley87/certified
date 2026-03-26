import type { DomainInfo, ScenarioInfo } from "./types";

export const DOMAINS: DomainInfo[] = [
  { id: 1, name: "Agentic Architecture & Orchestration", weight: 0.27, questionTarget: 8 },
  { id: 2, name: "Tool Design & MCP Integration", weight: 0.18, questionTarget: 5 },
  { id: 3, name: "Claude Code Configuration & Workflows", weight: 0.20, questionTarget: 6 },
  { id: 4, name: "Prompt Engineering & Structured Output", weight: 0.20, questionTarget: 6 },
  { id: 5, name: "Context Management & Reliability", weight: 0.15, questionTarget: 5 },
];

export const SCENARIOS: ScenarioInfo[] = [
  {
    id: 1,
    name: "Customer Support Resolution Agent",
    description:
      "You are building a customer support resolution agent using the Claude Agent SDK. The agent handles returns, billing disputes, and account issues through custom MCP tools. Your target is 80%+ first-contact resolution while knowing when to escalate.",
    primaryDomains: [1, 2, 5],
  },
  {
    id: 2,
    name: "Code Generation with Claude Code",
    description:
      "You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.",
    primaryDomains: [3, 5],
  },
  {
    id: 3,
    name: "Multi-Agent Research System",
    description:
      "You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system produces comprehensive, cited reports.",
    primaryDomains: [1, 2, 5],
  },
  {
    id: 4,
    name: "Developer Productivity with Claude",
    description:
      "You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks using built-in tools and MCP servers.",
    primaryDomains: [2, 3, 1],
  },
  {
    id: 5,
    name: "Claude Code for Continuous Integration",
    description:
      "You are integrating Claude Code into your CI/CD pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need prompts that provide actionable feedback and minimize false positives.",
    primaryDomains: [3, 4],
  },
  {
    id: 6,
    name: "Structured Data Extraction",
    description:
      "You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates output using JSON schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.",
    primaryDomains: [4, 5],
  },
];

export const PASSING_SCORE = 720;
export const MIN_SCALED_SCORE = 100;
export const MAX_SCALED_SCORE = 1000;

/** Time limits in milliseconds, keyed by question count. No entry = no timer. */
export const EXAM_TIME_LIMITS: Record<number, number> = {
  15: 30 * 60 * 1000,   // 30 minutes
  30: 60 * 60 * 1000,   // 1 hour
  60: 120 * 60 * 1000,  // 2 hours
};
