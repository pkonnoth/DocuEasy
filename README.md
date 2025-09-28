This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

🛠 Minimal Feature List

Patient timeline (read tool) → encounters/labs for a patient

Summarize visits (flow) → timeline → LLM summary (card)

Draft SOAP note (tool) → create notes.status='draft'

Follow-up scheduling (action tool) → propose → confirm → create appointment

Alert chip (lite) → show critical labs/overdues

Audit log → every tool call (read + write)

🧠 Orchestrated Flows (Mastra)

Visit Prep: GET_TIMELINE → LLM_SUMMARY → DRAFT_NOTE(draft)

Follow-Up: COMPUTE_SLOTS → CEDAR_CONFIRM(create_appointment)

Alerts Lite: GET_LABS → CLASSIFY → ALERT_CARD

🛡 Safety & Governance (Cedar-OS)

Tools: get_patient_timeline (read), draft_progress_note (draft), create_appointment (confirm:true)

Input validation (zod), org/patient scoping (or hardcoded demo), audit every call

Cedar React Panel renders cards + confirmation dialogs

📦 Deliverables (MVP)

GET /api/agent/cedar endpoint with 3 tools above

Cedar Panel on patient page with 3 buttons: Summarize, Draft Note, Schedule Follow-up

Notes list showing new draft; Appointment list showing confirmed slot

Audit page (simple table: ts, user, patient, action, details)

✅ Acceptance Criteria

Summarize returns in <2s on seed data and cites which encounters/labs it used

Draft note is saved as draft and never finalized automatically

Follow-up only creates an appointment after user confirmation

Each action creates one row in audit_log

🗓 Milestones (1–2 weeks)

Day 1–2: Tools scaffold + audit writer; seed data

Day 3–4: Visit Prep flow + summary card

Day 5–6: Draft Note tool + notes UI

Day 7–8: Follow-up propose + confirm + appointment UI

Day 9: Alerts chip (critical only)

Day 10: Polish (empty/error states), demo script

📏 Success Metrics (demo-level)

≥50% fewer clicks to produce a visit note (vs manual)

≤30s to schedule a follow-up from patient page

100% of writes require explicit confirmation (verifiable in audit log)

🧭 Non-Goals (MVP)

Role-based access/RLS, billing codes, eRx, HL7/FHIR integrations, NL ordering, full inbox