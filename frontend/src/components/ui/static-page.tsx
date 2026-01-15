import { Package } from "lucide-react";

export default function StaticPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8">
        <Package className="w-10 h-10 text-zinc-400" />
      </div>
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">{title}</h1>
      <p className="text-zinc-500 max-w-lg mx-auto leading-relaxed">{description}</p>
    </div>
  );
}
