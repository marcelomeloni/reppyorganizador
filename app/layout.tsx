import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { OrganizationProvider } from "@/context/OrganizationContext";
// ── Configuração das Fontes ──

const dmSans = DM_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// ── Metadados da Página (SEO e Aba do Navegador) ──

export const metadata: Metadata = {
  title: "Reppy",
  description: "Plataforma de vendas de ingressos para repúblicas, atléticas e produtoras universitárias. Taxas justas e controle total.",
};

// ── Layout Principal ──

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${dmSans.variable} ${plusJakartaSans.variable} ${bricolage.variable} font-body bg-off-white text-black antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <OrganizationProvider>
            <main className="flex-1">{children}</main>
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}