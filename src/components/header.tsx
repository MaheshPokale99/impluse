"use client";
import { useState } from "react";
import { ArrowUpRight, LayoutGrid, Menu, X } from "lucide-react";
export function Header() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <a className="skip-link" href="#main">
                Skip to content
            </a>
            <header className="site-header" id="top">
                <div className="header-inner page-width">
                    <a className="brand" href="#top" aria-label="ImpulseVidya home">
                        <span className="brand-mark">
                            <LayoutGrid size={17} />
                        </span>
                        <span>
                            Impulse<span className="brand-accent">Vidya</span>
                            <b>.</b>
                        </span>
                    </a>
                    <nav
                        aria-label="Main navigation"
                        id="main-nav"
                        className={open ? "navigation open" : "navigation"}
                        onClick={() => setOpen(false)}
                    >
                        <a href="#services">Services</a>
                        <a href="#projects">Projects</a>
                        <a href="#testimonials">Testimonials</a>
                        <a href="#contact">Contact</a>
                    </nav>
                    <a className="button header-cta" href="#contact">
                        Book a Free Call <ArrowUpRight size={16} />
                    </a>
                    <button
                        className="menu-toggle"
                        aria-expanded={open}
                        aria-controls="main-nav"
                        aria-label={open ? "Close navigation" : "Open navigation"}
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <X /> : <Menu />}
                    </button>
                </div>
            </header>
        </>
    );
}
