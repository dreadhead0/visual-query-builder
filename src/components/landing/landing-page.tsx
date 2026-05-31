import Link from "next/link";
import {
    ArrowRight,
    Braces,
    Database,
    GitBranch,
    Keyboard,
    Layers3,
    ListChecks,
    Play,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const featureCards = [
    {
        title: "Schema-driven controls",
        description:
            "Fields, operators, value inputs, validation, generated output, and result columns adapt to the selected dataset.",
        icon: Database,
    },
    {
        title: "Recursive query groups",
        description:
            "Build nested AND/OR logic visually with collapsible groups and dynamic rule controls.",
        icon: GitBranch,
    },
    {
        title: "Live generated preview",
        description:
            "Every change updates a Mongo-style query object so users can see exactly what the builder creates.",
        icon: Braces,
    },
    {
        title: "Simulated execution",
        description:
            "Run valid queries against mock records, inspect matching rows, sort results, and handle empty states.",
        icon: Play,
    },
];

const capabilityCards = [
    "Drag-and-drop rule ordering",
    "Keyboard shortcuts",
    "Saved presets",
    "Query history",
    "Import/export JSON",
    "Dark/light mode",
];

export function LandingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-3 py-4 sm:px-5 lg:px-8">
                <nav className="liquid-shell flex items-center justify-between rounded-[2rem] px-4 py-3 sm:px-5">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-primary text-sm font-bold text-primary-foreground">
                            VQ
                        </span>

                        <span className="text-sm font-semibold tracking-tight">
                            Visual Query Builder
                        </span>
                    </Link>

                    <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                        <a href="#features" className="hover:text-foreground">
                            Features
                        </a>
                        <a href="#workflow" className="hover:text-foreground">
                            Workflow
                        </a>
                        <a href="#architecture" className="hover:text-foreground">
                            Architecture
                        </a>
                    </div>

                    <Button asChild>
                        <Link href="/builder">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </nav>

                <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:py-12">
                    <div className="space-y-7">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Stage 8 Finalist Project</Badge>
                            <Badge variant="outline">Next.js App Router</Badge>
                            <Badge variant="outline">TypeScript</Badge>
                        </div>

                        <div className="space-y-5">
                            <h1 className="max-w-5xl text-5xl font-semibold leading-none tracking-[-0.07em] sm:text-6xl lg:text-7xl">
                                Build complex queries without writing raw syntax.
                            </h1>

                            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                                A black liquid-glass visual query builder for creating
                                filters, nesting conditions, previewing generated query
                                objects, validating input, and running simulated searches.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button asChild size="lg">
                                <Link href="/builder">
                                    Get Started
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                            <Button asChild size="lg" variant="outline">
                                <a href="#features">See Features</a>
                            </Button>
                        </div>

                        <div
                            id="workflow"
                            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                        >
                            {[
                                "Choose a schema",
                                "Build rules and groups",
                                "Preview generated JSON",
                                "Run against mock records",
                            ].map((step, index) => (
                                <div
                                    key={step}
                                    className="liquid-surface rounded-2xl px-4 py-4"
                                >
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                        Step {index + 1}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="liquid-shell liquid-topline rounded-[2rem] p-4 sm:p-5">
                        <div className="liquid-readable rounded-[1.5rem] p-4">
                            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                                <div>
                                    <p className="text-sm font-semibold">Live Query Preview</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Visual rules become structured output.
                                    </p>
                                </div>

                                <Badge variant="outline">Mongo-style</Badge>
                            </div>

                            <div className="mt-4 grid gap-3">
                                <div className="liquid-surface rounded-2xl p-4">
                                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                                        <span className="text-sm font-medium">Age</span>
                                        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                                            Greater than
                                        </span>
                                        <span className="text-sm font-semibold">18</span>
                                    </div>
                                </div>

                                <div className="liquid-surface rounded-2xl p-4">
                                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                                        <span className="text-sm font-medium">Country</span>
                                        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                                            Equals
                                        </span>
                                        <span className="text-sm font-semibold">Nigeria</span>
                                    </div>
                                </div>

                                <pre className="liquid-readable overflow-auto rounded-2xl p-4 font-mono text-xs leading-6 text-muted-foreground">
                                    <code>{`{
  "$and": [
    {
      "age": {
        "$gt": 18
      }
    },
    {
      "country": {
        "$eq": "Nigeria"
      }
    }
  ]
}`}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="grid gap-4 pb-6 md:grid-cols-2">
                    {featureCards.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <article
                                key={feature.title}
                                className="liquid-panel rounded-[1.75rem] p-5"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-primary text-primary-foreground">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h2 className="mt-5 text-lg font-semibold tracking-tight">
                                    {feature.title}
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {feature.description}
                                </p>
                            </article>
                        );
                    })}
                </section>

                <section
                    id="architecture"
                    className="liquid-shell mb-6 grid gap-5 rounded-[2rem] p-5 lg:grid-cols-[minmax(0,1fr)_420px]"
                >
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5" />
                            <p className="text-sm font-semibold">
                                Built for recursive UI engineering
                            </p>
                        </div>

                        <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                            A frontend system for visual logic, validation, execution,
                            persistence, and testing.
                        </h2>

                        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                            The project uses a typed query tree, reusable schemas,
                            recursive rendering, immutable store updates, live preview
                            generation, validation feedback, browser tests, CI, and Vercel
                            deployment.
                        </p>
                    </div>

                    <div className="liquid-readable rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <p className="text-sm font-semibold">Included interactions</p>
                        </div>

                        <div className="mt-4 grid gap-2">
                            {capabilityCards.map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground"
                                >
                                    <ListChecks className="h-4 w-4 text-foreground" />
                                    {item}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground">
                            <Keyboard className="h-4 w-4 text-foreground" />
                            Tested with Vitest and Playwright
                        </div>

                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground">
                            <Layers3 className="h-4 w-4 text-foreground" />
                            Responsive across desktop, tablet, and mobile
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}