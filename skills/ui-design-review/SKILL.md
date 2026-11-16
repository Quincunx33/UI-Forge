---
name: ui-design-review
description: Review frontend visual design quality and provide product-aware, evidence-based design recommendations without changing code.
---

# UI-Forge: UI Design Review

## Purpose
Evaluate whether an interface is coherent, usable, readable, and appropriate for its product. This is a review skill, not an automatic redesign.

## Invocation
Use when the user asks for UI/UX critique, visual polish, design quality review, or feedback on an AI-generated interface.

## Review process
1. Identify the product purpose, target users, primary tasks, brand constraints, and existing design language from project context.
2. Inspect the actual implementation and rendered interface when available. Do not judge only from component names or a design description.
3. Review hierarchy, information density, typography, spacing, alignment, contrast, component consistency, responsive behavior, and interaction feedback.
4. Identify visual noise: gratuitous gradients, glow, glass effects, decorative floating elements, excessive cards/badges, oversized radii, and unnecessary animation.
5. Distinguish objective usability/accessibility problems from subjective aesthetic preferences.
6. Prioritize recommendations by user impact and implementation scope.

## Design principles
- Make the interface serve its task; do not decorate for decoration's sake.
- Use a deliberate type scale and spacing rhythm.
- Establish clear primary and secondary actions.
- Prefer readable content and predictable navigation over novelty.
- Use color with semantic intent and sufficient contrast.
- Keep motion purposeful, brief, and compatible with prefers-reduced-motion.
- Do not impose a fashionable style that conflicts with the product or its users.
- Do not replace an existing coherent design system without a user request.

## Output
Provide:
- concise overall assessment;
- strongest aspects worth preserving;
- prioritized issues with evidence and user impact;
- specific recommendations tied to affected components/regions;
- responsive and accessibility concerns;
- optional design direction only when the current direction is demonstrably unsuitable.

Do not edit files. If the user wants implementation, hand off to ui-repair after the user explicitly authorizes repair.
