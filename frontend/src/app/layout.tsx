import "./globals.css";
import type { Metadata } from "next";
import Navbar from "../components/navbar/Navbar";

export const metadata: Metadata = {
  title: "Pontuara",
  description: "Sistema de gerenciamento Pontuara",
};

/**
 * Layout principal da aplicação (Root Layout).
 * Define a estrutura básica de HTML e body para todas as páginas.
 * 
 * @param {Object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos renderizados dentro do layout.
 * @returns {JSX.Element} Estrutura principal do HTML.
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
