import "./globals.css";
import type { Metadata } from "next";
import Navbar from "../components/navbar/Navbar";

export const metadata: Metadata = {
  title: "Pontuara",
  description: "Sistema de gerenciamento Pontuara",
};

/**
 * Main application layout (Root Layout).
 * Defines the base HTML/body structure for all pages.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Children rendered inside the layout.
 * @returns {JSX.Element} Main HTML structure.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
