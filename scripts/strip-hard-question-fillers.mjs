/**
 * Removes known boilerplate filler appended to hard-question options.
 * Run: node scripts/strip-hard-question-fillers.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const path = join(root, "src/data/hard-questions.ts");

const FILLERS = [
  "  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows.",
  " Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows.",
  "Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows.",
  "  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact.",
  " Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact.",
  "Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact.",
  "  This shows up in legacy stacks where observability was tuned for speed rather than end-to-end causal correctness.",
  " This shows up in legacy stacks where observability was tuned for speed rather than end-to-end causal correctness.",
  "This shows up in legacy stacks where observability was tuned for speed rather than end-to-end causal correctness.",
  "  It is a common shortcut when correlation ids or schema versioning were never standardized across services.",
  " It is a common shortcut when correlation ids or schema versioning were never standardized across services.",
  "It is a common shortcut when correlation ids or schema versioning were never standardized across services.",
  "  Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface.",
  " Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface.",
  "Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface.",
  "  Certain vendor SDKs encourage it by default, which creates subtle issues once multi-tenant workloads scale up.",
  " Certain vendor SDKs encourage it by default, which creates subtle issues once multi-tenant workloads scale up.",
  "Certain vendor SDKs encourage it by default, which creates subtle issues once multi-tenant workloads scale up.",
  "  Early-stage projects occasionally ship this when time pressure overrides structured error handling disciplines.",
  " Early-stage projects occasionally ship this when time pressure overrides structured error handling disciplines.",
  "Early-stage projects occasionally ship this when time pressure overrides structured error handling disciplines.",
  "  Documentation sometimes recommends this for simplicity, although real-world tool chains tend to expose its fragility quickly.",
  " Documentation sometimes recommends this for simplicity, although real-world tool chains tend to expose its fragility quickly.",
  "Documentation sometimes recommends this for simplicity, although real-world tool chains tend to expose its fragility quickly.",
  "  Regulatory environments often reject this because it makes reproducible audit trails significantly harder to maintain.",
  " Regulatory environments often reject this because it makes reproducible audit trails significantly harder to maintain.",
  "Regulatory environments often reject this because it makes reproducible audit trails significantly harder to maintain.",
  "  This pattern emerges when schema versioning is skipped, forcing consumers to infer structure from incomplete signals.",
  " This pattern emerges when schema versioning is skipped, forcing consumers to infer structure from incomplete signals.",
  "This pattern emerges when schema versioning is skipped, forcing consumers to infer structure from incomplete signals.",
  "  This approach sometimes appears in legacy stacks where observability tooling was optimized for throughput over correctness.",
  " This approach sometimes appears in legacy stacks where observability tooling was optimized for throughput over correctness.",
  "This approach sometimes appears in legacy stacks where observability tooling was optimized for throughput over correctness.",
  "  It can work in narrow prototyping scenarios but breaks down when retry semantics or partial failures enter the picture.",
  " It can work in narrow prototyping scenarios but breaks down when retry semantics or partial failures enter the picture.",
  "It can work in narrow prototyping scenarios but breaks down when retry semantics or partial failures enter the picture.",
  "  Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps.",
  " Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps.",
  "Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps.",
  "  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing.",
  " Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing.",
  "Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing.",
  "  Organizations may default to this when governance overhead feels excessive, even though auditing becomes harder later.",
  " Organizations may default to this when governance overhead feels excessive, even though auditing becomes harder later.",
  "Organizations may default to this when governance overhead feels excessive, even though auditing becomes harder later.",
  "  It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries.",
  " It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries.",
  "It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries.",
  " It aligns with a 'fail fast' philosophy but often leaves downstream consumers without the context they need to recover.",
  "It aligns with a 'fail fast' philosophy but often leaves downstream consumers without the context they need to recover.",
];

let text = readFileSync(path, "utf8");
const before = text.length;
let changed = true;
while (changed) {
  changed = false;
  for (const f of FILLERS) {
    if (text.includes(f)) {
      text = text.split(f).join("");
      changed = true;
    }
  }
}
// Collapse accidental double spaces only inside option "text" JSON string lines (8-space indent)
text = text.replace(
  /^ {8}"text": "([^"]*)",?$/gm,
  (line, inner) => `        "text": "${inner.replace(/ {2,}/g, " ").trimEnd()}",`
);

writeFileSync(path, text);
console.log("Stripped fillers from hard-questions.ts", { before, after: text.length });
