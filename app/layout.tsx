import type { Metadata,Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScholarMatch | Find your research fit",
  description: "Interactive ScholarMatch MVP demo for research opportunities, fit scores, applications and outreach drafts.",
};

export const viewport:Viewport={
  themeColor:"#f7f9fc",
  viewportFit:"cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
