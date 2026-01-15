import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-zinc-900">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">PULLEX</h3>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">
               The original sportswear brand for the modern athlete. Designed in Indonesia.
            </p>
          </div>

          {/* Column 2: Products */}
          <div className="space-y-6">
             <h4 className="text-sm font-bold uppercase tracking-widest">PRODUCTS</h4>
             <ul className="space-y-3 text-xs font-medium text-zinc-400">
                <li><Link href="/products?category=shoes" className="hover:text-white transition-colors">Sepatu</Link></li>
                <li><Link href="/products?category=men" className="hover:text-white transition-colors">Pakaian</Link></li>
                <li><Link href="/products?sort=newest" className="hover:text-white transition-colors">Produk Terbaru</Link></li>
             </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-6">
             <h4 className="text-sm font-bold uppercase tracking-widest">SUPPORT</h4>
             <ul className="space-y-3 text-xs font-medium text-zinc-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
             </ul>
          </div>

          {/* Column 4: Social */}
          <div className="space-y-6">
             <h4 className="text-sm font-bold uppercase tracking-widest">FOLLOW US</h4>
             <div className="flex gap-4">
                <Link href="https://instagram.com" target="_blank" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                   <Instagram className="w-5 h-5" />
                </Link>
                <Link href="https://twitter.com" target="_blank" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                   <Twitter className="w-5 h-5" />
                </Link>
                <Link href="https://youtube.com" target="_blank" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                   <Youtube className="w-5 h-5" />
                </Link>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-zinc-900 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
           <p>© 2026 PULLEX INDONESIA. ALL RIGHTS RESERVED.</p>
           <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
           </div>
        </div>
      </div>
    </footer>
  );
}
