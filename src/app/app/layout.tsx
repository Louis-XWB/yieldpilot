import { NavHeader } from "@/components/shared/nav-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavHeader />
      <main className="pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
      <footer className="fixed bottom-0 w-full py-3 text-center text-text-muted text-xs bg-background/80 backdrop-blur-sm border-t border-card-border/30">
        Powered by{" "}
        <a href="https://li.fi" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">LI.FI</a>{" "}
        Earn × AI
      </footer>
    </>
  );
}
