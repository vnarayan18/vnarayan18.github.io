import React, { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/*
  Portfolio Collections Page – single‑file React app

  Purpose
  =======
  A clean, responsive "collections" gallery like a streetwear e‑commerce grid,
  adapted for a project portfolio. Swap the sample PROJECTS[] with your own.

  How to use
  ==========
  1) Keep this as App.jsx in a Vite/Next/CRA project with Tailwind and shadcn/ui.
  2) Replace items in PROJECTS[] below. Provide: id, title, year, tags, role, tools, images.
  3) Optional: edit BRAND in CONFIG.

  Notes
  =====
  • Images: you can use external URLs. Two per project will enable hover-swap.
  • This file avoids any backend and cart logic.
  • Styling relies on Tailwind and shadcn/ui. Ensure those are installed.
*/

// -------------------- CONFIG --------------------
const CONFIG = {
  BRAND: {
    name: "V. Narayan Kushwaha",
    logoText: "VNK",
    tagline: "Selected Projects",
  },
  GRID: {
    perPage: 12,
  },
};

// -------------------- SAMPLE DATA --------------------
const PROJECTS = [
  {
    id: "p1",
    title: "Green Home Stay – Website & Brand",
    year: 2025,
    role: "Designer, Engineer",
    tools: ["Figma", "Next.js", "Tailwind"],
    tags: ["web", "brand", "hospitality"],
    images: [
      placeholder(1, "#111827", "#1f2937"),
      placeholder(2, "#1f2937", "#374151"),
    ],
    summary:
      "Responsive site and identity for a family‑run homestay. Booking‑first UX, fast pages, and reusable components.",
  },
  {
    id: "p2",
    title: "DREAM Lab – Print Queue Automation",
    year: 2024,
    role: "Full‑stack",
    tools: ["Python", "Flask", "PostgreSQL"],
    tags: ["automation", "backend", "3d‑printing"],
    images: [placeholder(3, "#0b3b2d", "#14532d"), placeholder(4, "#064e3b", "#065f46")],
    summary:
      "Reduced turn‑around with automated triage, G‑code linting, and operator dashboards.",
  },
  {
    id: "p3",
    title: "Sketch Consultants – Elevation Renders",
    year: 2023,
    role: "Visualization",
    tools: ["SketchUp", "Lumion", "Photoshop"],
    tags: ["architecture", "render"],
    images: [placeholder(5, "#1f2937", "#0ea5e9"), placeholder(6, "#0ea5e9", "#38bdf8")],
    summary:
      "Photorealistic facades, material studies, and lighting for client approvals.",
  },
  {
    id: "p4",
    title: "Composite Materials – Lab Reports",
    year: 2024,
    role: "Research Assistant",
    tools: ["LaTeX", "MATLAB"],
    tags: ["research", "materials"],
    images: [placeholder(7, "#0f172a", "#1e293b"), placeholder(8, "#1e293b", "#334155")],
    summary:
      "Electrical behavior of boron fiber as conductive and polarizable medium.",
  },
  // Duplicate to simulate a full grid. Replace or remove as needed.
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `extra-${i}`,
    title: `Project ${i + 1}`,
    year: 2022 + ((i % 4) as number),
    role: "Contributor",
    tools: ["ToolA", "ToolB"],
    tags: ["web", i % 2 ? "backend" : "frontend"],
    images: [placeholder(10 + i, "#111827", "#27272a"), placeholder(20 + i, "#27272a", "#3f3f46")],
    summary: "Short summary for placeholder project.",
  })),
];

// -------------------- HELPERS --------------------
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function placeholder(seed = 1, from = "#111827", to = "#1f2937") {
  // Lightweight SVG gradient placeholder. Stable per seed.
  const svg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 1200'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='${from}'/>
          <stop offset='100%' stop-color='${to}'/>
        </linearGradient>
      </defs>
      <rect width='1200' height='1200' fill='url(#g)'/>
      <g fill='white' fill-opacity='0.12'>
        <circle cx='${200 + (seed * 97) % 800}' cy='${220 + (seed * 67) % 760}' r='${160 + (seed * 13) % 180}'/>
        <circle cx='${820 - (seed * 41) % 560}' cy='${880 - (seed * 59) % 640}' r='${120 + (seed * 17) % 140}'/>
      </g>
    </svg>
  `);
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

// -------------------- APP --------------------
export default function App() {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [sort, setSort] = useState("new"); // new | old | az | za
  const [yearRange, setYearRange] = useState([2019, 2025]);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // derive tag list and year bounds
  const allTags = useMemo(() => {
    const s = new Set();
    PROJECTS.forEach(p => p.tags.forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, []);

  const minYear = useMemo(() => Math.min(...PROJECTS.map(p => p.year)), []);
  const maxYear = useMemo(() => Math.max(...PROJECTS.map(p => p.year)), []);

  useEffect(() => {
    setYearRange([minYear, maxYear]);
  }, [minYear, maxYear]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROJECTS.filter(p => {
      const inQuery = !q ||
        p.title.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.tools.join(" ").toLowerCase().includes(q) ||
        p.tags.join(" ").toLowerCase().includes(q);
      const inTags = activeTags.length === 0 || activeTags.every(t => p.tags.includes(t));
      const inYear = p.year >= yearRange[0] && p.year <= yearRange[1];
      return inQuery && inTags && inYear;
    })
      .sort((a, b) => {
        if (sort === "new") return b.year - a.year;
        if (sort === "old") return a.year - b.year;
        if (sort === "az") return a.title.localeCompare(b.title);
        if (sort === "za") return b.title.localeCompare(a.title);
        return 0;
      });
  }, [query, activeTags, sort, yearRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CONFIG.GRID.perPage));
  const start = (page - 1) * CONFIG.GRID.perPage;
  const current = filtered.slice(start, start + CONFIG.GRID.perPage);

  useEffect(() => {
    // reset to page 1 if filters change
    setPage(1);
  }, [query, activeTags, sort, yearRange]);

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <Header onOpenFilters={() => setMobileFiltersOpen(true)} />

      {/* Hero */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="max-w-7xl mx-auto flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{CONFIG.BRAND.tagline}</h1>
            <p className="mt-2 text-sm text-zinc-400">Portfolio collections. Filter by tag, year, or search.</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <SortControl value={sort} onChange={setSort} />
          </div>
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* Controls */}
      <section className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar filters */}
          <aside className="hidden md:block md:col-span-3 lg:col-span-2">
            <Filters
              allTags={allTags}
              activeTags={activeTags}
              setActiveTags={setActiveTags}
              yearRange={yearRange}
              setYearRange={setYearRange}
              minYear={minYear}
              maxYear={maxYear}
            />
          </aside>

          {/* Main */}
          <div className="md:col-span-9 lg:col-span-10">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <SearchBar value={query} onChange={setQuery} />
              <div className="flex md:hidden items-center gap-2">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="secondary" className="gap-2"><Filter className="h-4 w-4" /> Filters</Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 bg-zinc-950 text-zinc-100 border-zinc-800">
                    <div className="pt-10">
                      <Filters
                        allTags={allTags}
                        activeTags={activeTags}
                        setActiveTags={setActiveTags}
                        yearRange={yearRange}
                        setYearRange={setYearRange}
                        minYear={minYear}
                        maxYear={maxYear}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
                <SortControl value={sort} onChange={setSort} />
              </div>
            </div>

            {/* Active tag chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {activeTags.map(t => (
                <Badge key={t} variant="secondary" className="bg-zinc-800 text-zinc-200">
                  <div className="flex items-center gap-1">
                    <span>#{t}</span>
                    <button onClick={() => setActiveTags(activeTags.filter(x => x !== t))} aria-label={`remove ${t}`} className="ml-1 rounded hover:bg-zinc-700 p-0.5">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Badge>
              ))}
            </div>

            {/* Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {current.map(p => (
                <ProjectCard key={p.id} p={p} onOpen={() => { setSelected(p); setOpen(true); }} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button size="sm" variant="secondary" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm text-zinc-400">Page {page} / {totalPages}</div>
              <Button size="sm" variant="secondary" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Quick View Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-zinc-950 text-zinc-100 border-zinc-800 p-0 overflow-hidden">
          <DialogHeader className="sr-only"><DialogTitle>Project</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative aspect-square w-full">
              <Gallery images={selected?.images || []} />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold tracking-tight">{selected?.title}</h3>
              <div className="mt-2 text-sm text-zinc-400">{selected?.year} • {selected?.role}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selected?.tags?.map(t => <Badge key={t} variant="outline" className="border-zinc-700 text-zinc-300">#{t}</Badge>)}
              </div>
              <p className="mt-4 text-sm text-zinc-300 leading-relaxed">{selected?.summary}</p>
              <Separator className="my-4 bg-zinc-800" />
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Tools</div>
                <div className="flex flex-wrap gap-2">
                  {selected?.tools?.map(t => <Badge key={t} variant="secondary" className="bg-zinc-800">{t}</Badge>)}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// -------------------- UI PIECES --------------------
function Header({ onOpenFilters }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70 bg-zinc-950/80 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-zinc-100 text-zinc-900 grid place-items-center font-bold">{CONFIG.BRAND.logoText}</div>
          <span className="hidden sm:inline text-sm text-zinc-300">{CONFIG.BRAND.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex text-sm text-zinc-300 gap-6">
            <a className="hover:text-white" href="#">Work</a>
            <a className="hover:text-white" href="#">About</a>
            <a className="hover:text-white" href="#">Contact</a>
          </nav>
          <div className="md:hidden">
            <Button size="sm" variant="secondary" onClick={onOpenFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search projects"
        className="pl-8 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
      />
    </div>
  );
}

function SortControl({ value, onChange }) {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-full md:w-auto">
      <TabsList className="grid grid-cols-4 bg-zinc-900 border border-zinc-800">
        <TabsTrigger value="new">Newest</TabsTrigger>
        <TabsTrigger value="old">Oldest</TabsTrigger>
        <TabsTrigger value="az">A–Z</TabsTrigger>
        <TabsTrigger value="za">Z–A</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function Filters({ allTags, activeTags, setActiveTags, yearRange, setYearRange, minYear, maxYear }) {
  const toggleTag = (t) => {
    setActiveTags(activeTags.includes(t) ? activeTags.filter(x => x !== t) : [...activeTags, t]);
  };

  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-500 mb-3">Filters</div>

      <div className="mb-6">
        <div className="text-sm text-zinc-300 mb-2">Tags</div>
        <div className="flex flex-wrap gap-2">
          {allTags.map(t => (
            <Badge
              key={t}
              onClick={() => toggleTag(t)}
              className={cx(
                "cursor-pointer select-none border border-zinc-800",
                activeTags.includes(t) ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-zinc-300"
              )}
            >
              #{t}
            </Badge>
          ))}
        </div>
      </div>

      <Separator className="bg-zinc-800 mb-6" />

      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-zinc-300">Year</div>
        <div className="text-xs text-zinc-500">{yearRange[0]}–{yearRange[1]}</div>
      </div>
      <Slider
        value={yearRange}
        min={minYear}
        max={maxYear}
        step={1}
        onValueChange={setYearRange}
        className=""
      />

      <div className="mt-6">
        <Button size="sm" variant="secondary" onClick={() => { setActiveTags([]); setYearRange([minYear, maxYear]); }}>
          Reset
        </Button>
      </div>
    </div>
  );
}

function ProjectCard({ p, onOpen }) {
  return (
    <Card className="group bg-zinc-900 border-zinc-800 overflow-hidden rounded-2xl">
      <div className="relative aspect-square">
        <HoverSwap images={p.images} />
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium line-clamp-1">{p.title}</h3>
          <span className="text-xs text-zinc-500">{p.year}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {p.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">#{t}</span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button className="w-full" variant="secondary" onClick={onOpen}>Quick view</Button>
      </CardFooter>
    </Card>
  );
}

function HoverSwap({ images }) {
  const a = images?.[0];
  const b = images?.[1] || images?.[0];
  return (
    <div className="absolute inset-0">
      <img src={a} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
      <img src={b} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
    </div>
  );
}

function Gallery({ images }) {
  const [idx, setIdx] = useState(0);
  const safe = images?.length ? images : [placeholder(99)];
  return (
    <div className="relative h-full w-full">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={safe[idx]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0.0, scale: 1.02 }}
          animate={{ opacity: 1.0, scale: 1.0 }}
          exit={{ opacity: 0.0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
        />
      </AnimatePresence>
      {safe.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-zinc-900/60 backdrop-blur px-2 py-1 rounded-full border border-zinc-800">
          {safe.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={cx(
                "h-2 w-2 rounded-full transition",
                idx === i ? "bg-zinc-100" : "bg-zinc-500"
              )}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-zinc-400">© {new Date().getFullYear()} {CONFIG.BRAND.name}</div>
          <div className="text-xs text-zinc-500 mt-1">Built with React, Tailwind, and shadcn/ui.</div>
        </div>
        <div className="sm:text-right text-sm text-zinc-400">Contact • <a href="mailto:vibhutik@buffalo.edu" className="underline">vibhutik@buffalo.edu</a></div>
      </div>
    </footer>
  );
}
