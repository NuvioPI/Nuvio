"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValueEvent,
} from "motion/react";

/* ───────────────────── LOGO SVG ───────────────────── */
function NuvioLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 212 166"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M125.6 151.8L72 54.2C72 54.2 72.1333 53 72.4 50.6C72.6667 48.2 72.9333 45.4667 73.2 42.4C73.4667 39.2 73.7333 36.4 74 34C74.2667 31.6 74.4 30.4 74.4 30.4C75.4667 25.4667 75.8 21.8667 75.4 19.6C75.1333 17.2 73.8 15.6 71.4 14.8C69.1333 13.8667 65.4 13.3333 60.2 13.2L61.2 9.2C63.3333 9.33333 65.9333 9.46667 69 9.6C72.2 9.73333 75.5333 9.79999 79 9.79999C85.2667 9.79999 90.6667 9.6 95.2 9.2L140 96.4C140 96.4 139.733 97.7333 139.2 100.4C138.8 103.067 138.2 106.533 137.4 110.8C136.6 114.933 135.8 119.4 135 124.2C134.2 128.867 133.4 133.333 132.6 137.6C131.8 141.733 131.133 145.133 130.6 147.8C130.2 150.467 130 151.8 130 151.8H125.6ZM187.2 3.39999C183.867 3.39999 180.733 4.46666 177.8 6.6C174.867 8.73333 172.333 11.3333 170.2 14.4C164.067 23.4667 157.8 39.4 151.4 62.2C145 85 137.867 114.867 130 151.8L127.2 146.2C129.2 137.267 131.333 127.667 133.6 117.4C135.867 107 138.267 96.6 140.8 86.2C143.467 75.8 146.133 65.8667 148.8 56.4C151.6 46.9333 154.467 38.4667 157.4 31C160.467 23.4 163.533 17.3333 166.6 12.8C169.133 9.2 172.133 6.2 175.6 3.8C179.067 1.26667 183.267 0 188.2 0C195.267 0 200.933 2.06667 205.2 6.19999C209.467 10.3333 211.6 15.4 211.6 21.4C211.6 27.8 209.4 32.9333 205 36.8C200.733 40.5333 195.467 42.4 189.2 42.4C183.867 42.4 179.533 41.1333 176.2 38.6C173 35.9333 171.4 32.2667 171.4 27.6C171.4 21.6 173.4 16.6 177.4 12.6C181.4 8.46666 186.333 5.93333 192.2 5C191.667 4.46666 190.933 4.06666 190 3.8C189.2 3.53333 188.267 3.39999 187.2 3.39999ZM24.4 162.2C28.1333 162.2 31.4 161.133 34.2 159C37 157 39.4667 154.333 41.6 151C45.4667 144.867 49.3333 135.267 53.2 122.2C57.2 109.133 61.2 93.3333 65.2 74.8C69.3333 56.2667 73.4667 35.9333 77.6 13.8L81 18C78.8667 28.9333 76.6 40.0667 74.2 51.4C71.9333 62.6 69.6 73.6 67.2 84.4C64.8 95.0667 62.3333 105 59.8 114.2C57.2667 123.4 54.7333 131.4 52.2 138.2C49.6667 144.867 47.2 149.8 44.8 153C42.4 156.2 39.5333 159.067 36.2 161.6C33 164.267 28.7333 165.6 23.4 165.6C16.3333 165.6 10.6667 163.533 6.4 159.4C2.13333 155.267 0 150.2 0 144.2C0 137.8 2.2 132.733 6.6 129C11 125.133 16.2667 123.2 22.4 123.2C27.8667 123.2 32.2 124.533 35.4 127.2C38.6 129.733 40.2 133.333 40.2 138C40.2 144 38.2 149 34.2 153C30.2 157 25.2667 159.533 19.4 160.6C19.9333 161.133 20.6 161.533 21.4 161.8C22.3333 162.067 23.3333 162.2 24.4 162.2ZM169.144 140.4C169.144 134.133 171.277 129.067 175.544 125.2C179.81 121.2 185.144 119.2 191.544 119.2C196.61 119.2 200.477 120.333 203.144 122.6C205.944 124.867 207.344 128.267 207.344 132.8C207.344 136.4 206.344 139.8 204.344 143C202.344 146.067 199.61 148.6 196.144 150.6C192.81 152.6 189.01 153.6 184.744 153.6C179.677 153.6 175.81 152.467 173.144 150.2C170.477 147.933 169.144 144.667 169.144 140.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ───────────────────── ANIMATED SECTION WRAPPER ───────────────────── */
function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────── STAGGER CHILDREN WRAPPER ───────────────────── */
function StaggerContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      }}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────── COUNTER ANIMATION ───────────────────── */
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

/* ───────────────────── FLOATING PARTICLES ───────────────────── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#2fae5a]"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            opacity: 0.15 + (i % 3) * 0.1,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.7,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────── DATA ───────────────────── */
const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z" />
      </svg>
    ),
    title: "Gestão de Chamados",
    desc: "Organize, priorize e resolva tickets com fluxos inteligentes e automações que eliminam gargalos no atendimento.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    title: "Chat Ao Vivo",
    desc: "Atenda seus clientes em tempo real com nosso chat ao vivo integrado, oferecendo suporte rápido e eficiente.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: "Relatórios & Métricas",
    desc: "Dashboards em tempo real com KPIs de SLA, tempo de resposta e satisfação do cliente para decisões baseadas em dados.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Automações & SLA",
    desc: "Regras automáticas de escalonamento, respostas pré-definidas e alertas de SLA para garantir prazos e qualidade.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />
      </svg>
    ),
    title: "Base de Conhecimento",
    desc: "Portal de autoatendimento com artigos, FAQs e tutoriais que reduzem até 40% do volume de chamados.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Segurança & LGPD",
    desc: "Criptografia em trânsito e em repouso, controle granular de permissões e total conformidade com a LGPD.",
  },
];

const testimonials = [
  {
    name: "Mariana Costa",
    role: "Gerente de TI · TechNova",
    text: "A Nuvio reduziu nosso tempo de resposta em 60%. A visão unificada dos chamados transformou nosso suporte.",
    avatar: "MC",
  },
  {
    name: "Rafael Oliveira",
    role: "Head de CS · StartupFlow",
    text: "Migrar para a Nuvio foi a melhor decisão. O SLA automático e os relatórios em tempo real nos deram controle total.",
    avatar: "RO",
  },
  {
    name: "Juliana Mendes",
    role: "Diretora de Ops · CorpBrasil",
    text: "Interface limpa, integrações poderosas e suporte impecável. A Nuvio entende o que empresas brasileiras precisam.",
    avatar: "JM",
  },
];

const plans = [
  {
    name: "Enterprise",
    price: "Sob consulta",
    desc: "Para operações de grande escala com necessidades específicas.",
    features: [
      "Agentes ilimitados",
      "SSO & SAML",
      "API dedicada",
      "SLA customizado",
      "Gerente de sucesso",
      "Onboarding dedicado",
    ],
    cta: "Falar com vendas",
    featured: true,
  },
];

/* ───────────────────── NAVBAR ───────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "Funcionalidades", href: "#features" },
    { label: "Planos", href: "#pricing" },
    { label: "Depoimentos", href: "#testimonials" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <NuvioLogo className="w-8 h-8 text-[var(--primary)] group-hover:scale-105 transition-transform duration-300" />
          <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            nuvio
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-3 py-1.5"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-5 py-2 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#2fae5a20]"
          >
            Começar agora
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          aria-label="Menu"
        >
          <span
            className={`w-5 h-0.5 bg-[var(--foreground)] transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[4px]" : ""}`}
          />
          <span
            className={`w-5 h-0.5 bg-[var(--foreground)] transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[4px]" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--border)] px-6 pb-6"
        >
          <div className="flex flex-col gap-4 pt-2">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="text-sm font-semibold bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-center"
            >
              Começar agora
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,#2fae5a08_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,#0f6b2e06_0%,transparent_70%)]" />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <FloatingParticles />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-1.5 mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#2fae5a] animate-pulse" />
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              Plataforma de atendimento inteligente
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
          >
            Atendimento que{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              encanta
            </span>
            ,<br />
            resultados que{" "}
            <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              transformam
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            A plataforma de help desk que organiza seus chamados, automatiza
            respostas e dá visibilidade total ao seu suporte — para que sua
            equipe resolva mais, com menos esforço.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-[#2fae5a25] hover:-translate-y-0.5"
            >
              Começar gratuitamente
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:translate-x-0.5 transition-transform"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium px-6 py-3.5 rounded-xl transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Conhecer a plataforma
            </a>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Glow behind */}
            <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,#2fae5a12_0%,transparent_60%)] rounded-3xl blur-2xl" />

            <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl shadow-black/10">
              {/* Browser bar */}
              <div className="bg-[var(--card)] border-b border-[var(--border)] px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 bg-[var(--muted)] rounded-md mx-8 h-6 flex items-center px-3">
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    app.nuvio.com.br/dashboard
                  </span>
                </div>
              </div>

              <Image
                src="/dashboard-real.png"
                alt="Nuvio Dashboard — painel de help desk com métricas, chamados e automações"
                width={1200}
                height={675}
                className="w-full h-auto"
                priority
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-[var(--border)] flex items-start justify-center p-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-[var(--muted-foreground)]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ SOCIAL PROOF BAR ═══════════ */}
      <section className="relative py-20 border-y border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <p className="text-center text-sm text-[var(--muted-foreground)] mb-12 uppercase tracking-widest font-medium">
              Números que falam por nós
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 1284, suffix: "+", label: "Empresas ativas" },
              { value: 50000, suffix: "+", label: "Tickets resolvidos" },
              { value: 98, suffix: "%", label: "Satisfação (CSAT)" },
              { value: 2, suffix: "min", prefix: "<", label: "Tempo médio de resposta" },
            ].map((s, i) => (
              <StaggerItem key={i}>
                <p className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-1">
                  <AnimatedCounter
                    target={s.value}
                    suffix={s.suffix}
                    prefix={s.prefix}
                  />
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {s.label}
                </p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="relative py-28">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-3">
              Funcionalidades
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Tudo que seu suporte precisa,{" "}
              <br className="hidden md:block" />
              <span className="bg-[var(--gradient-primary)] bg-clip-text text-transparent">
                em um só lugar
              </span>
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-xl mx-auto text-lg">
              Do primeiro contato à resolução — ferramentas conectadas que
              escalam seu atendimento sem perder qualidade.
            </p>
          </ScrollReveal>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <StaggerItem key={i}>
                <div className="group relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg hover:shadow-[#2fae5a08] hover:-translate-y-1 h-full">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-4 group-hover:bg-[var(--primary)]/15 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════ PRODUCT SHOWCASE ═══════════ */}
      <section className="relative py-28 overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-[var(--muted)]/50" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,#2fae5a06_0%,transparent_70%)]" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <ScrollReveal>
              <span className="inline-block text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-3">
                Por que a Nuvio?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Projetado para{" "}
                <span className="bg-[var(--gradient-primary)] bg-clip-text text-transparent">
                  times que não param
                </span>
              </h2>
              <div className="space-y-5">
                {[
                  {
                    title: "Setup em minutos",
                    desc: "Importe contatos, configure filas e comece a atender sem onboarding longo.",
                  },
                  {
                    title: "Integrações nativas",
                    desc: "Conecte com Freshdesk, Slack, Zapier, APIs REST e muito mais.",
                  },
                  {
                    title: "Escala sem limites",
                    desc: "De 3 a 300 agentes — a infra cresce junto com seu time de suporte.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-0.5">{item.title}</h4>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Visual Card Stack */}
            <ScrollReveal delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-[radial-gradient(ellipse_at_center,#2fae5a10_0%,transparent_60%)] rounded-3xl blur-xl" />
                <div className="relative space-y-4">
                  {/* Card 1 */}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#e6f1fb] flex items-center justify-center text-[11px] font-bold text-[#185fa5]">
                          MS
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Erro ao gerar boleto
                          </p>
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            Maria Souza · há 10min
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--priority-high-bg)] text-[var(--priority-high-text)]">
                        Urgente
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-[var(--muted)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "75%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full rounded-full bg-[var(--primary)]"
                      />
                    </div>
                  </motion.div>

                  {/* Card 2 */}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#eaf3de] flex items-center justify-center text-[11px] font-bold text-[#3b6d11]">
                          CL
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Dúvida sobre plano Pro
                          </p>
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            Carlos Lima · há 42min
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--status-progress-bg)] text-[var(--status-progress-text)]">
                        Em andamento
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-[var(--muted)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "45%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.7 }}
                        className="h-full rounded-full bg-[#2fae5a]"
                      />
                    </div>
                  </motion.div>

                  {/* Card 3 */}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f1efe8] flex items-center justify-center text-[11px] font-bold text-[#5f5e5a]">
                          PA
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Solicitação de NF
                          </p>
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            Pedro Alves · há 2h
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--status-closed-bg)] text-[var(--status-closed-text)]">
                        Resolvido
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section id="testimonials" className="relative py-28">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-3">
              Depoimentos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Quem usa,{" "}
              <span className="bg-[var(--gradient-primary)] bg-clip-text text-transparent">
                recomenda
              </span>
            </h2>
          </ScrollReveal>

          <StaggerContainer className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <StaggerItem key={i}>
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 h-full flex flex-col hover:border-[var(--primary)]/30 transition-colors duration-300">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg
                        key={j}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#2fae5a"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed flex-1 mb-6">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-xs font-bold text-[var(--primary)]">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section
        id="pricing"
        className="relative py-28 bg-[var(--muted)]/50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-3">
              Planos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Completo e{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
                exclusivo
              </span>
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
              Plano único com todos os recursos que a sua operação precisa para decolar, sem limitações.
            </p>
          </ScrollReveal>

          <StaggerContainer className="max-w-md mx-auto items-stretch">
            {plans.map((plan, i) => (
              <StaggerItem key={i}>
                <div
                  className={`relative bg-[var(--card)] rounded-2xl p-7 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 ${
                    plan.featured
                      ? "border-2 border-[var(--primary)] shadow-xl shadow-[#2fae5a10]"
                      : "border border-[var(--border)]"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-[var(--primary)] text-white px-3 py-1 rounded-full">
                      Exclusivo
                    </span>
                  )}

                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mb-5">
                    {plan.desc}
                  </p>

                  <div className="mb-6">
                    {plan.price !== "Sob consulta" ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-[var(--muted-foreground)]">
                          R$
                        </span>
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-sm text-[var(--muted-foreground)]">
                          /mês
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold">Sob consulta</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feat, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={`text-center font-semibold text-sm py-3 rounded-xl transition-all duration-200 ${
                      plan.featured
                        ? "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white hover:shadow-lg hover:shadow-[#2fae5a20]"
                        : "bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#2fae5a08_0%,transparent_60%)]" />

        <ScrollReveal className="relative max-w-3xl mx-auto px-6 text-center">
          <NuvioLogo className="w-12 h-12 text-[var(--primary)] mx-auto mb-8 opacity-50" />
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Pronto para transformar
            <br />
            <span className="bg-[var(--gradient-primary)] bg-clip-text text-transparent">
              seu atendimento?
            </span>
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] mb-10 max-w-xl mx-auto">
            Comece hoje com 14 dias grátis. Sem cartão de crédito, sem
            compromisso. Configure em menos de 5 minutos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-[#2fae5a25] hover:-translate-y-0.5 text-base"
            >
              Criar conta gratuita
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:translate-x-0.5 transition-transform"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <a
              href="mailto:contato@nuvio.com.br"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium transition-colors"
            >
              Falar com vendas →
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-[var(--border)] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <NuvioLogo className="w-7 h-7 text-[var(--primary)]" />
                <span className="text-lg font-bold">nuvio</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                Plataforma de atendimento inteligente para empresas que
                precisam de agilidade e eficiência.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: "Produto",
                links: [
                  { label: "Funcionalidades", href: "#features" },
                  { label: "Planos", href: "#pricing" },
                  { label: "Integrações", href: "#" },
                  { label: "Changelog", href: "#" },
                ],
              },
              {
                title: "Empresa",
                links: [
                  { label: "Sobre nós", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Carreiras", href: "#" },
                  { label: "Contato", href: "#" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacidade", href: "#" },
                  { label: "Termos de uso", href: "#" },
                  { label: "LGPD", href: "#" },
                  { label: "SLA", href: "#" },
                ],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href={link.href}
                        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--border)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} Nuvio. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2fae5a] animate-pulse" />
              <span className="text-xs text-[var(--muted-foreground)]">
                Todos os sistemas operacionais
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
