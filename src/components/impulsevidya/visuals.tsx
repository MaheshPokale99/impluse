"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    CalendarDays,
    Check,
    CheckCheck,
    ChevronDown,
    CircleHelp,
    Clock3,
    Compass,
    FileText,
    GraduationCap,
    HeartHandshake,
    LibraryBig,
    ListChecks,
    MessageSquare,
    Search,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    Users,
    Workflow,
} from "lucide-react";
import type { IconName } from "./content";
import { siteImages } from "./assets";

const icons = {
    campus: GraduationCap,
    users: Users,
    attendance: CheckCheck,
    courses: BookOpen,
    fees: Target,
    insights: TrendingUp,
    assignments: ListChecks,
    exams: FileText,
    files: LibraryBig,
    calendar: CalendarDays,
    library: LibraryBig,
    feedback: MessageSquare,
    shield: ShieldCheck,
    sparkles: Sparkles,
    heart: HeartHandshake,
    settings: Compass,
    clock: Clock3,
    chart: TrendingUp,
};

export function Icon({
    name,
    size = 24,
    className = "",
}: {
    name: IconName;
    size?: number;
    className?: string;
}) {
    const Component = icons[name];
    return <Component size={size} className={className} aria-hidden="true" strokeWidth={1.7} />;
}

export function Brand({ small = false }: { small?: boolean }) {
    return (
        <span className={`iv-brand ${small ? "iv-brand-small" : ""}`}>
            <span className="iv-brand-mark">
                <BookOpen aria-hidden="true" />
            </span>
            <span>
                IMPULSE<span className="iv-brand-dot">VIDYA.</span>
            </span>
        </span>
    );
}

export const dashboardTabs = [
    "My plan",
    "Exams",
    "Skills",
    "Career",
    "Milestones",
    "Notes",
] as const;
export type DashboardTab = (typeof dashboardTabs)[number];

const tabIcons: IconName[] = ["chart", "exams", "assignments", "insights", "calendar", "feedback"];
const tabDetails: Record<DashboardTab, { title: string; subtitle: string; items: string[] }> = {
    "My plan": {
        title: "This week, one step at a time",
        subtitle: "A balanced plan built around your current priorities.",
        items: [
            "Review your target exam options",
            "Practise one timed problem set",
            "Write down questions for your mentor",
        ],
    },
    Exams: {
        title: "Make exam preparation feel manageable",
        subtitle: "Keep the syllabus, practice and milestones in view.",
        items: [
            "Choose the next topic to revise",
            "Try a short timed practice set",
            "Review what felt difficult",
        ],
    },
    Skills: {
        title: "Build skills with useful practice",
        subtitle: "Turn a broad interest into a small project or learning goal.",
        items: [
            "Pick one skill to strengthen",
            "Set aside time for deliberate practice",
            "Save one example of your work",
        ],
    },
    Career: {
        title: "Explore before you commit",
        subtitle: "Compare options with your interests and current strengths.",
        items: [
            "List roles you want to understand",
            "Find the skills each path asks for",
            "Choose one person to learn from",
        ],
    },
    Milestones: {
        title: "Notice the progress you are making",
        subtitle: "Break long-term goals into steps you can revisit.",
        items: [
            "Review a completed learning goal",
            "Update your short-term priority",
            "Set a realistic next milestone",
        ],
    },
    Notes: {
        title: "Keep the questions that matter close",
        subtitle: "Bring your reflections and decisions into one clear view.",
        items: [
            "Write down what is still unclear",
            "Capture advice you want to revisit",
            "Prepare for your next check-in",
        ],
    },
};

export function Dashboard({
    initialTab = "My plan",
    compact = false,
}: {
    initialTab?: DashboardTab;
    compact?: boolean;
}) {
    const [tab, setTab] = useState<DashboardTab>(initialTab);
    const reduced = useReducedMotion();
    const detail = tabDetails[tab];
    return (
        <div className={`iv-dashboard ${compact ? "is-compact" : ""}`}>
            <aside className="iv-dash-sidebar">
                <Brand small />
                <div className="iv-campus-selector">
                    <span>
                        <GraduationCap size={15} />
                    </span>
                    <div>
                        <strong>Student workspace</strong>
                        <small>Your goals and next steps</small>
                    </div>
                    <ChevronDown size={12} />
                </div>
                <small className="iv-dash-label">YOUR JOURNEY</small>
                <div
                    className="iv-dash-tabs"
                    role="tablist"
                    aria-label="Explore the student plan preview"
                >
                    {dashboardTabs.map((name, index) => (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tab === name}
                            aria-controls={`guidance-${compact ? "compact" : "full"}-panel`}
                            key={name}
                            onClick={() => setTab(name)}
                            tabIndex={compact ? -1 : 0}
                            className={tab === name ? "is-active" : ""}
                        >
                            <Icon name={tabIcons[index]} size={15} />
                            {name}
                            {name === "My plan" && <span>3</span>}
                        </button>
                    ))}
                </div>
                <div className="iv-dash-help">
                    <span>
                        <Sparkles size={16} />
                    </span>
                    <strong>Clarity beats pressure.</strong>
                    <p>Start with one next step.</p>
                    <div>
                        Guidance, at your pace <ArrowUpRight size={11} />
                    </div>
                </div>
                <div className="iv-dash-user">
                    <span>ST</span>
                    <div>
                        <strong>Student view</strong>
                        <small>Example workspace</small>
                    </div>
                    <Search size={14} />
                </div>
            </aside>
            <div className="iv-dash-main">
                <div className="iv-dash-topbar">
                    <span>{tab}</span>
                    <div>
                        <span className="iv-demo-tag">Interactive preview</span>
                        <CircleHelp size={15} />
                        <span className="iv-avatar">S</span>
                    </div>
                </div>
                <div className="iv-dash-content">
                    <div className="iv-dash-greeting">
                        <div>
                            <h3>
                                A good day to move forward
                                <span className="iv-greeting-spark"> ✦</span>
                            </h3>
                            <p>A practical learning plan shaped around your goals.</p>
                        </div>
                        <span className="iv-dash-date">
                            <CalendarDays size={12} /> Your learning journey
                        </span>
                    </div>
                    <div className="iv-stat-grid">
                        {[
                            {
                                label: "Current focus",
                                value: "JEE Main",
                                icon: "exams" as IconName,
                                note: "Example goal",
                            },
                            {
                                label: "Next milestone",
                                value: "Practice",
                                icon: "assignments" as IconName,
                                note: "One step at a time",
                            },
                            {
                                label: "Plan check-in",
                                value: "Weekly",
                                icon: "calendar" as IconName,
                                note: "Review and adjust",
                            },
                        ].map((stat, index) => (
                            <div className="iv-stat" key={stat.label}>
                                <div>
                                    <span>{stat.label}</span>
                                    <span className={`iv-stat-icon tone-${index}`}>
                                        <Icon name={stat.icon} size={15} />
                                    </span>
                                </div>
                                <strong>{stat.value}</strong>
                                <small>{stat.note}</small>
                            </div>
                        ))}
                    </div>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={tab}
                            id={`guidance-${compact ? "compact" : "full"}-panel`}
                            role="tabpanel"
                            initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="iv-chart-grid iv-guidance-chart-grid">
                                <div className="iv-chart-card iv-guidance-plan">
                                    <div className="iv-card-top">
                                        <h4>{detail.title}</h4>
                                        <span>
                                            This week <ChevronDown size={11} />
                                        </span>
                                    </div>
                                    <p className="iv-guidance-subtitle">{detail.subtitle}</p>
                                    <div className="iv-guidance-steps">
                                        {detail.items.map((item, index) => (
                                            <div className="iv-guidance-step" key={item}>
                                                <span className={index === 0 ? "is-current" : ""}>
                                                    {index === 0 ? (
                                                        <ArrowRight size={12} />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </span>
                                                <p>{item}</p>
                                                <small>{index === 0 ? "Next up" : "Planned"}</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="iv-chart-card iv-performance iv-guidance-progress">
                                    <div className="iv-card-top">
                                        <h4>A plan you can follow</h4>
                                        <span>
                                            <ShieldCheck size={14} />
                                        </span>
                                    </div>
                                    <div className="iv-donut iv-guidance-donut">
                                        <svg viewBox="0 0 120 120" aria-hidden="true">
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="49"
                                                fill="none"
                                                stroke="#edf0f1"
                                                strokeWidth="11"
                                            />
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="49"
                                                fill="none"
                                                stroke="#c87643"
                                                strokeWidth="11"
                                                strokeDasharray="252 308"
                                                strokeLinecap="round"
                                                transform="rotate(-90 60 60)"
                                            />
                                        </svg>
                                        <div>
                                            <strong>
                                                3<span>/4</span>
                                            </strong>
                                            <small>steps mapped</small>
                                        </div>
                                    </div>
                                    <div className="iv-donut-legend">
                                        <span>
                                            <i /> Clear next steps <b>3</b>
                                        </span>
                                        <span>
                                            <i /> Room to adjust <b>1</b>
                                        </span>
                                    </div>
                                    <p className="iv-guidance-footnote">
                                        Illustrative plan only. Your path is personal.
                                    </p>
                                </div>
                            </div>
                            <div className="iv-activity-list iv-guidance-activity">
                                <div className="iv-card-top">
                                    <h4>A note to come back to</h4>
                                    <MessageSquare size={15} />
                                </div>
                                <div className="iv-activity-row">
                                    <span className="iv-activity-icon">
                                        <Sparkles size={15} />
                                    </span>
                                    <div>
                                        <strong>Keep the plan realistic</strong>
                                        <p>
                                            Make time for practice, rest, and the parts of life
                                            outside your goals.
                                        </p>
                                    </div>
                                    <small>Mentor note</small>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    <div className="iv-dash-caption">
                        <ShieldCheck size={11} />
                        <span>Illustrative workspace · Example data</span>
                        <span>Make the next step yours.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ModuleOrbit() {
    const reduced = useReducedMotion();
    const items: { icon: IconName; label: string }[] = [
        { icon: "exams", label: "Exams" },
        { icon: "courses", label: "Learning" },
        { icon: "insights", label: "Career" },
        { icon: "heart", label: "Mentorship" },
        { icon: "files", label: "Resources" },
        { icon: "calendar", label: "Milestones" },
    ];
    const paths = [
        "M80 70H135Q155 70 155 90V155Q155 175 180 175H225",
        "M80 175H225",
        "M80 280H135Q155 280 155 260V195Q155 175 180 175H225",
        "M375 70H320Q300 70 300 90V155Q300 175 280 175H225",
        "M375 175H225",
        "M375 280H320Q300 280 300 260V195Q300 175 280 175H225",
    ];
    return (
        <div
            className="iv-orbit iv-network"
            aria-label="A connected student guidance plan across exams, learning, careers and mentorship"
        >
            <svg className="iv-network-lines" viewBox="0 0 450 350" fill="none" aria-hidden="true">
                {paths.map((path, index) => (
                    <g key={path}>
                        <path d={path} stroke="#dededb" strokeWidth="1.5" />
                        <motion.path
                            d={path}
                            stroke="#c87643"
                            strokeWidth="1.5"
                            initial={{ pathLength: reduced ? 1 : 0, opacity: 0.4 }}
                            whileInView={{ pathLength: 1, opacity: 0.65 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.6, delay: index * 0.12, ease: "easeInOut" }}
                        />
                    </g>
                ))}
            </svg>
            <div className="iv-orbit-center">
                <Brand small />
                <span>Your next step</span>
            </div>
            {items.map((item, index) => (
                <motion.div
                    key={item.label}
                    className={`iv-orbit-node node-${index}`}
                    initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={reduced ? undefined : { y: -3, scale: 1.035 }}
                    whileTap={reduced ? undefined : { scale: 0.98 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: index * 0.09 }}
                >
                    <Icon name={item.icon} size={28} />
                    <span>{item.label}</span>
                </motion.div>
            ))}
        </div>
    );
}

export function CampusArtwork({
    icon = "campus",
    label = "A path shaped around you",
    variant = "blue",
}: {
    icon?: IconName;
    label?: string;
    variant?: "blue" | "light";
}) {
    const reduced = useReducedMotion();
    const tiles: [IconName, string][] = [
        ["exams", "Exam planning"],
        ["courses", "Study habits"],
        ["insights", "Career options"],
        ["heart", "Mentor check-ins"],
    ];
    return (
        <div className={`iv-original-art iv-art-${variant}`} role="img" aria-label={label}>
            <span className="iv-art-orb orb-one" />
            <span className="iv-art-orb orb-two" />
            <svg className="iv-art-lines" viewBox="0 0 520 320" fill="none" aria-hidden="true">
                <path
                    d="M35 220h105l34-44h160l38 50h113M104 70h95l48 50h118l54-40h65M60 148h78l32-27h113M345 250h54l40-35h40"
                    stroke="#d9b9a1"
                    strokeWidth="2"
                    strokeDasharray="4 8"
                    strokeLinecap="round"
                />
            </svg>
            <div className="iv-art-campus">
                <span>
                    <Icon name={icon} size={43} />
                </span>
                <strong>{label}</strong>
                <small>Direction · Practice · Progress</small>
            </div>
            {tiles.map(([tileIcon, title], index) => (
                <motion.div
                    className={`iv-art-tile tile-${["one", "two", "three", "four"][index]}`}
                    key={title}
                    initial={{
                        opacity: reduced ? 1 : 0,
                        y: reduced ? 0 : 12,
                        scale: reduced ? 1 : 0.92,
                    }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                        duration: 0.5,
                        delay: reduced ? 0 : index * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <Icon name={tileIcon} size={21} />
                    <span>{title}</span>
                </motion.div>
            ))}
        </div>
    );
}

export function ResourceArtwork({ icon, label }: { icon: IconName; label: string }) {
    if (icon === "insights" || icon === "exams") {
        return (
            <Image
                className="iv-resource-art-photo"
                src={siteImages.studyPlanning}
                alt=""
                fill
                sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw"
            />
        );
    }
    return <CampusArtwork icon={icon} label={label} />;
}

export function MiniWorkflow() {
    const items: { icon: IconName; title: string; text: string }[] = [
        { icon: "chart", title: "Name what matters", text: "Start from your goals and questions." },
        {
            icon: "courses",
            title: "Make a practical plan",
            text: "Turn choices into manageable steps.",
        },
        {
            icon: "assignments",
            title: "Learn by doing",
            text: "Build confidence through practice.",
        },
        { icon: "heart", title: "Review and adjust", text: "Keep moving at a pace that fits." },
    ];
    return (
        <div className="iv-mini-workflow">
            <div className="iv-mini-heading">
                <span>
                    <Workflow size={17} /> Your guidance roadmap
                </span>
                <span className="iv-status">Built around you</span>
            </div>
            {items.map((item) => (
                <div className="iv-workflow-item" key={item.title}>
                    <span className="iv-workflow-icon">
                        <Icon name={item.icon} size={22} />
                    </span>
                    <div>
                        <strong>{item.title}</strong>
                        <p>{item.text}</p>
                    </div>
                    <span className="iv-workflow-check">
                        <Check size={15} />
                    </span>
                    <span className="iv-workflow-line" aria-hidden="true" />
                </div>
            ))}
            <div className="iv-workflow-foot">
                <span>1:1 guidance</span>
                <ArrowRight size={15} />
                <span>Your pace</span>
                <ArrowRight size={15} />
                <span>Your next step</span>
            </div>
        </div>
    );
}
