---
name: dercas-apa
description: Use when generating DERCAS in APA7 format for this project. Applies project's LaTeX APA7 structure with Tectonic, figures from docs/diagramas to docs/DERCAS/figuras, processes P01-P06, CA-XX, anexos A/B, historial de revisiones, and completes all required sections. Follows existing conventions (terminology, endpoints from docs/referencia/api.md, no secrets, deudas conocidas, [Completar: ...] for missing dates/signers).
---

# dercas-apa Skill

Use this skill to generate/update the DERCAS in APA7.

## Requirements
- Follow the structure in docs/DERCAS-APA7-prompt.md
- Include historial de revisiones
- Separate Criterios de aceptación (section 12) from RNF
- Anexos A and B at the end
- Figures: SVGs in docs/diagramas/, convert to PDF (rsvg-convert -f pdf1.5) to docs/DERCAS/figuras/
- Compile with Tectonic via Makefile
- Check for missing elements: diagram ER, diagrams of state, use case narratives with all fields, API catalog matches docs/referencia/api.md
- Do not commit unless explicitly asked
