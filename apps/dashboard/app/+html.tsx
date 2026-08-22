import { ScrollViewStyleReset } from "expo-router/html";
import type { ReactNode } from "react";

// Expo Router's sanctioned hook for the static web export's root HTML
// shell (https://docs.expo.dev/router/reference/static-rendering/#root-html) —
// not a workaround. Without this file the exported page falls back to a
// generic default title instead of ServiceLine's.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="ServiceLine — Restaurant Operations: live orders, menus, customers, settings, and daily performance." />
        <meta name="theme-color" content="#11152B" />
        <title>ServiceLine — Restaurant Operations</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
