import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { getDonors, getRequests } from "../services/api";
import { motion } from "motion/react";

interface LiveStats {
  topGroups: { group: string; count: number }[];
  pending: number;
  matchRate: number;
}

export function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<LiveStats | null>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add a slight delay for better visual effect when scrolling
          setTimeout(() => setFooterInView(true), 300);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    Promise.all([getDonors(), getRequests()]).then(([donors, requests]) => {
      // Count donors per blood group
      const groupMap: Record<string, number> = {};
      for (const d of donors) {
        if (d.availability_status === "Available") {
          groupMap[d.blood_group] = (groupMap[d.blood_group] ?? 0) + 1;
        }
      }
      const topGroups = Object.entries(groupMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([group, count]) => ({ group, count }));

      const pending = requests.filter((r) => r.status === "Pending").length;
      const fulfilled = requests.filter((r) => r.status === "Fulfilled").length;
      const matchRate = requests.length > 0 ? Math.round((fulfilled / requests.length) * 100) : 0;

      setStats({ topGroups, pending, matchRate });
    }).catch(() => {});
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen font-['Inter',sans-serif] transition-colors duration-300">

      {/* ── Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-slate-900 border-b border-[#e5e7eb] dark:border-slate-800 flex items-center justify-between px-6 lg:px-8 transition-colors duration-300">
        {/* Logo */}
        <button onClick={() => scrollTo("hero")} className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#d72638] rounded-[14px] shadow-[0px_4px_14px_rgba(215,38,56,0.31)] flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-5 h-5 text-white fill-current">
              <path d="M10 2C7.2 2 5 6.2 5 9c0 4.4 5 10 5 10s5-5.6 5-10c0-2.8-2.2-7-5-7zm0 7a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </div>
          <span className="text-[#d72638] font-extrabold text-xl tracking-[-0.5px]">BloodLink</span>
        </button>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollTo("how-it-works")} className="text-[#374151] dark:text-slate-300 hover:text-[#d72638] dark:hover:text-[#d72638] text-sm font-medium transition-colors">How It Works</button>
          <button onClick={() => scrollTo("who-uses")} className="text-[#374151] dark:text-slate-300 hover:text-[#d72638] dark:hover:text-[#d72638] text-sm font-medium transition-colors">About</button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="hidden sm:block px-4 py-2.5 border-2 border-[#1a1a2e] dark:border-slate-400 rounded-lg text-[#1a1a2e] dark:text-slate-300 text-sm font-semibold hover:bg-[#1a1a2e] hover:text-white dark:hover:bg-slate-300 dark:hover:text-[#0f172a] transition-all"
          >
            Login as Admin
          </button>
          <button
            onClick={() => navigate("/donor")}
            className="px-4 py-2.5 bg-[#d72638] rounded-lg text-white text-sm font-semibold shadow-[0px_4px_14px_rgba(215,38,56,0.25)] hover:bg-[#b01e2c] transition-all"
          >
            Login as Donor
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="hero" className="bg-[#1a1a2e] dark:bg-[#0b0f19] pt-16 min-h-screen flex items-center overflow-hidden relative transition-colors duration-300">
        {/* Ambient glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#d72638]/10 blur-[120px] pointer-events-none" />

        {/* Floating blood drops */}
        <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute left-14 top-20 text-2xl opacity-30 rotate-6 select-none">🩸</motion.span>
        <motion.span animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute left-20 top-60 text-2xl opacity-30 -rotate-5 select-none">🩸</motion.span>
        <motion.span animate={{ y: [0, -15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute left-8 bottom-28 text-2xl opacity-30 rotate-3 select-none">🩸</motion.span>
        <motion.span animate={{ y: [0, 10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} className="absolute right-20 top-32 text-2xl opacity-30 -rotate-2 select-none">🩸</motion.span>
        <motion.span animate={{ y: [0, -12, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="absolute right-28 bottom-32 text-2xl opacity-30 rotate-8 select-none">🩸</motion.span>

        <div className="max-w-[1160px] mx-auto px-6 lg:px-8 w-full py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

          {/* Left: copy */}
          <div className="lg:col-span-7">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 bg-[rgba(215,38,56,0.14)] border border-[rgba(215,38,56,0.31)] rounded-full px-4 py-2 mb-8">
              <span className="text-base">🩸</span>
              <span className="text-[#fca5a5] text-[13px] font-semibold">Emergency Blood Network</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-white font-extrabold text-[44px] lg:text-[58px] leading-[1.1] tracking-[-1px] mb-6">
              Find Compatible Blood{" "}
              <span className="text-[#d72638]">Donors</span>
              <br />
              In Minutes, Not Hours.
            </motion.h1>

            {/* Subtext */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-[#9ca3af] text-[18px] leading-[1.7] mb-10 max-w-[470px]">
              BloodLink connects hospitals, blood banks, and donors through a real-time database — built for emergencies, designed for speed.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-6 py-4 border-2 border-white rounded-lg text-white font-semibold text-base hover:bg-white hover:text-[#1a1a2e] transition-all"
              >
                🏥 Admin Portal
                <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </button>
              <button
                onClick={() => navigate("/donor")}
                className="flex items-center gap-2 px-6 py-4 bg-[#d72638] rounded-lg text-white font-semibold text-base shadow-[0px_6px_24px_rgba(215,38,56,0.31)] hover:bg-[#b01e2c] transition-all"
              >
                🩸 Join as Donor
              </button>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="text-[#6b7280] text-[13px]">✓ Trusted by hospitals across Tamil Nadu &amp; Karnataka</motion.p>
          </div>

          {/* Right: live donor network card */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="lg:col-span-5">
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.12)] rounded-2xl overflow-hidden shadow-[0px_0px_60px_rgba(215,38,56,0.19),0px_20px_40px_rgba(0,0,0,0.4)] max-w-[340px] mx-auto lg:mx-0 lg:ml-auto">
              {/* Glow overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(215,38,56,0.12),transparent_70%)] pointer-events-none rounded-2xl" />

              {/* Header */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
                </span>
                <span className="text-[#9ca3af] text-[11px] font-semibold tracking-[0.96px] uppercase">Live Donor Network</span>
              </div>

              <div className="px-6 pb-6 space-y-3">
                {/* Top blood groups */}
                {(stats?.topGroups?.length
                  ? stats.topGroups
                  : [{ group: "—", count: 0 }, { group: "—", count: 0 }]
                ).map((item, i) => (
                  <div
                    key={i}
                    className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] rounded-2xl px-4 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🩸</span>
                      <div>
                        <span className="text-white font-bold text-base font-mono">{item.group}</span>
                        <span className="text-[#9ca3af] text-[11px] ml-1">blood type</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-extrabold text-[22px]">{item.count}</p>
                      <p className="text-[#6b7280] text-[11px]">donors available</p>
                    </div>
                  </div>
                ))}

                {/* Pending requests */}
                <div className="bg-[rgba(215,38,56,0.13)] border border-[rgba(215,38,56,0.25)] rounded-2xl px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏥</span>
                    <span className="text-[#fca5a5] text-[14px] font-semibold">Pending Requests</span>
                  </div>
                  <span className="text-[#fca5a5] font-extrabold text-[22px]">
                    {stats?.pending ?? "—"}
                  </span>
                </div>

                {/* Match rate bar */}
                <div className="pt-1 border-t border-[rgba(255,255,255,0.1)]">
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-1 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats?.matchRate ?? 0}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#d72638] to-[#ff6b7a] rounded-full"
                      />
                    </div>
                    <span className="text-[#9ca3af] text-[11px] whitespace-nowrap">
                      {stats?.matchRate ?? 0}% match rate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 border-2 border-[rgba(255,255,255,0.3)] rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-white dark:bg-slate-900 py-24 px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-[1160px] mx-auto">
          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-[#1a1a2e] dark:text-white font-extrabold text-[36px] tracking-[-0.5px] mb-2 transition-colors">
              How BloodLink Works
            </h2>
            <p className="text-[#6b7280] dark:text-slate-400 text-[18px] transition-colors">Simple. Fast. Life-saving.</p>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector arrows (fixed layout logic for 3 items) */}
            <div className="hidden md:flex absolute top-[52px] left-[16.6%] right-[16.6%] items-center justify-between z-10 pointer-events-none">
              <div className="w-[40%] h-[2px] bg-[rgba(215,38,56,0.19)] dark:bg-[rgba(215,38,56,0.5)] relative">
                <svg viewBox="0 0 20 20" className="absolute -right-3 -top-2.5 w-5 h-5 text-[#d72638] fill-current"><path d="M10 3l7 7-7 7M3 10h14"/></svg>
              </div>
              <div className="w-[40%] h-[2px] bg-[rgba(215,38,56,0.19)] dark:bg-[rgba(215,38,56,0.5)] relative">
                <svg viewBox="0 0 20 20" className="absolute -right-3 -top-2.5 w-5 h-5 text-[#d72638] fill-current"><path d="M10 3l7 7-7 7M3 10h14"/></svg>
              </div>
            </div>

            {[
              {
                num: "01",
                icon: "🏥",
                title: "Hospital Raises Request",
                desc: "A hospital logs an emergency with patient name, blood group, and quantity needed.",
              },
              {
                num: "02",
                icon: "🔍",
                title: "System Matches Donors",
                desc: "BloodLink scans for available donors with matching blood group who haven't donated in the last 90 days.",
              },
              {
                num: "03",
                icon: "🩸",
                title: "Donor is Contacted",
                desc: "Eligible donors are identified and the hospital can coordinate pickup or donation immediately.",
              },
            ].map((card, idx) => (
              <motion.div
                key={card.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="bg-white dark:bg-slate-800 border border-[#e5e7eb] dark:border-slate-700 rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none p-8 relative group hover:shadow-md transition-all z-20"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="bg-[rgba(215,38,56,0.07)] dark:bg-[rgba(215,38,56,0.15)] border border-[rgba(215,38,56,0.14)] dark:border-[rgba(215,38,56,0.3)] rounded-[14px] w-14 h-14 flex items-center justify-center text-2xl">
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-bold tracking-[1.1px] text-[rgba(215,38,56,0.38)] dark:text-[rgba(215,38,56,0.8)]">{card.num}</span>
                </div>
                <h3 className="text-[#1a1a2e] dark:text-white font-bold text-[18px] mb-3 transition-colors">{card.title}</h3>
                <p className="text-[#6b7280] dark:text-slate-400 text-[14px] leading-[1.7] transition-colors">{card.desc}</p>
                {/* Bottom accent */}
                <div className="absolute bottom-0 left-8 h-0.5 w-0 bg-gradient-to-r from-[#d72638] to-transparent rounded-full group-hover:w-16 transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-[#d72638] dark:bg-[#b01e2c] transition-colors duration-300">
        <div className="max-w-[1160px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { value: "500+", label: "Donors" },
            { value: "3",    label: "Blood Banks" },
            { value: "50+",  label: "Requests Fulfilled" },
            { value: "3",    label: "Cities" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`flex flex-col items-center justify-center py-10 gap-2 ${i < 3 ? "border-r border-[rgba(255,255,255,0.2)]" : ""}`}
            >
              <span className="text-white font-extrabold text-[52px] leading-none">{stat.value}</span>
              <span className="text-[rgba(255,255,255,0.7)] dark:text-[rgba(255,255,255,0.9)] text-[14px]">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Who Uses BloodLink ── */}
      <section id="who-uses" className="bg-[#f5f5f5] dark:bg-slate-900 py-24 px-6 lg:px-8 transition-colors duration-300 overflow-hidden">
        <div className="max-w-[1160px] mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-[#1a1a2e] dark:text-white font-extrabold text-[36px] tracking-[-0.5px] text-center mb-14 transition-colors"
          >
            Who Uses BloodLink?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donor card */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white dark:bg-slate-800 border-l-4 border-[#d72638] rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none p-8 hover:shadow-md transition-all"
            >
              <div className="bg-[rgba(215,38,56,0.07)] dark:bg-[rgba(215,38,56,0.15)] rounded-[14px] w-14 h-14 flex items-center justify-center text-2xl mb-8">
                🩸
              </div>
              <h3 className="text-[#1a1a2e] dark:text-white font-bold text-[22px] mb-3 transition-colors">Register as a Donor</h3>
              <p className="text-[#6b7280] dark:text-slate-400 text-[15px] leading-[1.8] mb-8 transition-colors">
                Join the network. Keep your availability updated so hospitals can find you instantly when someone needs your blood group.
              </p>
              <button
                onClick={() => navigate("/donor")}
                className="flex items-center gap-2 px-5 py-3 bg-[#d72638] rounded-lg text-white text-[14px] font-semibold shadow-[0px_4px_14px_rgba(215,38,56,0.25)] hover:bg-[#b01e2c] transition-all w-fit"
              >
                Get Started as Donor
                <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </button>
            </motion.div>

            {/* Hospital/Admin card */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="bg-white dark:bg-slate-800 border-l-4 border-[#1a1a2e] dark:border-slate-500 rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.06)] dark:shadow-none p-8 hover:shadow-md transition-all"
            >
              <div className="bg-[rgba(26,26,46,0.07)] dark:bg-slate-700 rounded-[14px] w-14 h-14 flex items-center justify-center text-2xl mb-8">
                🏥
              </div>
              <h3 className="text-[#1a1a2e] dark:text-white font-bold text-[22px] mb-3 transition-colors">Hospital &amp; Admin Portal</h3>
              <p className="text-[#6b7280] dark:text-slate-400 text-[15px] leading-[1.8] mb-8 transition-colors">
                Manage emergency requests, track donor availability, and coordinate blood bank inventory in real time.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-5 py-3 bg-[#1a1a2e] dark:bg-slate-600 rounded-lg text-white text-[14px] font-semibold hover:opacity-80 transition-all w-fit"
              >
                Admin Login
                <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer ref={footerRef} className="bg-[#1a1a2e] dark:bg-[#0b0f19] border-t-4 border-[#d72638] transition-colors duration-300">
        <div className="max-w-[1160px] mx-auto px-6 lg:px-8 pt-14 pb-8">
          {/* Top row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#d72638] rounded-[14px] flex items-center justify-center">
                  <svg viewBox="0 0 20 20" className="w-5 h-5 text-white fill-current">
                    <path d="M10 2C7.2 2 5 6.2 5 9c0 4.4 5 10 5 10s5-5.6 5-10c0-2.8-2.2-7-5-7zm0 7a2 2 0 110-4 2 2 0 010 4z"/>
                  </svg>
                </div>
                <span className="text-white font-extrabold text-xl">BloodLink</span>
              </div>
              <p className="text-[#9ca3af] text-[14px] max-w-[225px] leading-[1.6]">Every Drop Counts. Every Second Matters.</p>
            </div>

            {/* Nav links */}
            <nav className="flex flex-wrap gap-x-8 gap-y-2">
              {[
                { label: "Home",           action: () => scrollTo("hero") },
                { label: "How it Works",   action: () => scrollTo("how-it-works") },
                { label: "Login as Donor", action: () => navigate("/donor") },
                { label: "Admin Login",    action: () => navigate("/login") },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="text-[#9ca3af] hover:text-white text-[14px] font-medium transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.1)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[#6b7280] dark:text-slate-500 text-[13px]">© 2026 BloodLink. Built for Emergency Response.</p>
            <div className="flex items-center gap-1 text-[#6b7280] dark:text-slate-500 text-[13px]">
              <span>Made with ❤️ for life</span>
              <div className={`overflow-hidden inline-flex transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap ${footerInView ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
                <span className="pl-1 text-[#d72638] font-medium tracking-wide">by Dinesh & Team</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
