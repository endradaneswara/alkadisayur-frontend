import Link from "next/link";
import { ArrowDown, Clock3, MapPin, Sprout, UserRound } from "lucide-react";
import { storeLinks } from "@/lib/store-links";

export function StoreFooter() {
  return (
    <footer
      className="border-t rounded-t-[1.75rem] border border-border bg-primary text-primary-foreground"
      id="kontak"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_0.8fr_1fr] lg:px-8">
        <div>
          <Link
            aria-label="Alkadi Sayur, kembali ke atas"
            className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground"
            href="/store"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <Sprout aria-hidden="true" className="size-6" />
            </span>
            <span className="flex flex-col">
              <span className="font-heading text-lg leading-none font-semibold">
                alkadi
              </span>
              <span className="mt-1 text-[10px] leading-none font-medium tracking-[0.16em] uppercase opacity-75">
                toko sayur
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-primary-foreground/75">
            Temukan pilihan sayur dan kebutuhan dapur untuk menemani
            keseharian keluarga.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold">Jelajahi</h2>
          <nav
            aria-label="Navigasi footer"
            className="mt-4 flex flex-col gap-3"
          >
            {storeLinks.map((link) => (
              <Link
                className="w-fit text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold">Informasi toko</h2>
          <div className="mt-4 flex flex-col gap-4 text-sm text-primary-foreground/75">
            <p className="flex items-start gap-3">
              <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <span>Alamat toko akan ditambahkan.</span>
            </p>
            <p className="flex items-start gap-3">
              <Clock3
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              <span>06.00 - 23.00</span>
            </p>
            <p className="flex items-start gap-3">
              <UserRound
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0"
              />
              <span>081215770290</span>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-primary-foreground/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Toko Sayur Alkadi.</p>
          <a
            className="inline-flex w-fit items-center gap-2 hover:text-primary-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
            href="#hero-title"
          >
            Kembali ke atas
            <ArrowDown aria-hidden="true" className="size-3 rotate-180" />
          </a>
        </div>
      </div>
    </footer>
  );
}
