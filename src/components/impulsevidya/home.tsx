"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Compass,
  GraduationCap,
  HeartHandshake,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { ButtonLink, ClosingCTA, Reveal, SectionHeading } from "./shell";
import { siteImages } from "./assets";
import { Dashboard, Icon, ModuleOrbit, type DashboardTab } from "./visuals";

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 45]);
  return (
    <section ref={ref} className="iv-hero" id="top">
      <div className="iv-container">
        <Reveal className="iv-hero-copy">
          <span className="iv-hero-badge"><Sparkles size={14} /> Guidance that starts with you</span>
          <h1>Your next step.<br /><mark>A clearer way forward.</mark></h1>
          <p>Practical academic and career guidance for students finding their direction, building skills, and working toward what comes next.</p>
          <div className="iv-button-row">
            <ButtonLink href="#process" arrow>Explore your path</ButtonLink>
            <ButtonLink href="#services" secondary>See how we guide <ArrowRight size={16} /></ButtonLink>
          </div>
          <div className="iv-hero-proof" aria-label="ImpulseVidya guidance areas">
            <span><Icon name="exams" size={18} /> Academic direction</span>
            <span><Icon name="assignments" size={18} /> Skill building</span>
            <span><Icon name="insights" size={18} /> Career planning</span>
          </div>
          <span className="iv-hero-note"><span /> Personal guidance. Progress at your pace.</span>
        </Reveal>
        <motion.div className="iv-hero-dashboard" style={{ y }} initial={{ opacity: 0, translateY: reduced ? 0 : 55 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>
          <div className="iv-dashboard-frame"><Dashboard /></div>
          <div className="iv-hero-floating-note" aria-hidden="true"><span><Check size={15} /></span><div><strong>One clear next step.</strong><small>Keep your goals and options in view.</small></div></div>
        </motion.div>
      </div>
    </section>
  );
}

function LearningStrip() {
  const paths: ["campus" | "courses" | "assignments" | "users", string][] = [
    ["campus", "School students"],
    ["courses", "College students"],
    ["assignments", "Exam aspirants"],
    ["users", "Early-career learners"],
  ];
  return (
    <section className="iv-campus-strip iv-container">
      <p>GUIDANCE FOR THE JOURNEY AHEAD</p>
      <div>{paths.map(([icon, label]) => <span key={label}><Icon name={icon} size={27} />{label}</span>)}</div>
    </section>
  );
}

function MentorIntro() {
  return (
    <section className="iv-section iv-people iv-mentor-intro" id="about">
      <div className="iv-container">
        <SectionHeading eyebrow="Meet your mentor" title="Guidance with a student’s perspective." description="A little about the person behind ImpulseVidya and the experience that informs the guidance." />
        <div className="iv-role-panel iv-mentor-panel">
          <div className="iv-role-copy">
            <span className="iv-quote-mark">“</span>
            <h3>Meet Sarvesh</h3>
            <p>I’m Sarvesh, Chief Mentor at ImpulseVidya. My path includes two years of study at Resonance in Kota and Computer Science at IIIT Nagpur (2022–26). I bring that student perspective to conversations about academic choices, exam preparation, skills, and careers.</p>
            <div className="iv-mentor-facts">
              <div><span>Computer Science</span><strong>IIIT Nagpur · 2022–26</strong></div>
              <div><span>Entrance exam preparation</span><strong>Resonance · Kota · 2 years</strong></div>
            </div>
            <a className="iv-text-link" href="#process">See how guidance works <ArrowUpRight size={17} /></a>
          </div>
          <div className="iv-role-photo">
            <Image className="iv-mentor-profile-image" src={siteImages.mentorPortrait} alt="Portrait of Sarvesh, Chief Mentor at ImpulseVidya" fill sizes="(max-width: 800px) 100vw, 48vw" />
            <div className="iv-role-photo-label"><span><HeartHandshake size={21} /></span><div><strong>Learning with direction.</strong><small>Growing with guidance.</small></div><Check size={18} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Word({ children, progress, start, end }: { children: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.54, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

function Problem() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "end 55%"] });
  const revealProgress = useSpring(scrollYProgress, { stiffness: 140, damping: 32, restDelta: 0.001 });
  const reduced = useReducedMotion();
  const words = "Every student has questions. The hard part is knowing which options fit, what to focus on, and how to turn a big goal into a doable next step.".split(" ");
  const pains = [
    "Too many options. No clear place to start.",
    "Advice that doesn’t fit your situation.",
    "Big goals without a practical next step.",
    "Study plans that are hard to sustain.",
  ];
  return (
    <section className="iv-problem iv-section">
      <div className="iv-container">
        <SectionHeading eyebrow="The challenge" title="Ambition is a start." highlight="Direction makes it actionable." />
        <div ref={ref} className="iv-scroll-statement"><p>{words.map((word, index) => reduced ? <span key={index}>{word} </span> : <Word key={index} progress={revealProgress} start={(index / words.length) * 0.75} end={((index + 1) / words.length) * 0.75}>{word}</Word>)}</p></div>
        <Reveal className="iv-down-arrow"><ArrowDown size={39} strokeWidth={2.5} /></Reveal>
        <Reveal className="iv-problem-bottom"><p>You don’t have to figure it all out at once.<br /><strong>Start with the next useful question.</strong></p></Reveal>
      </div>
      <div className="iv-pain-marquee"><motion.div animate={reduced ? {} : { x: ["0%", "-50%"] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}>
        {[...pains, ...pains].map((pain, index) => <span className="iv-pain-pill" key={index} aria-hidden={index >= pains.length}><X size={20} />{pain}<Icon name={["files", "settings", "clock", "insights"][index % 4] as "files" | "settings" | "clock" | "insights"} size={29} /></span>)}
      </motion.div></div>
    </section>
  );
}

function ConnectedGuidance() {
  return (
    <section className="iv-section iv-platform-section" id="process">
      <div className="iv-container">
        <SectionHeading eyebrow="A thoughtful process" title="Start where you are." description="Build a direction you understand, with support as your goals take shape." />
        <div className="iv-split iv-split-first">
          <Reveal className="iv-visual-panel iv-plan-image-panel" delay={0.08}>
            <Image src={siteImages.studyPlanning} alt="Study-planning illustration with a checklist, review notes, and a progress mark" fill sizes="(max-width: 800px) 100vw, 48vw" />
            <div className="iv-plan-visual-note"><span><Check size={16} /></span><div><strong>Plan, shaped around you</strong><small>Priorities first. Small steps next.</small></div></div>
          </Reveal>
          <Reveal className="iv-split-copy" delay={0.12}>
            <span className="iv-feature-icon"><Compass size={25} /></span>
            <h3>Big goals, broken down.<br /><span>Small steps you can start.</span></h3>
            <p>Talk through what you want to achieve, what feels uncertain, and the options you’re considering. Together, shape those questions into a practical plan.</p>
            <ul className="iv-check-list"><li><Check /> Start from your current situation and goals</li><li><Check /> Compare options and decide what matters now</li><li><Check /> Review progress and adjust as you learn</li></ul>
            <a href="#services" className="iv-text-link">See the guidance available <ArrowUpRight size={17} /></a>
          </Reveal>
        </div>
        <div className="iv-split iv-split-reverse">
          <Reveal className="iv-split-copy">
            <span className="iv-feature-icon"><HeartHandshake size={25} /></span>
            <h3>Useful advice.<br /><span>Support that stays personal.</span></h3>
            <p>Your interests, strengths, and circumstances matter. Guidance should help you make informed choices—not pressure you into someone else’s idea of success.</p>
            <p className="iv-muted-small">Every student’s path looks different. Your plan can change as you learn more about yourself and your options.</p>
            <a href="#about" className="iv-text-link">Get to know the mentor <ArrowUpRight size={17} /></a>
          </Reveal>
          <Reveal className="iv-visual-panel iv-mentor-image-panel" delay={0.12}>
            <Image src={siteImages.mentorConversation} alt="A mentor talking through study choices with a small group of students" fill sizes="(max-width: 800px) 100vw, 48vw" />
            <div className="iv-insight-note"><span><Sparkles size={18} /></span><div><strong>Progress over pressure.</strong><small>Thoughtful support, one step at a time.</small></div></div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const guidanceAreas = [
  { title: "Academic direction", short: "Compare study paths and choose goals that fit.", icon: "campus" as const, preview: "pathways", href: "#exams" },
  { title: "Entrance exam planning", short: "Organize preparation around your exam and timeline.", icon: "exams" as const, preview: "exams", href: "#exams" },
  { title: "Skills & projects", short: "Build useful skills through focused practice.", icon: "assignments" as const, preview: "skills", href: "#skills" },
  { title: "Career exploration", short: "Learn about roles before deciding where to focus.", icon: "insights" as const, preview: "career", href: "#career" },
  { title: "Interview preparation", short: "Practise explaining your thinking with confidence.", icon: "feedback" as const, preview: "interview", href: "#career" },
  { title: "Regular check-ins", short: "Reflect on progress and adjust your next steps.", icon: "calendar" as const, preview: "checkins", href: "#process" },
];

function Ecosystem() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const categories = [
    { title: "Academic choices", description: "Sort through programs, subjects, and possible routes with a clearer view of what matters to you.", icon: "campus" as const, href: "#exams", tab: "My plan" as DashboardTab },
    { title: "Exam preparation", description: "Make preparation more manageable with priorities, revision, and practice that fit your schedule.", icon: "exams" as const, href: "#exams", tab: "Exams" as DashboardTab },
    { title: "Skills and careers", description: "Explore roles and build relevant skills through small projects and consistent practice.", icon: "insights" as const, href: "#career", tab: "Career" as DashboardTab },
  ];
  return (
    <section className="iv-section iv-ecosystem" id="exams">
      <div className="iv-container">
        <SectionHeading eyebrow="Your guidance ecosystem" title="Bring your questions." highlight="Build your direction." description="Connect academic choices, exam goals, skill-building, and career exploration in one thoughtful journey." />
        <div className="iv-ecosystem-grid">
          <Reveal className="iv-ecosystem-visual"><div className="iv-ecosystem-orbit"><ModuleOrbit /></div><AnimatePresence mode="wait"><motion.div className="iv-ecosystem-caption" key={active} initial={{ opacity: 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}><span><Icon name={categories[active].icon} size={22} /></span><div><strong>{categories[active].title}</strong><p>One plan. Room to grow.</p></div><Check size={18} /></motion.div></AnimatePresence></Reveal>
          <div className="iv-ecosystem-options">{categories.map((category, index) => <Reveal key={category.title} delay={index * 0.07}><article className={active === index ? "is-active" : ""} onMouseEnter={() => setActive(index)}><button type="button" aria-pressed={active === index} onClick={() => setActive(index)}><span className="iv-ecosystem-number">0{index + 1}</span><span><h3>{category.title}</h3><p>{category.description}</p></span></button><a aria-label={`Explore ${category.title}`} href={category.href}><ArrowUpRight size={24} /></a></article></Reveal>)}</div>
        </div>
        <a href="#services" className="iv-all-modules">Explore guidance areas <ArrowRight size={17} /></a>
      </div>
    </section>
  );
}

function GuidanceCatalog() {
  return (
    <section className="iv-section iv-modules-section" id="services">
      <div className="iv-container">
        <SectionHeading eyebrow="Ways we can work together" title="Guidance for the step you’re on." highlight="Support as you move forward." description="Start with one question or build a longer-term plan. The support can adapt as your goals become clearer." />
        <div className="iv-product-grid">
          {guidanceAreas.map((area, index) => <Reveal key={area.title} delay={(index % 3) * 0.05}><a href={area.href} className="iv-product-card"><span className="iv-feature-icon"><Icon name={area.icon} size={27} /></span><ArrowUpRight className="iv-product-arrow" size={20} /><div className={`iv-module-preview preview-${area.preview}`} aria-hidden="true"><div className="iv-preview-topline"><i /><i /><i /><span /></div><div className="iv-guide-visual"><span /><span /><span /><i /><i /></div></div><h3>{area.title}</h3><p>{area.short}</p><small className="iv-guidance-card-note"><Check size={12} /> Shaped around your goals</small></a></Reveal>)}
        </div>
        <p className="iv-module-availability">The right starting point depends on your goals, current stage, and the questions you want to work through.</p>
      </div>
    </section>
  );
}

function People() {
  const [selected, setSelected] = useState(0);
  const roles = [
    { label: "School students", icon: "courses" as const, title: "Make your choices with more confidence.", text: "Explore subjects, entrance exams, and possible study paths. Understand your options before deciding what to focus on.", href: "#exams" },
    { label: "College students", icon: "users" as const, title: "Connect what you learn to what comes next.", text: "Build skills through practice, work on projects, and get help exploring internships or early career options.", href: "#skills" },
    { label: "Exam aspirants", icon: "exams" as const, title: "Prepare with a plan you can sustain.", text: "Set priorities, keep a realistic rhythm, and revisit your approach as you learn what works for you.", href: "#exams" },
    { label: "Early-career learners", icon: "chart" as const, title: "Take a thoughtful next step.", text: "Map your current strengths to the roles you’re considering and identify the skills or experiences to build next.", href: "#career" },
  ];
  return (
    <section className="iv-section iv-people" id="career">
      <div className="iv-container">
        <SectionHeading eyebrow="For every stage" title="Different journeys." highlight="Guidance that meets you there." description="Your questions change over time. The support should make sense for where you are now." />
        <div className="iv-role-tabs" role="tablist" aria-label="Explore guidance by student stage">{roles.map((role, index) => <button key={role.label} type="button" role="tab" id={`role-tab-${index}`} aria-selected={selected === index} aria-controls="role-panel" onClick={() => setSelected(index)}>{selected === index && <motion.span className="iv-role-tab-bg" layoutId="role-highlight" transition={{ type: "spring", stiffness: 350, damping: 30 }} />}<Icon name={role.icon} size={17} /><span>{role.label}</span></button>)}</div>
        <AnimatePresence mode="wait" initial={false}><motion.div className="iv-role-panel" id="role-panel" role="tabpanel" aria-labelledby={`role-tab-${selected}`} key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}><div className="iv-role-copy"><span className="iv-quote-mark">“</span><h3>{roles[selected].title}</h3><p>{roles[selected].text}</p><a className="iv-text-link" href={roles[selected].href}>Explore this path <ArrowUpRight size={17} /></a></div><div className="iv-role-photo"><Image src={siteImages.mentorConversation} alt="A mentor discussing learning goals with students" fill sizes="(max-width: 800px) 100vw, 48vw" /><div className="iv-role-photo-label"><span><Icon name={roles[selected].icon} size={21} /></span><div><strong>Guidance built around the learner.</strong><small>Thoughtful conversations. Practical steps.</small></div><Check size={18} /></div></div></motion.div></AnimatePresence>
      </div>
    </section>
  );
}

function Principles() {
  const points: ["users" | "clock" | "chart" | "settings" | "heart" | "sparkles", string, string][] = [
    ["users", "Personal, not prescriptive", "Your interests, experiences, and priorities belong at the centre of your choices."],
    ["clock", "Small steps over pressure", "A practical pace can be easier to sustain than an oversized plan."],
    ["chart", "Progress you can see", "Make room to reflect on what is working and what you want to change."],
    ["settings", "Advice with context", "Discuss the options alongside your current situation and goals."],
    ["heart", "You stay in control", "Guidance helps you weigh choices; your decisions remain your own."],
    ["sparkles", "Room for the path to change", "Your plan can grow with you as you learn more about what fits."],
  ];
  return (
    <section className="iv-section iv-principles iv-container" id="skills">
      <SectionHeading eyebrow="The way we guide" title="Thoughtful by design." highlight="Practical by nature." />
      <div className="iv-principles-grid">{points.map(([icon, title, text], index) => <Reveal className="iv-principle" key={title} delay={index * 0.05}><span className="iv-feature-icon"><Icon name={icon} size={27} /></span><h3>{title}</h3><p>{text}</p></Reveal>)}</div>
      <Reveal className="iv-trust-row">{[["shield", "Honest conversations"], ["files", "Clear next steps"], ["heart", "Learner-led choices"], ["settings", "Plans that can adapt"]].map(([icon, text]) => <span key={text}><Icon name={icon as "shield" | "files" | "heart" | "settings"} size={25} /><strong>{text}</strong></span>)}</Reveal>
    </section>
  );
}

function Outcomes() {
  const outcomes = [
    { number: "01", label: "Clarity", text: "Understand what you want to explore and why it matters to you.", icon: "campus" as const },
    { number: "02", label: "A practical plan", text: "Choose a few steps that fit your schedule and current priorities.", icon: "chart" as const },
    { number: "03", label: "Useful practice", text: "Build knowledge and skills through work you can learn from.", icon: "assignments" as const },
    { number: "04", label: "Room to reflect", text: "Review what changed and decide what would help next.", icon: "heart" as const },
  ];
  return (
    <section className="iv-section iv-outcomes">
      <div className="iv-container"><SectionHeading eyebrow="What progress can look like" title="A clearer direction." description="Progress is not a single result. It can be a better question, a new skill, or a next step that feels possible." />
        <div className="iv-outcome-grid"><Reveal className="iv-outcome-main"><GraduationCap size={40} /><h3>Build a path<br />that feels like yours.</h3><p>Move from uncertainty to informed choices, with practical support along the way.</p><a href="#contact" className="iv-outcome-link">Take the first step <ArrowUpRight size={20} /></a></Reveal>
          <div className="iv-outcome-cards">{outcomes.map((item, index) => <Reveal key={item.label} className="iv-outcome-card" delay={index * 0.04}><Icon name={item.icon} size={25} /><strong>{item.number}</strong><h3>{item.label}</h3><p>{item.text}</p></Reveal>)}</div>
        </div>
      </div>
    </section>
  );
}

const articles = [
  { category: "Choosing a direction", title: "How to make a big decision feel smaller", icon: "insights" as const, image: siteImages.careerDirection },
  { category: "Exam preparation", title: "Build a study plan you can keep returning to", icon: "exams" as const, image: siteImages.examPreparation },
  { category: "Skill building", title: "Turn what you learn into a useful project", icon: "assignments" as const, image: siteImages.skillBuilding },
];

function ResourceCards() {
  return <div className="iv-resource-grid">{articles.map((article, index) => <Reveal key={article.title} delay={index * 0.06}><a href={article.icon === "exams" ? "#exams" : article.icon === "assignments" ? "#skills" : "#career"} className="iv-resource-card"><div className="iv-resource-image"><Image className="iv-resource-source-art" src={article.image} alt="" fill sizes="(max-width: 680px) 100vw, 33vw" /><span><ArrowUpRight size={20} /></span></div><span className="iv-resource-category">{article.category}</span><h3>{article.title}</h3><span className="iv-resource-meta">ImpulseVidya guidance <span>Read more</span></span></a></Reveal>)}</div>;
}

export function FAQSection({
  title = "A little more clarity.",
  eyebrow = "Frequently asked questions",
}: {
  title?: string;
  eyebrow?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  const items = [
    { q: "What kind of guidance does ImpulseVidya offer?", a: "ImpulseVidya focuses on academic and career direction, entrance exam planning, skill development, interview preparation, and regular mentoring check-ins." },
    { q: "Who can seek guidance?", a: "Students at different stages can start with the question or goal they are working through. A first conversation helps clarify what kind of support may fit." },
    { q: "Can I get help choosing an entrance exam or study path?", a: "Yes. Guidance can help you compare options, understand the preparation involved, and decide what to explore next based on your interests and current situation." },
    { q: "What if I am unsure about my career direction?", a: "That is a useful place to begin. You can explore interests, strengths, roles, and skills without needing to have the whole path decided in advance." },
    { q: "Is the plan fixed once we start?", a: "No. The plan can change as you learn more, encounter new priorities, or decide that a different direction fits better." },
    { q: "Are session formats and pricing listed here?", a: "Not yet. This page focuses on the guidance areas and approach; session formats and pricing have not been published here." },
  ];
  return (
    <section className="iv-faq iv-container" id="faq">
      <SectionHeading eyebrow={eyebrow} title={title} />
      <div className="iv-faq-list">{items.map((item, index) => <Reveal key={item.q} delay={index * 0.03}><article className={`iv-faq-item ${open === index ? "is-open" : ""}`}><h3><button id={`${id}-question-${index}`} aria-expanded={open === index} aria-controls={`${id}-answer-${index}`} onClick={() => setOpen(open === index ? null : index)}>{item.q}<span><Plus size={19} /></span></button></h3><AnimatePresence initial={false}>{open === index && <motion.div id={`${id}-answer-${index}`} role="region" aria-labelledby={`${id}-question-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}><p>{item.a}</p></motion.div>}</AnimatePresence></article></Reveal>)}</div>
    </section>
  );
}

export function HomePage() {
  return (
    <main className="iv-home" id="main">
      <Hero />
      <LearningStrip />
      <MentorIntro />
      <Problem />
      <ConnectedGuidance />
      <Ecosystem />
      <GuidanceCatalog />
      <People />
      <Principles />
      <Outcomes />
      <section className="iv-section iv-resources iv-container">
        <div className="iv-heading-row"><SectionHeading eyebrow="Ideas for the journey" title="A little perspective can help." align="left" /><a href="#faq" className="iv-text-link">Read the FAQs <ArrowUpRight size={17} /></a></div>
        <ResourceCards />
      </section>
      <FAQSection />
      <ClosingCTA />
    </main>
  );
}
