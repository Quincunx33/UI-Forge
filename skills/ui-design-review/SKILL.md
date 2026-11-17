---
name: ui-design-review
description: Review frontend visual design quality and provide product-aware, evidence-based design recommendations without changing code.
---

# UI-Forge: UI Design Review

## Purpose
Evaluate whether an interface is coherent, usable, readable, and appropriate for its product. This is a read-only review skill, not an automatic redesign.

## Invocation
Use when the user asks for UI/UX critique, visual quality review, or feedback without asking for implementation.

## Review process
1. Identify the product purpose, target users, primary tasks, brand constraints, and existing design language from project context.
2. Inspect the actual implementation and rendered interface when available. Do not judge only from component names or a design description.
3. When UI-Forge screenshot artifacts exist, open and inspect the actual images at each viewport. Compare desktop, tablet, and mobile views; identify clipping, overlap, hierarchy, spacing, typography, contrast, visual noise, and inconsistent components. Never infer image contents from filenames or report a visual defect without image or DOM evidence.
4. Review hierarchy, information density, typography, spacing, alignment, contrast, component consistency, responsive behavior, and interaction feedback.
5. Identify visual noise: gratuitous gradients, glow, glass effects, decorative floating elements, excessive cards/badges, oversized radii, and unnecessary animation.
6. Distinguish objective usability/accessibility problems from subjective aesthetic preferences.
7. Prioritize recommendations by user impact and implementation scope.

## Design principles
- Make the interface serve its task; do not decorate for decoration's sake.
- Use a deliberate type scale and spacing rhythm.
- Establish clear primary and secondary actions.
- Prefer readable content and predictable navigation over novelty.
- Use color with semantic intent and sufficient contrast.
- Keep motion purposeful, brief, and compatible with prefers-reduced-motion.
- Do not impose a fashionable style that conflicts with the product or its users.
- Do not replace an existing coherent design system without a user request.

## Visual evidence
- Prefer actual screenshots and measured DOM/layout evidence over assumptions.
- If the host agent can inspect images, describe visible regions and tie each observation to route, viewport, and screenshot artifact.
- If images cannot be opened or visual evidence is missing, mark visual interpretation as untested rather than guessing.
- Separate visual observations from accessibility claims; use axe results as automated evidence and require manual keyboard/assistive-technology checks for broader conclusions.

## Handoff
- If the user asks to implement a new visual direction, build a new frontend, or substantially redesign the interface, hand off to `ui-create`.
- If the user asks to fix a specific defect while preserving the existing design, hand off to `ui-repair`.
- If the user only asked for critique, do not edit files.

## Output
Provide:
- concise overall assessment;
- strongest aspects worth preserving;
- prioritized issues with evidence and user impact;
- specific recommendations tied to affected components/regions;
- responsive and accessibility concerns;
- optional design direction only when the current direction is demonstrably unsuitable.

Do not edit files. If the user wants implementation, use the appropriate creation or repair skill rather than silently editing from review mode.
