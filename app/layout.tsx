import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "EduVibe - Empowering Students with Personalized Mentorship",
  description:
    "Connect with experienced mentors to guide your academic journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
