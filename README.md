# xMetrics

xMetrics is a prototype diligence product for exploring how a leadership team may behave together under pressure. It combines configured psychometric profiles, deterministic team signals, and generated decision scenarios in a four-screen investor workflow.

The product was built from [`xmetrics-foundation.md`](./xmetrics-foundation.md), [`xmetrics-product-spec.md`](./xmetrics-product-spec.md), and the staged implementation instructions in [`xmetrics-codex-prompts.md`](./xmetrics-codex-prompts.md). The Step 5 layout addenda refine presentation without changing the underlying assessment or generation model.

## Setup

```bash
npm i
```

Create `.env.local`:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
XMETRICS_PASSWORD=your_shared_prototype_password
```

`XMETRICS_PASSWORD` is optional during local development. When it is unset, the access gate allows requests through.

Start the application:

```bash
npm run dev
```

## Verification

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Deliberate scope limits

This prototype does not include a database, multi-user accounts, a live psychometric engine, questionnaire administration, recruitment matching, validity claims, or payments. The shared-password gate controls prototype access only; it is not a user authentication system.
