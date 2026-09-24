"use client";
import { useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

const cards = [
    {
        image: "https://framerusercontent.com/images/bed888CTflXNK3KFX1R7VhRMtE.png?scale-down-to=1024&width=933&height=1200",
        alt: "Monochrome product still life",
    },
    {
        image: "https://framerusercontent.com/images/JGI1jOpxUUfW0IRfPmx7eMGhc.png?scale-down-to=1024&width=686&height=1200",
        alt: "Framer portfolio case study",
    },
    {
        image: "https://framerusercontent.com/images/fsFDlU7CKq0E96MXMN9fUXrNw.png?scale-down-to=512&width=1200&height=801",
        alt: "Product image from the Framer portfolio",
    },
    {
        image: "https://framerusercontent.com/images/jlIAaI4caPj3oVLaxetMd2RvY.png?scale-down-to=1024&width=800&height=1200",
        alt: "Portfolio product composition",
    },
    {
        image: "https://framerusercontent.com/images/RYRvZnstUexQMOl8zRyrvDfDT0.png?scale-down-to=1024&width=800&height=1200",
        alt: "Portfolio project image",
    },
];

export function PortfolioCarousel() {
    const track = useRef<HTMLDivElement>(null);
    const move = (direction: -1 | 1) =>
        track.current?.scrollBy({
            left: direction * (track.current.clientWidth * 0.78),
            behavior: "smooth",
        });
    return (
        <div className="carousel-wrap">
            <div className="carousel" ref={track} aria-label="Recent work examples">
                {cards.map(({ image, alt }, i) => (
                    <a
                        className="carousel-card"
                        href="#contact"
                        key={image}
                        aria-label={`Open case study ${i + 1}`}
                    >
                        <Image
                            src={image}
                            alt={alt}
                            fill
                            sizes="(max-width: 700px) 82vw, 22vw"
                            unoptimized
                        />
                        <span className="case-study">
                            View Casestudy <ArrowUpRight size={16} />
                        </span>
                    </a>
                ))}
            </div>
            <div className="carousel-controls">
                <span>Recent works</span>
                <div>
                    <button type="button" onClick={() => move(-1)} aria-label="Previous projects">
                        <ArrowLeft size={18} />
                    </button>
                    <button type="button" onClick={() => move(1)} aria-label="Next projects">
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
