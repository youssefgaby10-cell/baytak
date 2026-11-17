# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Translation updates

The UI now uses the Arabic/English language context in the updated pages and components. The notification bell also navigates to the protected `/notifications` page, which currently shows an empty-state message when there are no notifications.

To install and run locally:

1. Install Node.js (use a version compatible with the Vite version in `package.json`).
2. Run `npm install`.
3. If you use the server's AI feature, copy `.env.example` to `.env` and add your own `OPENAI_API_KEY`.
4. Run `npm run dev`.

The original `.env` file is intentionally not included in this archive; keep your existing local secrets private.
