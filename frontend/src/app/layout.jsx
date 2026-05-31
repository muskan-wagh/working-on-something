import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata = {
  title: "API Guardian",
  description: "AI-powered API monitoring and debugging",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-56 p-8">{children}</main>
      </body>
    </html>
  );
}
