import Link from "next/link";
import {
    ArrowRight,
    Braces,
    Database,
    GitBranch,
    History,
    Upload,
    Keyboard,
    Layers3,
    ListChecks,
    Moon,
    Play,
    Save,
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
        tone: "accent-primary-soft",
    },
    {
        title: "Recursive query groups",
        description:
            "Build nested AND/OR logic visually with collapsible groups and dynamic rule controls.",
        icon: GitBranch,
        tone: "logic-or",
    },
    {
        title: "Live generated preview",
        description:
            "Every change updates a Mongo-style query object so users can see exactly what the builder creates.",
        icon: Braces,
        tone: "accent-export",
    },
    {
        title: "Simulated execution",
        description:
            "Run valid queries against mock records, inspect matching rows, sort results, and handle empty states.",
        icon: Play,
        tone: "state-valid",
    },
];

const capabilityCards = [
    { label: "Drag-and-drop rule ordering", icon: Layers3, iconTone: "icon-primary" },
    { label: "Keyboard shortcuts", icon: Keyboard, iconTone: "icon-or" },
    { label: "Saved presets", icon: Save, iconTone: "icon-success" },
    { label: "Query history", icon: History, iconTone: "icon-warning" },
    { label: "Import/export JSON", icon: Upload, iconTone: "icon-primary" },
    { label: "Dark/light mode", icon: Moon, iconTone: "icon-or" },
];

const workflowSteps = [
    { label: "Choose a schema", tone: "accent-primary-soft" },
    { label: "Build rules and groups", tone: "logic-or" },
    { label: "Preview generated JSON", tone: "accent-export" },
    { label: "Run against mock records", tone: "state-valid" },
];

export function LandingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-3 py-4 sm:px-5 lg:px-8">
                <nav className="liquid-shell flex items-center justify-between rounded-[2rem] px-4 py-3 sm:px-5">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="brand-mark flex h-9 w-9 items-center justify-center rounded-2xl border text-sm font-bold">
                            QN
                        </span>

                        <span className="text-sm font-semibold tracking-tight">
                            QueryNest
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

                    <Button
                        asChild
                        className="landing-get-started !border-[color:var(--accent-primary-border)] !bg-[color:var(--accent-primary)] !text-white hover:!border-[color:var(--accent-primary)] hover:!bg-[color:var(--accent-primary)] hover:!text-white active:!bg-[color:var(--accent-primary)]"
                    >
                        <Link href="/builder">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </nav>

                <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_520px] lg:py-12">
                    <div className="space-y-7">
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                variant="outline"
                                className="bg-transparent text-[color:var(--accent-primary)]"
                                style={{ borderColor: "var(--accent-primary-border)" }}
                            >
                                QueryNest Builder
                            </Badge>
                            <Badge
                                variant="outline"
                                className="bg-transparent text-[color:var(--accent-or)]"
                                style={{
                                    borderColor:
                                        "color-mix(in oklch, var(--accent-or) 58%, transparent)",
                                }}
                            >
                                Nested logic
                            </Badge>
                            <Badge variant="outline">TypeScript</Badge>
                        </div>

                        <div className="space-y-5">
                            <h1 className="max-w-5xl text-5xl font-semibold leading-none tracking-[-0.07em] sm:text-6xl lg:text-7xl">
                                Build complex queries without writing raw syntax.
                            </h1>

                            <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                                QueryNest is a black liquid-glass visual query builder for
                                creating filters, nesting conditions, previewing generated
                                query objects, validating input, and running simulated
                                searches.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="landing-get-started !border-[color:var(--accent-primary-border)] !bg-[color:var(--accent-primary)] !text-white hover:!border-[color:var(--accent-primary)] hover:!bg-[color:var(--accent-primary)] hover:!text-white active:!bg-[color:var(--accent-primary)]"
                            >
                                <Link href="/builder">
                                    Get Started
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                            <Button asChild size="lg" variant="outline" className="accent-action">
                                <a href="#features">See Features</a>
                            </Button>
                        </div>

                        <div
                            id="workflow"
                            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                        >
                            {workflowSteps.map((step, index) => (
                                <div
                                    key={step.label}
                                    className="liquid-surface rounded-2xl px-4 py-4"
                                >
                                    <span
                                        className={`${step.tone} inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold`}
                                    >
                                        {index + 1}
                                    </span>
                                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                        Step {index + 1}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold">
                                        {step.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="liquid-shell rounded-[2rem] p-4 sm:p-5">
                        <div className="liquid-readable rounded-[1.5rem] p-4">
                            <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                                <div>
                                    <p className="text-sm font-semibold">Live Query Preview</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Visual rules become structured output.
                                    </p>
                                </div>

                                <Badge
                                    variant="outline"
                                    className="bg-transparent text-[color:var(--accent-primary)]"
                                    style={{ borderColor: "var(--accent-primary-border)" }}
                                >
                                    Mongo-style
                                </Badge>
                            </div>

                            <div className="mt-4 grid gap-3">
                                <div className="liquid-surface rounded-2xl border-l-2 border-accent-primary p-4">
                                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                                        <span className="text-sm font-medium">Age</span>
                                        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                                            Greater than
                                        </span>
                                        <span className="json-number text-sm font-semibold">18</span>
                                    </div>
                                </div>

                                <div className="liquid-surface rounded-2xl border-l-2 border-accent-success p-4">
                                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                                        <span className="text-sm font-medium">Country</span>
                                        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                                            Equals
                                        </span>
                                        <span className="json-string text-sm font-semibold">Nigeria</span>
                                    </div>
                                </div>

                                <pre className="liquid-readable overflow-auto rounded-2xl p-4 font-mono text-xs leading-6">
                                    <span className="json-punctuation">{"{"}</span>
                                    {"\n  "}
                                    <span className="json-key">{'"$and"'}</span>
                                    <span className="json-punctuation">: [</span>
                                    {"\n    "}
                                    <span className="json-punctuation">{"{"}</span>
                                    {"\n      "}
                                    <span className="json-key">{'"age"'}</span>
                                    <span className="json-punctuation">: {"{"}</span>
                                    {"\n        "}
                                    <span className="json-operator">{'"$gt"'}</span>
                                    <span className="json-punctuation">: </span>
                                    <span className="json-number">18</span>
                                    {"\n      "}
                                    <span className="json-punctuation">{"}"}</span>
                                    {"\n    "}
                                    <span className="json-punctuation">{"}"}</span>
                                    <span className="json-punctuation">,</span>
                                    {"\n    "}
                                    <span className="json-punctuation">{"{"}</span>
                                    {"\n      "}
                                    <span className="json-key">{'"country"'}</span>
                                    <span className="json-punctuation">: {"{"}</span>
                                    {"\n        "}
                                    <span className="json-operator">{'"$eq"'}</span>
                                    <span className="json-punctuation">: </span>
                                    <span className="json-string">{'"Nigeria"'}</span>
                                    {"\n      "}
                                    <span className="json-punctuation">{"}"}</span>
                                    {"\n    "}
                                    <span className="json-punctuation">{"}"}</span>
                                    {"\n  "}
                                    <span className="json-punctuation">]</span>
                                    {"\n"}
                                    <span className="json-punctuation">{"}"}</span>
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
                                <div className={`${feature.tone} flex h-11 w-11 items-center justify-center rounded-2xl border`}>
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
                            <ShieldCheck className="h-5 w-5 icon-success" />
                            <p className="text-sm font-semibold">
                                Built for recursive UI engineering
                            </p>
                        </div>

                        <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                            A frontend system for visual logic, validation, execution,
                            persistence, and testing.
                        </h2>

                        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                            QueryNest uses a typed query tree, reusable schemas,
                            recursive rendering, immutable store updates, live preview
                            generation, validation feedback, browser tests, CI, and Vercel
                            deployment.
                        </p>
                    </div>

                    <div className="liquid-readable rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 icon-warning" />
                            <p className="text-sm font-semibold">Included interactions</p>
                        </div>

                        <div className="mt-4 grid gap-2">
                            {capabilityCards.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground"
                                    >
                                        <Icon className={`h-4 w-4 ${item.iconTone}`} />
                                        {item.label}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground">
                            <Keyboard className="h-4 w-4 icon-or" />
                            Tested with Vitest and Playwright
                        </div>

                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground">
                            <ListChecks className="h-4 w-4 icon-success" />
                            Responsive across desktop, tablet, and mobile
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}
