export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Flowforge Studio</p>
        <p>Built with Next.js + Cloudflare</p>
      </div>
    </footer>
  );
}
