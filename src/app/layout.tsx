import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ExamProvider } from "@/context/ExamContext";
import { ThemeProvider, THEME_STORAGE_KEY } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CCA-F Practice Exam",
  description: "Claude Certified Architect - Foundations practice exam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('${THEME_STORAGE_KEY}');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ThemeToggle />
          <ExamProvider>{children}</ExamProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
