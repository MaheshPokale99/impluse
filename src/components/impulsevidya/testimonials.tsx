"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, GraduationCap, Quote, Star } from "lucide-react";
import type { PublicTestimonial } from "@/lib/testimonials/queries";
import { Reveal, SectionHeading } from "./shell";

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

const pad = (value: number) => String(value).padStart(2, "0");

function Stars({ rating }: { rating: number }) {
    return (
        <span className="iv-testimonial-stars" role="img" aria-label={`Rated ${rating} out of 5`}>
            {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={17} className={index < rating ? "is-filled" : ""} />
            ))}
        </span>
    );
}

export function Testimonials({ testimonials }: { testimonials: PublicTestimonial[] }) {
    const [active, setActive] = useState(0);
    const [direction, setDirection] = useState(1);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount: 0.35 });
    const reduced = useReducedMotion();

    if (testimonials.length === 0) return null;

    const count = testimonials.length;
    const multiple = count > 1;
    const current = testimonials[Math.min(active, count - 1)];
    const paused = hovered || focused || !inView || Boolean(reduced);

    const go = (index: number, step = index > active ? 1 : -1) => {
        setDirection(step);
        setActive((index + count) % count);
    };
    const next = () => go(active + 1, 1);
    const previous = () => go(active - 1, -1);

    return (
        <section className="iv-section iv-testimonials" id="testimonials">
            <div className="iv-container">
                <SectionHeading
                    eyebrow="Student stories"
                    title="Heard from the learners."
                    highlight="In their own words."
                    description="What students and parents say about working through their questions with ImpulseVidya."
                />
                <Reveal className={`iv-testimonial-stage ${multiple ? "" : "is-single"}`}>
                    <div
                        ref={ref}
                        className={`iv-testimonial-spotlight ${paused ? "is-paused" : ""}`}
                        role="region"
                        aria-roledescription="carousel"
                        aria-label="Student testimonials"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        onFocus={() => setFocused(true)}
                        onBlur={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget)) {
                                setFocused(false);
                            }
                        }}
                        onKeyDown={(event) => {
                            if (!multiple) return;
                            if (event.key === "ArrowRight") next();
                            if (event.key === "ArrowLeft") previous();
                        }}
                    >
                        <span className="iv-testimonial-glyph" aria-hidden="true">
                            <Quote size={20} />
                        </span>
                        <div
                            className="iv-testimonial-viewport"
                            aria-live={paused ? "polite" : "off"}
                        >
                            <AnimatePresence mode="wait" initial={false} custom={direction}>
                                <motion.figure
                                    key={current.id}
                                    className="iv-testimonial-figure"
                                    role="group"
                                    aria-roledescription="slide"
                                    aria-label={`${active + 1} of ${count}`}
                                    custom={direction}
                                    variants={{
                                        enter: (step: number) => ({
                                            opacity: 0,
                                            x: reduced ? 0 : step * 28,
                                        }),
                                        center: { opacity: 1, x: 0 },
                                        exit: (step: number) => ({
                                            opacity: 0,
                                            x: reduced ? 0 : step * -28,
                                        }),
                                    }}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                                    drag={multiple && !reduced ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.16}
                                    onDragEnd={(_, info) => {
                                        if (info.offset.x < -60) next();
                                        if (info.offset.x > 60) previous();
                                    }}
                                >
                                    <Stars rating={current.rating} />
                                    <blockquote>
                                        <p>{current.quote}</p>
                                    </blockquote>
                                    <figcaption>
                                        <span className="iv-testimonial-avatar" aria-hidden="true">
                                            {initials(current.name)}
                                        </span>
                                        <span className="iv-testimonial-author">
                                            <strong>{current.name}</strong>
                                            {current.role && <small>{current.role}</small>}
                                        </span>
                                        {current.highlight && (
                                            <span className="iv-testimonial-highlight">
                                                <GraduationCap size={15} />
                                                {current.highlight}
                                            </span>
                                        )}
                                    </figcaption>
                                </motion.figure>
                            </AnimatePresence>
                        </div>
                        {multiple && (
                            <div className="iv-testimonial-controls">
                                <span className="iv-testimonial-count" aria-hidden="true">
                                    <b>{pad(active + 1)}</b> / {pad(count)}
                                </span>
                                <div className="iv-testimonial-progress">
                                    {testimonials.map((item, index) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            aria-label={`Show testimonial from ${item.name}`}
                                            aria-current={index === active ? "true" : undefined}
                                            className={index === active ? "is-active" : ""}
                                            onClick={() => go(index)}
                                        >
                                            <span>
                                                {index === active && (
                                                    <i key={active} onAnimationEnd={next} />
                                                )}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className="iv-testimonial-arrows">
                                    <button
                                        type="button"
                                        aria-label="Previous testimonial"
                                        onClick={previous}
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Next testimonial"
                                        onClick={next}
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {multiple && (
                        <div className="iv-testimonial-rail">
                            <ul data-lenis-prevent>
                                {testimonials.map((item, index) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            className={index === active ? "is-active" : ""}
                                            aria-pressed={index === active}
                                            onClick={() => go(index)}
                                        >
                                            <span
                                                className="iv-testimonial-avatar"
                                                aria-hidden="true"
                                            >
                                                {initials(item.name)}
                                            </span>
                                            <span className="iv-testimonial-rail-copy">
                                                <strong>{item.name}</strong>
                                                {item.role && <small>{item.role}</small>}
                                                <span>{item.quote}</span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Reveal>
            </div>
        </section>
    );
}
