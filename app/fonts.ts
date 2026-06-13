import localFont from "next/font/local";

/**
 * Fontes self-hostadas (sem chamada ao Google Fonts no build nem no runtime).
 * Arquivos .woff2 versionados em app/fonts/, subset latin (cobre os acentos do
 * portugues: a-til, o-til, c-cedilha, agudos, circunflexos e crase).
 * Mesmas familias, pesos e variaveis CSS (--font-heading, --font-body) de antes.
 */

export const heading = localFont({
  variable: "--font-heading",
  display: "swap",
  src: [
    { path: "./fonts/baloo-2-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/baloo-2-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/baloo-2-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/baloo-2-latin-800-normal.woff2", weight: "800", style: "normal" }
  ]
});

export const body = localFont({
  variable: "--font-body",
  display: "swap",
  src: [
    { path: "./fonts/nunito-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/nunito-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/nunito-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/nunito-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "./fonts/nunito-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/nunito-latin-700-italic.woff2", weight: "700", style: "italic" },
    { path: "./fonts/nunito-latin-800-normal.woff2", weight: "800", style: "normal" },
    { path: "./fonts/nunito-latin-800-italic.woff2", weight: "800", style: "italic" }
  ]
});
