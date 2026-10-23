# AGENTS.md

## 1. Introduction and Role

This document defines the strict operational rules, workflows, and constraints for all AI coding agents working on the JabarPleasure repository. JabarPleasure is a decoupled, mobile-first WebGIS platform built with Next.js, Laravel, PostgreSQL/PostGIS, and Leaflet.js. AI agents must follow these instructions to understand requirements, plan, implement changes, and manage the codebase.

## 2. Source of Truth Hierarchy

When processing instructions and resolving conflicts, agents MUST adhere to the following strict hierarchy:

1. **Explicit user instruction** for the current task.
2. **PRD.md** for product requirements, scope, and user flows.
3. **DESIGN-SYSTEM.md** for visual, interaction, and mobile-first rules.
4. **ARCHITECTURE.md** for technical structure, technology constraints, and spatial configurations.
5. **Existing codebase conventions** and implemented patterns.
6. **General engineering best practices**.

If two sources conflict, do not silently choose one when the conflict affects product behavior, architecture, security, data, or core user flows. Flag the conflict and request clarification.

## 3. Core Principle

**Make the smallest correct change.**

AI agents must avoid unnecessary changes.
Do NOT:

* Rewrite working code without a reason.
* Refactor unrelated code.
* Rename unrelated files.
* Change architecture unnecessarily.
* Add unnecessary dependencies.
* Change the design system to solve a local implementation problem.
* Introduce features that were not requested.
* Expand project scope without explicit approval.

## 4. Before Coding

Before modifying the repository, the AI agent MUST:

1. Read the relevant sections of `PRD.md`, `DESIGN-SYSTEM.md`, `ARCHITECTURE.md`, and `AGENTS.md`.
2. Inspect the existing repository structure (fe-jabarpleasure and be-jabarpleasure).
3. Identify existing components, utilities, services, APIs, and PostGIS spatial patterns that can be reused.
4. Determine which requirements are relevant to the requested task.
5. Identify possible conflicts, ambiguities, or missing information.
6. Create an implementation plan before making significant changes. For larger tasks, present the plan before implementation.

## 5. Scope Control

AI agents MUST work only within the requested scope.
If the task is "Add feature X", do not automatically:

* Redesign feature Y.
* Refactor unrelated modules.
* Replace the existing library.
* Rewrite the database.
* Change authentication.
* Modify unrelated UI.

If an unrelated problem is discovered, report it separately rather than silently fixing it.

## 6. Product Requirements

`PRD.md` defines what the product should do.
AI agents MUST:

* Follow functional requirements (e.g., proximity search, personalized recommendations, itinerary planner).
* Follow non-functional requirements (e.g., <3s API response, offline mode fallback).
* Respect product scope. Do NOT implement explicitly out-of-scope functionality, such as financial transactions or ticket reservation systems.
* Not invent product behavior, business rules, or silently change acceptance criteria.

If a requirement is ambiguous, do not guess when the decision could affect architecture, security, data, or user flow.

## 7. Design System

`DESIGN-SYSTEM.md` defines visual and interaction rules.
AI agents MUST:

* Follow the defined visual system, maintaining the exact Design Tokens (e.g., Primary Blue `#4941EC`, Secondary Teal `#60CE9F`).
* Maintain strictly Mobile-First responsive behavior (maximum container width 480px on desktop).
* Follow WebGIS component rules: Use Bottom Sheets instead of standard map popups, and ensure marker clustering is implemented.
* Ensure tappable areas meet the 48x48px accessibility requirement.
* Reuse existing UI components and not create duplicates.
* Not introduce arbitrary colors, spacing, typography, radius, shadows, or redesign unrelated screens.

## 8. Architecture

`ARCHITECTURE.md` defines the technical architecture.
AI agents MUST:

* Respect confirmed technology decisions: Next.js/React, Tailwind CSS, Leaflet.js, Laravel, PostgreSQL, and PostGIS.
* Reuse existing architecture and patterns, keeping responsibilities decoupled between frontend and backend.
* Not introduce new external services (e.g., external routing APIs or cloud storage) without explicit approval.
* Not change PostGIS database architecture, SRID 4326 coordinate systems, or JWT authentication casually.
* Identify conflicts before proceeding if the requested implementation conflicts with the documented architecture.

## 9. Dependencies

Before adding a new dependency:

1. Check whether the repository already provides equivalent functionality.
2. Determine whether the dependency is actually necessary.
3. Consider maintenance, security, bundle size, and compatibility.
4. Avoid dependencies that provide trivial functionality. Do not add dependencies merely for convenience.

## 10. File & Code Changes

AI agents should:

* Follow existing naming conventions and directory structures within the mono-repo.
* Keep functions and modules focused.
* Avoid unnecessary duplication.
* Prefer reusable abstractions when they clearly reduce duplication, but avoid abstractions that add complexity without meaningful benefit.
* Not modify unrelated files.

## 11. Database Changes

Database changes require additional caution.
AI agents MUST:

* Follow the documented PostGIS database architecture.
* Preserve existing data integrity.
* Use established Laravel migrations.
* Avoid destructive schema changes unless explicitly authorized.
* Consider existing data and backward compatibility.
* Update relevant documentation when a major schema change occurs.
* Never drop or destroy production data as part of routine development.

## 12. API Changes

When modifying APIs:

* Preserve existing contracts unless a breaking change is explicitly required.
* Validate input.
* Handle errors consistently (e.g., returning `403 Forbidden` for RBAC violations or `413 Payload Too Large` for media limits).
* Respect JWT authentication and authorization.
* Update relevant documentation or tests.
* Do not introduce breaking API changes casually.

## 13. Security

Security takes priority over convenience.
AI agents MUST:

* Validate all user input.
* Respect authentication and strict Role-Based Access Control (RBAC).
* Never expose secrets, hardcode credentials, or commit API keys/passwords.
* Validate uploaded files strictly against the 2MB image and 10MB video constraints.
* Avoid exposing sensitive information in logs or API responses.
* Never weaken a security control simply to make implementation easier.

## 14. Testing

Every implementation should include appropriate verification.
Before considering a task complete:

* Run relevant tests, linting, and formatting checks.
* Verify the changed functionality and edge cases (e.g., offline mode synchronization, spatial boundary limits).
* Check that existing functionality has not been broken.
* **For UI changes:** Verify responsive behavior, loading states, empty states, error states, accessibility, and component consistency.
* **For API changes:** Verify valid/invalid input, authentication, authorization, and error responses.

## 15. Debugging

When debugging:

1. Reproduce the problem.
2. Identify the likely root cause.
3. Make the smallest correct fix.
4. Verify the fix and check for regressions.
Do not mask symptoms with unnecessary workarounds when the underlying cause can reasonably be fixed.

## 16. Existing Code

Treat existing working code as valuable.
Before replacing an existing implementation:

* Understand why it exists.
* Determine whether it already satisfies the requirement or can be extended.
* Avoid replacement solely because a different approach appears cleaner.
* Do not assume existing code is wrong merely because it differs from your preferred coding style.

## 17. Refactoring

Refactoring must be intentional.
AI agents MUST NOT perform unrelated refactoring during feature implementation.
A refactor is appropriate only when:

* It is necessary for the requested feature.
* It fixes a concrete architectural problem.
* It reduces significant duplication.
* It improves maintainability without expanding scope.
If a large refactor is required, explain why before performing it.

## 18. Ambiguity Handling

When requirements are unclear:

* **Low-risk ambiguity:** If the ambiguity has minimal impact and there is an obvious convention in the existing codebase, make a conservative decision.
* **High-risk ambiguity:** Stop and request clarification when ambiguity affects product behavior, architecture, database, security, authentication, external services, core user flow, or significant scope. Never make major decisions silently.

## 19. Workflow

For significant tasks, follow this workflow:

* **Phase 1 — Understand:** Read relevant documentation, inspect repository, identify affected files and constraints.
* **Phase 2 — Plan:** Define the smallest implementation approach, identify dependencies, tests, and risks.
* **Phase 3 — Implement:** Make the smallest correct change following PRD, Design System, and Architecture. Reuse existing code.
* **Phase 4 — Verify:** Run tests, relevant checks, verify behavior, and check for regressions.
* **Phase 5 — Report:** Summarize what changed, files changed, tests performed, unresolved issues, assumptions, and follow-ups.

## 20. Definition of Done

A task is considered complete only when:

* The requested functionality has been implemented.
* The implementation follows `PRD.md`.
* The UI follows `DESIGN-SYSTEM.md`.
* The implementation follows `ARCHITECTURE.md`.
* No unnecessary scope was introduced.
* Relevant tests have been performed and edge cases considered.
* Security requirements have been respected and no secrets exposed.
* Existing unrelated functionality has not been unnecessarily modified.
* Documentation has been updated when required.

## 21. Final Response Format

After completing a task, provide a concise report using this exact structure:

**Summary**
Briefly describe what was implemented.

**Changes**
List the important files or modules that were changed.

**Verification**
List tests, commands, or checks that were actually performed. Do not claim that a test or command was executed if it was not.

**Notes**
Mention assumptions, known limitations, unresolved issues, or required follow-up decisions.

## 22. Final Principle

When uncertain, prioritize:
**Correctness → Security → Requirements → Existing Architecture → Consistency → Simplicity**

Always prefer: The smallest correct change that satisfies the user's request and the project's source-of-truth documents.