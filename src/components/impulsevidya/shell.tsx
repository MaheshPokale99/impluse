"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUpRight, BookOpen, Menu, X } from "lucide-react";
import { gentleEase, SmoothScroll } from "./motion";
import { ThemeToggle } from "./theme-toggle";
import { Brand } from "./visuals";

export function Reveal({
    children,
    className = "",
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const reduced = useReducedMotion();
    return (
        <motion.div
            className={className}
            initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 22, scale: reduced ? 1 : 0.985 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={
                reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 270, damping: 28, mass: 0.8, delay }
            }
        >
            {children}
        </motion.div>
    );
}

function CursorClickFeedback() {
    const reduced = useReducedMotion();
    const [click, setClick] = useState<{ x: number; y: number; id: number } | null>(null);
    const sequence = useRef(0);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (reduced) return;
        const handlePointerDown = (event: PointerEvent) => {
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            const target = event.target;
            if (
                target instanceof Element &&
                target.closest("input, textarea, select, [contenteditable='true']")
            )
                return;
            setClick({ x: event.clientX, y: event.clientY, id: ++sequence.current });
            if (timeout.current) clearTimeout(timeout.current);
            timeout.current = setTimeout(() => setClick(null), 220);
        };
        document.addEventListener("pointerdown", handlePointerDown, { passive: true });
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            if (timeout.current) clearTimeout(timeout.current);
        };
    }, [reduced]);

    return (
        <AnimatePresence>
            {click && (
                <motion.span
                    key={click.id}
                    className="iv-cursor-click"
                    aria-hidden="true"
                    initial={{ opacity: 0.7, scale: 0.45 }}
                    animate={{ opacity: 0.35, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.65 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    style={{ left: click.x, top: click.y }}
                />
            )}
        </AnimatePresence>
    );
}

export function SectionHeading({
    eyebrow,
    title,
    highlight,
    description,
    align = "center",
}: {
    eyebrow?: string;
    title: string;
    highlight?: string;
    description?: string;
    align?: "left" | "center";
}) {
    return (
        <Reveal className={`iv-section-heading align-${align}`}>
            {eyebrow && (
                <span className="iv-eyebrow">
                    <span />
                    {eyebrow}
                </span>
            )}
            <h2>
                {title}
                {highlight && (
                    <>
                        <br />
                        <span>{highlight}</span>
                    </>
                )}
            </h2>
            {description && <p>{description}</p>}
        </Reveal>
    );
}

export function ButtonLink({
    children,
    href = "#contact",
    secondary = false,
    arrow = false,
    className = "",
}: {
    children: ReactNode;
    href?: string;
    secondary?: boolean;
    arrow?: boolean;
    className?: string;
}) {
    return (
        <Link
            className={`iv-button ${secondary ? "iv-button-light" : "iv-button-dark"} ${className}`}
            href={href}
        >
            {children}
            {arrow && <ArrowUpRight size={17} />}
        </Link>
    );
}

const navLinks = [
    ["About", "#about"],
    ["How it works", "#process"],
    ["Guidance", "#services"],
    ["FAQ", "#faq"],
] as const;

function Header() {
    const [mobile, setMobile] = useState(false);
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        const close = (event: PointerEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setMobile(false);
        };
        const key = (event: KeyboardEvent) => {
            if (event.key === "Escape") setMobile(false);
        };
        document.addEventListener("pointerdown", close);
        document.addEventListener("keydown", key);
        return () => {
            document.removeEventListener("pointerdown", close);
            document.removeEventListener("keydown", key);
        };
    }, []);
    useEffect(() => {
        if (!mobile) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobile]);

    const close = () => setMobile(false);
    return (
        <header ref={ref} className="iv-header">
            <div className="iv-header-inner">
                <Link href="#top" aria-label="ImpulseVidya home" onClick={close}>
                    <Brand />
                </Link>
                <nav className="iv-desktop-nav" aria-label="Main navigation">
                    {navLinks.map(([label, href]) => (
                        <Link key={label} href={href}>
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className="iv-header-actions">
                    <ThemeToggle />
                    <ButtonLink href="/login" arrow>
                        Log in
                    </ButtonLink>
                    <button
                        type="button"
                        className="iv-mobile-toggle"
                        onClick={() => setMobile(!mobile)}
                        aria-expanded={mobile}
                        aria-controls="mobile-menu"
                        aria-label={mobile ? "Close navigation" : "Open navigation"}
                    >
                        {mobile ? <X /> : <Menu />}
                    </button>
                </div>
                <AnimatePresence>
                    {mobile && (
                        <motion.nav
                            id="mobile-menu"
                            className="iv-mobile-menu"
                            aria-label="Mobile navigation"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                        >
                            {navLinks.map(([label, href]) => (
                                <Link key={label} href={href} onClick={close}>
                                    {label}
                                    <ArrowRight size={17} />
                                </Link>
                            ))}
                            <Link href="/login" onClick={close}>
                                Log in
                                <ArrowUpRight size={17} />
                            </Link>
                            <p>
                                Learning with direction.
                                <br />
                                Growing with guidance.
                            </p>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}

export function ClosingCTA() {
    const reduced = useReducedMotion();
    return (
        <section className="iv-cta iv-container" id="contact">
            <Reveal className="iv-cta-inner">
                <motion.span
                    className="iv-cta-float float-left"
                    animate={reduced ? {} : { y: [0, -10, 0], rotate: [-12, -6, -12] }}
                    transition={{ duration: 6, repeat: Infinity }}
                >
                    <BookOpen size={32} />
                </motion.span>
                <motion.span
                    className="iv-cta-float float-right"
                    animate={reduced ? {} : { y: [0, 10, 0], rotate: [10, 4, 10] }}
                    transition={{ duration: 5, repeat: Infinity }}
                >
                    <ArrowRight size={32} />
                </motion.span>
                <span className="iv-cta-brand">
                    <Brand small />
                </span>
                <h2>
                    Your next chapter.
                    <br />
                    <mark>A clearer way forward.</mark>
                </h2>
                <p>
                    Bring the questions you have today.
                    <br className="iv-desktop-break" /> Leave with a next step you can act on.
                </p>
                <ButtonLink href="#about" arrow>
                    Meet your mentor
                </ButtonLink>
                <span className="iv-cta-note">
                    Start with your goals. We’ll work through the rest together.
                </span>
            </Reveal>
        </section>
    );
}

function Footer() {
    const links = [
        {
            title: "Explore",
            items: [
                ["About", "#about"],
                ["How it works", "#process"],
                ["Guidance", "#services"],
            ],
        },
        {
            title: "Student paths",
            items: [
                ["Entrance exams", "#exams"],
                ["Skills", "#skills"],
                ["Career planning", "#career"],
            ],
        },
        {
            title: "Support",
            items: [
                ["Common questions", "#faq"],
                ["About your mentor", "#about"],
                ["Back to top", "#top"],
            ],
        },
    ];
    return (
        <footer className="iv-footer">
            <div className="iv-container">
                <div className="iv-footer-top">
                    <Link href="#top" aria-label="ImpulseVidya home">
                        <Brand />
                    </Link>
                    <p>
                        Learning with direction.
                        <br />
                        Growing with guidance.
                    </p>
                    <Link href="#services" className="iv-footer-talk">
                        Your next step starts here <ArrowUpRight size={21} />
                    </Link>
                </div>
                <div className="iv-footer-columns">
                    {links.map((column) => (
                        <div key={column.title}>
                            <h3>{column.title}</h3>
                            {column.items.map(([label, href]) => (
                                <Link key={label} href={href}>
                                    {label}
                                </Link>
                            ))}
                        </div>
                    ))}
                    <div>
                        <h3>Our approach</h3>
                        <span className="iv-footer-plain">Student-first guidance</span>
                        <span className="iv-footer-plain">Practical next steps</span>
                        <span className="iv-footer-plain">Progress at your pace</span>
                    </div>
                </div>
                <div className="iv-footer-wordmark" aria-hidden="true">
                    impulsevidya<span>.</span>
                </div>
                <div className="iv-footer-bottom">
                    <span>© {new Date().getFullYear()} ImpulseVidya</span>
                    <span>Guidance for the journey ahead.</span>
                    <button onClick={() => window.dispatchEvent(new Event("impulsevidya:top"))}>
                        Back to top <ArrowUpRight size={15} />
                    </button>
                </div>
            </div>
        </footer>
    );
}

export function SiteShell({ children }: { children: ReactNode }) {
    return (
        <MotionConfig reducedMotion="user" transition={{ duration: 0.55, ease: gentleEase }}>
            <SmoothScroll />
            <CursorClickFeedback />
            <a className="iv-skip-link" href="#main-content">
                Skip to content
            </a>
            <Header />
            <div id="main-content" tabIndex={-1}>
                {children}
            </div>
            <Footer />
        </MotionConfig>
    );
}
