import { useEffect, useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, Mail, ShieldCheck, Sparkles, Smile, HeartPulse, ArrowUpRight, Menu, X, Check, Search, Trash2, LogOut, Star, ChevronRight } from 'lucide-react';
import Logo from './components/Logo';
import supabase from './lib/supabase';

// Types
type Service = { id: number; name: string; description: string; price: string; duration: string; icon: string; };
type Doctor = { id: number; name: string; specialty: string; experience: string; image: string; };
type Testimonial = { id: number; name: string; text: string; rating: number; treatment: string; };
type Appointment = { id: number; patient_name: string; email: string; phone: string; service: string; doctor: string | null; date: string; time: string; notes: string | null; status: string; created_at: string; };

const address = "81 St, Kuwait City 35908, Kuwait";
const phone = "+965 500 03073";
const fullAddress = "924G+F7 Kuwait City, Kuwait — 81 St, Kuwait City 35908";

function useSiteData() {
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [sRes, dRes, tRes, aRes] = await Promise.all([
        fetch('/api/services').then(r=>r.json()).catch(()=>[]),
        fetch('/api/doctors').then(r=>r.json()).catch(()=>[]),
        fetch('/api/testimonials').then(r=>r.json()).catch(()=>[]),
        fetch('/api/appointments').then(r=>r.json()).catch(()=>[]),
      ]);
      setServices(Array.isArray(sRes) ? sRes : []);
      setDoctors(Array.isArray(dRes) ? dRes : []);
      setTestimonials(Array.isArray(tRes) ? tRes : []);
      setAppointments(Array.isArray(aRes) ? aRes : []);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchAll(); },[]);
  return { services, doctors, testimonials, appointments, loading, refetch: fetchAll };
}

function Navbar({ onBook }: { onBook: ()=>void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(()=>{ const h=()=>setScrolled(window.scrollY>20); window.addEventListener('scroll',h); return ()=>window.removeEventListener('scroll',h); },[]);
  const links = [
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'contact', label: 'Contact' },
  ];
  const scrollTo = (id:string)=>{ document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setMobile(false); };
  return (
    <motion.header initial={{ y:-20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ duration:0.7 }} className={`fixed top-0 left-0 right-0 z-[50] transition-all ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="mx-auto max-w-[1280px] px-6">
        <div className={`flex items-center justify-between rounded-[22px] border px-5 py-3 backdrop-blur-xl transition-all ${scrolled ? 'bg-white/90 border-black/10 shadow-[0_12px_40px_rgba(0,0,0,0.08)]' : 'bg-white/60 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)]'}`}>
          <Logo />
          <nav className="hidden lg:flex items-center gap-8">
            {links.map(l=>(
              <button key={l.id} onClick={()=>scrollTo(l.id)} className="text-[13.5px] font-[550] tracking-[-0.01em] text-[#0B1F18]/80 hover:text-[#0B1F18] transition">{l.label}</button>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+96550003073" className="hidden xl:flex items-center gap-2 text-[13px] font-medium text-[#0B1F18]/60 mr-2"><Phone className="w-4 h-4"/> {phone}</a>
            <button onClick={onBook} className="rounded-full bg-[#0B1F18] text-white px-6 h-[42px] text-[13.5px] font-[600] hover:bg-black transition flex items-center gap-2">Book visit <ArrowUpRight className="w-4 h-4"/></button>
          </div>
          <button onClick={()=>setMobile(!mobile)} className="lg:hidden w-10 h-10 rounded-full bg-[#0B1F18] text-white grid place-items-center">{mobile?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
        </div>
        <AnimatePresence>
          {mobile && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="lg:hidden mt-3 rounded-[20px] bg-white border border-black/10 shadow-xl p-3">
              {links.map(l=>(
                <button key={l.id} onClick={()=>scrollTo(l.id)} className="w-full text-left px-4 py-3 rounded-xl hover:bg-black/5 text-[15px] font-medium">{l.label}</button>
              ))}
              <button onClick={()=>{ setMobile(false); onBook(); }} className="mt-2 w-full rounded-full bg-[#0B1F18] text-white h-12 font-semibold">Book an appointment</button>
              <a href="/admin" className="block text-center mt-2 text-xs text-black/50">Doctors portal →</a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

function Hero({ onBook }: { onBook: ()=>void }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, -80]);
  const y2 = useTransform(scrollY, [0, 600], [0, -140]);
  return (
    <section className="relative pt-[108px] pb-12 lg:pb-20 overflow-hidden bg-[#FCFCF7]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[30%] left-[20%] w-[70%] h-[70%] bg-[#DDE8DF] rounded-full blur-[90px] opacity-60" />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[60%] bg-[#E8EDE0] rounded-full blur-[80px] opacity-70" />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
          <motion.div style={{ y: y1 }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0B1F18] text-white px-3 py-1.5 text-[11px] font-[600] tracking-wide uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-[#C6FF5A] animate-pulse"/> Now open in Kuwait City • Closes 7 PM
            </div>
            <h1 className="text-[52px] sm:text-[68px] lg:text-[88px] font-[800] leading-[0.9] tracking-[-0.05em] text-[#0B1F18]">
              Dental <br/> care that <br/>
              <span className="relative inline-block">
                <span className="relative z-10">feels</span>
                <span className="absolute bottom-[10%] left-0 right-0 h-[42%] bg-[#D6FF7E] -rotate-[1deg] rounded-sm"/>
              </span> calm.
            </h1>
            <p className="mt-6 max-w-[44ch] text-[18px] leading-[1.5] text-[#0B1F18]/60 font-[450]">Minimal, painless, and human. Liddawi Clinic in Kuwait City — family dentistry, implants, aesthetics, and emergency care in a serene, studio-like space.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={onBook} className="group rounded-full bg-[#0B1F18] text-white px-8 h-[54px] text-[15px] font-[650] flex items-center gap-3 hover:bg-black transition">
                Book your visit
                <span className="w-8 h-8 rounded-full bg-white text-black grid place-items-center group-hover:rotate-45 transition"><ArrowUpRight className="w-4 h-4"/></span>
              </button>
              <button onClick={()=>document.getElementById('services')?.scrollIntoView({behavior:'smooth'})} className="rounded-full border border-black/10 bg-white px-8 h-[54px] text-[15px] font-[600] hover:bg-black/[0.04] transition">Explore services</button>
            </div>
            <div className="mt-10 grid grid-cols-3 max-w-[520px] rounded-[20px] bg-white border border-black/10 p-2">
              {[
                { k: '15+', v: 'Years of trust' },
                { k: '4.9/5', v: '2.4k Reviews' },
                { k: '<30m', v: 'Avg wait time' },
              ].map(s=>(
                <div key={s.k} className="rounded-[14px] px-4 py-3 text-center">
                  <div className="text-[22px] font-[800] tracking-tight leading-none">{s.k}</div>
                  <div className="mt-1 text-[11px] font-[600] uppercase tracking-wide text-black/50">{s.v}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div style={{ y: y2 }} className="relative lg:mt-6">
            <div className="relative rounded-[36px] overflow-hidden bg-[#0B1F18] aspect-[4/4.6] border border-black/10 shadow-[0_40px_80px_rgba(0,0,0,0.18)]">
              {/* Abstract clinic visual */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1B3328] to-[#0B1F18]"/>
              <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(600px 400px at 30% 20%, #C6FF5A 0%, transparent 60%), radial-gradient(500px 300px at 80% 70%, #A8E2BA 0%, transparent 60%)'}} />
              <div className="absolute top-6 left-6 right-6 flex justify-between">
                <div className="rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 text-[11px] font-bold tracking-widest uppercase text-white">Studio A • Sterile + Calm</div>
                <div className="w-10 h-10 rounded-full bg-[#C6FF5A] grid place-items-center text-[#0B1F18]"><Smile className="w-5 h-5"/></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="rounded-[20px] bg-white p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0B1F18] grid place-items-center text-white"><ShieldCheck className="w-6 h-6"/></div>
                  <div className="flex-1">
                    <div className="text-[13px] font-[700] leading-tight">Next available today</div>
                    <div className="text-[12px] text-black/60">Dr. Liddawi • 4:20 PM — Implant consult</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-black/5 grid place-items-center"><ChevronRight className="w-4 h-4"/></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] bg-white/10 backdrop-blur-xl border border-white/15 p-4 text-white">
                    <div className="text-[12px] opacity-70 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Address</div>
                    <div className="mt-1 text-[13px] font-[550] leading-[1.2]">{address}</div>
                  </div>
                  <div className="rounded-[18px] bg-[#C6FF5A] p-4 text-[#0B1F18]">
                    <div className="text-[11px] font-bold uppercase tracking-widest opacity-70">Direct line</div>
                    <div className="mt-1 text-[15px] font-[800]">{phone}</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-[42%] left-1/2 -translate-x-1/2 w-[72%] aspect-square rounded-full border border-white/10 border-dashed animate-spin" style={{ animationDuration:'18s'}} />
              <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="mx-auto w-[116px] h-[116px] rounded-full bg-white shadow-[0_0_0_16px_rgba(255,255,255,0.06)] grid place-items-center">
                  <div className="w-[86px] h-[86px] rounded-full bg-[#0B1F18] grid place-items-center text-white">
                    <svg width="38" height="38" viewBox="0 0 32 32" fill="none"><path d="M16 27C16 27 7 21.5 7 13C7 8.2 10.2 5.5 14 5.5C15.6 5.5 16 7 16 7C16 7 16.4 5.5 18 5.5C21.8 5.5 25 8.2 25 13C25 21.5 16 27 16 27Z" stroke="white" strokeWidth="1.6" fill="white" fillOpacity="0.12"/><path d="M11.5 14.2C11.5 14.2 13 16.4 16 16.4C19 16.4 20.5 14.2 20.5 14.2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  </div>
                </div>
                <div className="mt-4 text-white/80 text-[11px] tracking-[0.3em] uppercase font-bold">Dental • Kuwait</div>
              </div>
            </div>
            <div className="hidden lg:flex absolute -left-12 top-[56%] -rotate-12 rounded-[16px] bg-white border border-black/10 shadow-lg px-4 py-3 items-center gap-3">
              <img src="https://i.pravatar.cc/100?img=32" className="w-9 h-9 rounded-full object-cover" alt="" />
              <div className="text-[12px] leading-tight"><div className="font-[700]">Aisha • 5 min ago</div><div className="text-black/60">“The calmest cleaning ever.”</div></div>
              <div className="w-7 h-7 rounded-full bg-[#0B1F18] text-white grid place-items-center"><Star className="w-4 h-4 fill-white"/></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Services({ services, onBookService }: { services: Service[]; onBookService: (s:string)=>void }) {
  return (
    <section id="services" className="py-14 lg:py-20 bg-[#F6F5F0] border-y border-black/[0.06]">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex rounded-full bg-[#0B1F18] text-white px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">Services</div>
            <h2 className="mt-4 text-[40px] lg:text-[52px] font-[800] tracking-[-0.04em] leading-[0.9]">Precise care,<br/> no drama.</h2>
          </div>
          <p className="max-w-[36ch] text-[15px] leading-[1.5] text-black/60">Evidence-based, tech-forward dentistry. Every treatment is explained before it starts — with clear pricing and zero pressure.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.length===0 ? (
            Array.from({length:6}).map((_,i)=><div key={i} className="h-[240px] rounded-[28px] bg-white animate-pulse border border-black/5"/>) 
          ) : services.map((s, idx)=>(
            <motion.div key={s.id} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: idx*0.05 }} className="group relative rounded-[28px] bg-white border border-black/10 p-6 flex flex-col hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-full bg-[#F0F2E9] border border-black/5 grid place-items-center text-[#0B1F18]">
                  {s.icon==='smile' ? <Smile className="w-6 h-6"/> : s.icon==='implant' ? <ShieldCheck className="w-6 h-6"/> : s.icon==='sparkles' ? <Sparkles className="w-6 h-6"/> : s.icon==='heart' ? <HeartPulse className="w-6 h-6"/> : <Smile className="w-6 h-6"/>}
                </div>
                <div className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-[650] tracking-wide">{s.duration}</div>
              </div>
              <h3 className="mt-6 text-[20px] font-[750] tracking-[-0.02em] leading-[1.1]">{s.name}</h3>
              <p className="mt-2 text-[13.5px] leading-[1.5] text-black/60 line-clamp-3">{s.description}</p>
              <div className="mt-auto pt-6 flex items-center justify-between">
                <span className="text-[14px] font-[700]">{s.price}</span>
                <button onClick={()=>onBookService(s.name)} className="rounded-full bg-[#0B1F18] text-white h-9 px-4 text-[13px] font-[600] flex items-center gap-1 group-hover:bg-black transition">Book <ArrowUpRight className="w-4 h-4"/></button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-16 lg:py-28 bg-white">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
          <div className="relative">
            <div className="rounded-[32px] overflow-hidden border border-black/10 aspect-[4/5] bg-[#E8EFEA] relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F18]/60 to-transparent"/>
              <div className="absolute inset-0 grid place-items-center">
                <div className="w-[78%] rounded-[28px] bg-white/90 backdrop-blur p-5 border border-white shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0B1F18] grid place-items-center text-white"><ShieldCheck className="w-5 h-5"/></div>
                    <div><div className="text-[13px] font-bold">Sterilization Class B</div><div className="text-[11px] text-black/60">Autoclave, HEPA, sealed kits</div></div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-black/5 p-3"><div className="text-[11px] uppercase font-bold text-black/50">Safety</div><div className="text-[13px] font-semibold mt-1">100% disposable + tracked</div></div>
                    <div className="rounded-xl bg-[#C6FF5A] p-3"><div className="text-[11px] uppercase font-bold text-black/60">Comfort</div><div className="text-[13px] font-semibold mt-1">Noise-cancelling, sedation</div></div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-[18px] bg-white p-4 flex items-center gap-3 border border-black/5">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-black/5"><img src="https://i.pravatar.cc/100?img=15" alt="" className="w-full h-full object-cover"/></div>
                <div className="text-[12px]"><div className="font-bold">Our promise</div><div className="text-black/60">No upsell. Only what you need.</div></div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 hidden lg:flex rounded-[18px] bg-[#0B1F18] text-white p-4 gap-3 items-center shadow-xl">
              <div className="w-10 h-10 rounded-full bg-white text-[#0B1F18] grid place-items-center"><Smile className="w-5 h-5"/></div>
              <div className="text-[12px] leading-tight"><div className="font-bold">Over 8,400 smiles</div><div className="opacity-70">Since 2009 in Kuwait</div></div>
            </div>
          </div>
          <div>
            <div className="inline-flex rounded-full border border-black/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">Why Liddawi</div>
            <h2 className="mt-4 text-[38px] lg:text-[56px] font-[800] tracking-[-0.04em] leading-[0.9]">We trade noise for calm and clarity.</h2>
            <p className="mt-5 text-[16px] leading-[1.6] text-black/60 max-w-[52ch]">Liddawi Clinic is a boutique dental studio in Kuwait City. Architect-designed light, quiet rooms, and a team trained to make every visit feel safe. We do fewer things, exceptionally well.</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {[
                { t:'Transparent pricing', d:'Printed quote before treatment. No surprises.' },
                { t:'Gentle protocols', d:'Topical + guided anesthesia, slow techniques.' },
                { t:'Same-day CEREC', d:'Lab-grade crowns milled while you wait.' },
                { t:'Emergency slot daily', d:'We hold 2 chairs for pain cases everyday.' },
              ].map(f=>(
                <div key={f.t} className="rounded-[20px] border border-black/10 bg-[#FBFAF6] p-5">
                  <div className="w-7 h-7 rounded-full bg-[#0B1F18] text-white grid place-items-center"><Check className="w-4 h-4"/></div>
                  <div className="mt-3 text-[14px] font-[700]">{f.t}</div>
                  <div className="mt-1 text-[12.5px] text-black/60 leading-[1.4]">{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Doctors({ doctors }: { doctors: Doctor[] }) {
  return (
    <section id="doctors" className="py-16 lg:py-24 bg-[#0B1F18] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ background:'radial-gradient(700px 400px at 20% 10%, #C6FF5A 0%, transparent 60%)' }}/>
      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="flex justify-between items-end flex-wrap gap-6 mb-10">
          <h2 className="text-[38px] lg:text-[54px] font-[800] tracking-[-0.04em] leading-[0.9]">Doctors who listen first.</h2>
          <div className="text-[13px] font-medium text-white/60 max-w-[32ch]">UK & German trained. We double-book time, not patients — so you never feel rushed.</div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {doctors.length===0 ? Array.from({length:3}).map((_,i)=><div key={i} className="h-[420px] rounded-[30px] bg-white/5 animate-pulse"/>) : doctors.map((d, idx)=>(
            <motion.div key={d.id} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: idx*0.08 }} className="group rounded-[30px] overflow-hidden bg-[#12261E] border border-white/10 hover:border-white/20 transition">
              <div className="aspect-[4/3.2] relative bg-[#1A332A] overflow-hidden">
                <img src={d.image} alt={d.name} className="w-full h-full object-cover rounded-b-[0] group-hover:scale-[1.03] transition duration-700" style={{ borderRadius: 0 }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                <div className="absolute bottom-3 left-3 rounded-full bg-white text-[#0B1F18] px-3 py-1 text-[11px] font-bold">{d.experience}</div>
              </div>
              <div className="p-6">
                <div className="text-[18px] font-[750]">{d.name}</div>
                <div className="mt-1 inline-flex rounded-full bg-white/10 border border-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide uppercase">{d.specialty}</div>
                <div className="mt-4 flex items-center gap-2 text-[12px] text-white/60"><ShieldCheck className="w-4 h-4"/> Licensed MOH Kuwait • English / Arabic</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="py-16 lg:py-24 bg-[#F6F5F0]">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[32px] lg:text-[44px] font-[800] tracking-[-0.03em] leading-[0.95]">Patients talk. We listen.</h2>
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-white border border-black/10 px-3 py-1.5 text-[12px] font-bold"><Star className="w-4 h-4 fill-[#0B1F18]"/> 4.9 average • Google</div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {(items.length? items : [{ id:1, name:'Sarah K.', text:'The most gentle clinic in Kuwait. Explain everything, no push for extras.', rating:5, treatment:'Cleaning & Whitening' }, { id:2, name:'Omar A.', text:'Got my implant in one calm morning. Zero pain, perfect follow-up.', rating:5, treatment:'Implant' }, { id:3, name:'Noura M.', text:'My kids actually ask to come. Play corner and kind team.', rating:5, treatment:'Family care' }] as Testimonial[]).map((t, i)=>(
            <motion.div key={t.id} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }} className="rounded-[26px] bg-white border border-black/10 p-6">
              <div className="flex items-center gap-1 text-[#0B1F18]">{Array.from({length:t.rating}).map((_,k)=><Star key={k} className="w-4 h-4 fill-[#0B1F18]"/>)}</div>
              <p className="mt-4 text-[15px] leading-[1.5] font-[450]">“{t.text}”</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black/5 grid place-items-center text-[12px] font-bold">{t.name.slice(0,1)}</div>
                <div><div className="text-[13px] font-[700]">{t.name}</div><div className="text-[11px] text-black/60">{t.treatment}</div></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-16 lg:py-24 bg-white relative">
      <div className="mx-auto max-w-[1280px] px-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
        <div>
          <div className="inline-flex rounded-full bg-[#0B1F18] text-white px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase">Visit us</div>
          <h2 className="mt-4 text-[36px] lg:text-[48px] font-[800] tracking-[-0.04em] leading-[0.9]">In the heart of Kuwait City. Easy parking.</h2>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="rounded-[22px] border border-black/10 p-5 bg-[#FBFAF6]">
              <div className="w-10 h-10 rounded-full bg-[#0B1F18] text-white grid place-items-center"><MapPin className="w-5 h-5"/></div>
              <div className="mt-4 text-[13px] font-bold tracking-widest uppercase text-black/50">Address</div>
              <div className="mt-1 text-[14px] font-[550] leading-[1.4]">{fullAddress}<br/>{address}</div>
              <div className="mt-3 text-[12px] text-black/60">Plus Code: {"924G+F7 Kuwait City"}</div>
            </div>
            <div className="rounded-[22px] border border-black/10 p-5 bg-[#FBFAF6]">
              <div className="w-10 h-10 rounded-full bg-[#0B1F18] text-white grid place-items-center"><Clock className="w-5 h-5"/></div>
              <div className="mt-4 text-[13px] font-bold tracking-widest uppercase text-black/50">Hours</div>
              <div className="mt-1 text-[14px] font-[600]">Open • Closes 7 PM</div>
              <div className="mt-1 text-[13px] text-black/60">Sat – Thu: 9am – 7pm<br/>Fri: Emergency only</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={`tel:${phone.replace(/\s/g,'')}`} className="rounded-full bg-[#0B1F18] text-white px-6 h-12 inline-flex items-center gap-2 font-semibold"><Phone className="w-4 h-4"/> Call {phone}</a>
            <a href="mailto:liddawi@gmail.com" className="rounded-full border border-black/10 bg-white px-6 h-12 inline-flex items-center gap-2 font-semibold"><Mail className="w-4 h-4"/> liddawi@gmail.com</a>
          </div>
        </div>
        <div className="rounded-[32px] overflow-hidden border border-black/10 bg-[#E9EFEA] aspect-[4/3.6] relative grid place-items-center">
          <div className="w-[90%] h-[88%] rounded-[26px] bg-white border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-40" style={{ background:'radial-gradient(500px 300px at 40% 30%, #DDE8DF 0%, transparent 60%)'}} />
            <div className="relative h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-bold tracking-widest uppercase">Map — Kuwait City</div>
                <div className="rounded-full bg-[#0B1F18] text-white px-3 py-1 text-[10px] font-bold">LIVE</div>
              </div>
              <div className="mt-6 flex-1 rounded-[18px] bg-[#0B1F18] relative overflow-hidden grid place-items-center">
                <div className="text-center text-white p-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-white text-[#0B1F18] grid place-items-center"><MapPin className="w-7 h-7"/></div>
                  <div className="mt-3 text-[16px] font-bold">Liddawi Clinic</div>
                  <div className="text-[12px] opacity-70 mt-1">{address}</div>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`} target="_blank" className="mt-4 inline-flex rounded-full bg-[#C6FF5A] text-[#0B1F18] px-4 h-9 items-center text-[13px] font-bold">Open in Maps</a>
                </div>
              </div>
              <div className="mt-3 flex gap-2 text-[11px] font-medium text-black/50"><span className="rounded-full bg-black/5 px-3 py-1">Free parking</span><span className="rounded-full bg-black/5 px-3 py-1">Wheelchair access</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0B1F18] text-white pt-12 pb-8">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap gap-10 justify-between">
          <div>
            <Logo light compact={false} />
            <div className="mt-4 text-[13px] text-white/60 max-w-[32ch]">Boutique dental studio. Minimal, honest, and calm. Kuwait City since 2009.</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-[13px]">
            <div><div className="font-bold mb-3 uppercase tracking-widest text-[11px] text-white/50">Clinic</div><div className="space-y-2 text-white/80"><div>81 St, Kuwait City 35908</div><div>924G+F7</div><div>Closes 7 PM</div></div></div>
            <div><div className="font-bold mb-3 uppercase tracking-widest text-[11px] text-white/50">Contact</div><div className="space-y-2 text-white/80"><div>{phone}</div><div>liddawi@gmail.com</div><div><a href="/admin" className="underline underline-offset-4 hover:text-white">Doctor login</a></div></div></div>
            <div><div className="font-bold mb-3 uppercase tracking-widest text-[11px] text-white/50">Legal</div><div className="space-y-2 text-white/60"><div>© {new Date().getFullYear()} Liddawi Clinic</div><div>MOH Licensed</div><div>Privacy — Terms</div></div></div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BookingModal({ open, onClose, initialService, doctors, onSuccess }: { open:boolean; onClose:()=>void; initialService?:string; doctors: Doctor[]; onSuccess:()=>void; }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ patient_name:'', email:'', phone:'', service: initialService||'', doctor:'', date:'', time:'', notes:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(()=>{ setForm(f=>({ ...f, service: initialService||f.service })); if(initialService) setStep(1); },[initialService, open]);

  const canNext = useMemo(()=>{
    if(step===1) return !!form.service;
    if(step===2) return !!form.date && !!form.time;
    if(step===3) return !!form.patient_name && !!form.email && !!form.phone;
    return true;
  },[step, form]);

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/appointments',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ ...form, status:'pending' }) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||'Failed');
      setDone(true);
      onSuccess();
      setTimeout(()=>{ onClose(); setDone(false); setStep(1); setForm({ patient_name:'', email:'', phone:'', service:'', doctor:'', date:'', time:'', notes:'' }); }, 1800);
    } catch(e:any){ setError(e.message); } finally { setLoading(false); }
  };

  if(!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[#0B1F18]/60 backdrop-blur-[12px]" onClick={onClose} />
      <motion.div initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }} className="relative w-full sm:max-w-[520px] max-h-[92vh] sm:max-h-[86vh] rounded-t-[28px] sm:rounded-[28px] bg-[#FCFCF7] border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-black/10">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-[#0B1F18] text-white grid place-items-center"><Calendar className="w-5 h-5"/></div><div><div className="text-[16px] font-[800] leading-none">Book a visit</div><div className="text-[11px] text-black/50 mt-1 font-medium tracking-wide uppercase">Step {step} of 3</div></div></div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/5 grid place-items-center"><X className="w-4 h-4"/></button>
        </div>
        <div className="px-6 pt-4">
          <div className="h-1.5 rounded-full bg-black/10 overflow-hidden"><motion.div animate={{ width: `${(step/3)*100}%` }} className="h-full bg-[#0B1F18]"/></div>
        </div>
        <div className="p-6 flex-1 overflow-auto">
          {done ? (
            <div className="py-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#C6FF5A] grid place-items-center"><Check className="w-8 h-8"/></div>
              <div className="mt-4 text-[22px] font-[800]">You're booked</div>
              <div className="text-[14px] text-black/60 mt-1">We’ll confirm via WhatsApp and email shortly.</div>
            </div>
          ) : (
            <>
            {step===1 && (
              <div className="space-y-4">
                <h3 className="text-[20px] font-[750]">What do you need help with?</h3>
                <div className="grid gap-2.5">
                  {["General Checkup & Cleaning", "Teeth Whitening", "Dental Implants", "Braces & Aligners", "Root Canal", "Pediatric Care", "Emergency Pain Relief", "Veneers & Aesthetics"].map(name=>(
                    <button key={name} onClick={()=>setForm(f=>({...f, service:name}))} className={`text-left rounded-[16px] border p-4 flex items-center justify-between transition ${form.service===name ? 'bg-[#0B1F18] text-white border-[#0B1F18]' : 'bg-white border-black/10 hover:border-black/20'}`}><span className="text-[14px] font-[600]">{name}</span><span className={`w-6 h-6 rounded-full border grid place-items-center ${form.service===name ? 'bg-white text-black border-white' : 'border-black/20'}`}>{form.service===name && <Check className="w-4 h-4"/>}</span></button>
                  ))}
                </div>
                <div className="pt-2">
                  <div className="text-[12px] font-bold uppercase tracking-widest text-black/50 mb-2">Preferred doctor (optional)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {doctors.slice(0,4).map(d=>(
                      <button key={d.name} onClick={()=>setForm(f=>({...f, doctor: f.doctor===d.name? '' : d.name}))} className={`rounded-[14px] border p-3 text-left ${form.doctor===d.name ? 'border-[#0B1F18] bg-[#0B1F18]/5' : 'border-black/10 bg-white'}`}><div className="text-[13px] font-[700]">{d.name.split(' ').slice(-1)[0]}</div><div className="text-[11px] text-black/60">{d.specialty}</div></button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step===2 && (
              <div className="space-y-4">
                <h3 className="text-[20px] font-[750]">Pick date & time</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[11px] font-bold uppercase tracking-widest text-black/50">Date</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} className="mt-1 w-full rounded-[14px] border border-black/10 bg-white h-11 px-4 text-[14px]" min={new Date().toISOString().split('T')[0]} /></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-widest text-black/50">Time</label><select value={form.time} onChange={e=>setForm(f=>({...f, time:e.target.value}))} className="mt-1 w-full rounded-[14px] border border-black/10 bg-white h-11 px-4 text-[14px]"><option value="">Select</option><option>09:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option><option>02:00 PM</option><option>03:30 PM</option><option>04:30 PM</option><option>05:30 PM</option></select></div>
                </div>
                <div className="rounded-[16px] bg-[#0B1F18] text-white p-4 flex gap-3"><div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center"><Clock className="w-5 h-5"/></div><div className="text-[13px] leading-[1.4]"><div className="font-bold">Open • Closes 7 PM</div><div className="opacity-70">Daily emergency slots available. Choose earliest if in pain.</div></div></div>
              </div>
            )}
            {step===3 && (
              <div className="space-y-4">
                <h3 className="text-[20px] font-[750]">Your details</h3>
                <div><label className="text-[11px] font-bold uppercase tracking-widest text-black/50">Full name</label><input value={form.patient_name} onChange={e=>setForm(f=>({...f, patient_name:e.target.value}))} placeholder="e.g. Fatima Al..." className="mt-1 w-full rounded-[14px] border border-black/10 bg-white h-11 px-4 text-[14px] outline-none focus:border-[#0B1F18]"/></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-[11px] font-bold uppercase tracking-widest text-black/50">Email</label><input type="email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} placeholder="you@email.com" className="mt-1 w-full rounded-[14px] border border-black/10 bg-white h-11 px-4 text-[14px]"/></div>
                  <div><label className="text-[11px] font-bold uppercase tracking-widest text-black/50">Phone / WhatsApp</label><input value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} placeholder="+965 ..." className="mt-1 w-full rounded-[14px] border border-black/10 bg-white h-11 px-4 text-[14px]"/></div>
                </div>
                <div><label className="text-[11px] font-bold uppercase tracking-widest text-black/50">Notes (optional)</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f, notes:e.target.value}))} placeholder="Pain level, previous work, etc." className="mt-1 w-full rounded-[14px] border border-black/10 bg-white min-h-[80px] p-4 text-[14px]"/></div>
                {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-[13px]">{error}</div>}
              </div>
            )}
            </>
          )}
        </div>
        {!done && (
          <div className="p-4 border-t border-black/10 bg-white flex gap-3">
            {step>1 && <button onClick={()=>setStep(s=>s-1)} className="flex-1 rounded-full border border-black/10 h-11 font-semibold">Back</button>}
            {step<3 ? <button disabled={!canNext} onClick={()=>setStep(s=>s+1)} className="flex-1 rounded-full bg-[#0B1F18] text-white h-11 font-semibold disabled:opacity-40 flex items-center justify-center gap-2">Continue <ChevronRight className="w-4 h-4"/></button> : <button disabled={!canNext || loading} onClick={submit} className="flex-1 rounded-full bg-[#0B1F18] text-white h-11 font-semibold disabled:opacity-40">{loading? 'Booking...' : 'Confirm appointment'}</button>}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function LandingPage() {
  const { services, doctors, testimonials, refetch } = useSiteData();
  const [bookOpen, setBookOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const handleBook = (s?:string)=>{ if(s) setSelectedService(s); setBookOpen(true); };
  return (
    <div className="min-h-screen bg-[#FCFCF7] text-[#0B1F18] antialiased selection:bg-[#C6FF5A]">
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap'); body{font-family: 'General Sans', system-ui, -apple-system, sans-serif; letter-spacing:-0.01em} img{border-radius: inherit} .rounded-img{border-radius:22px} *{scrollbar-width:thin}`}</style>
      <Navbar onBook={()=>handleBook()} />
      <Hero onBook={()=>handleBook()} />
      <Services services={services} onBookService={handleBook} />
      <About />
      <Doctors doctors={doctors} />
      <Testimonials items={testimonials} />
      <Contact />
      <Footer />
      <BookingModal open={bookOpen} onClose={()=>setBookOpen(false)} initialService={selectedService} doctors={doctors} onSuccess={refetch} />
      {/* floating book button mobile */}
      <button onClick={()=>handleBook()} className="lg:hidden fixed bottom-5 left-5 right-5 z-40 rounded-full bg-[#0B1F18] text-white h-[52px] font-[700] shadow-[0_12px_32px_rgba(0,0,0,0.25)] flex items-center justify-center gap-2">Book appointment <ArrowUpRight className="w-4 h-4"/></button>
    </div>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('liddawi@gmail.com');
  const [password, setPassword] = useState('Liddawi@123');
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<number|null>(null);

  useEffect(()=>{
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setChecking(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess)=>{
      setUser(sess?.user ?? null);
    });
    return ()=>sub.subscription.unsubscribe();
  },[]);

  const fetchAppts = async () => {
    const { data } = await supabase.from('appointments').select('*').order('date', { ascending: true }) || {} as any;
    // fallback fetch via api if direct fails
    try {
      const res = await fetch('/api/appointments');
      const json = await res.json();
      if(Array.isArray(json)) setAppointments(json);
      else if(data) setAppointments(data as any);
    } catch { if(data) setAppointments(data as any); }
  };
  useEffect(()=>{ if(user) fetchAppts(); },[user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginErr(''); setLoginLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if(error) throw error;
      setUser(data.user);
    } catch(err:any){ setLoginErr(err.message); } finally { setLoginLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); navigate('/'); };

  const updateStatus = async (id:number, status:string) => {
    setUpdating(id);
    try {
      await fetch('/api/appointments',{ method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ id, status }) });
      await fetchAppts();
    } finally { setUpdating(null); }
  };
  const deleteAppt = async (id:number) => {
    if(!confirm('Delete appointment?')) return;
    await fetch('/api/appointments',{ method:'DELETE', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ id }) });
    await fetchAppts();
  };

  const filtered = appointments.filter(a=>{
    if(filter!=='all' && a.status!==filter) return false;
    if(search && !`${a.patient_name} ${a.email} ${a.service} ${a.phone}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a=>a.status==='pending').length,
    confirmed: appointments.filter(a=>a.status==='confirmed').length,
    cancelled: appointments.filter(a=>a.status==='cancelled').length,
  };

  if(checking) return <div className="min-h-screen grid place-items-center bg-[#FCFCF7]">Checking session...</div>;

  if(!user) {
    return (
      <div className="min-h-screen bg-[#FCFCF7] flex">
        <div className="flex-1 p-8 lg:p-12 flex flex-col">
          <div className="flex items-center justify-between"><Logo /><a href="/" className="text-[13px] font-semibold underline">← Back to site</a></div>
          <div className="flex-1 grid place-items-center">
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="w-full max-w-[420px] rounded-[28px] bg-white border border-black/10 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <div className="w-12 h-12 rounded-full bg-[#0B1F18] text-white grid place-items-center mb-5"><ShieldCheck className="w-6 h-6"/></div>
              <h1 className="text-[28px] font-[800] tracking-[-0.03em] leading-[0.9]">Doctor portal</h1>
              <p className="mt-2 text-[13px] text-black/60">Use the clinic credentials to view appointments: liddawi@gmail.com</p>
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div><label className="text-[11px] font-bold uppercase tracking-widest text-black/50">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-[14px] border border-black/10 h-11 px-4 text-[14px]" /></div>
                <div><label className="text-[11px] font-bold uppercase tracking-widest text-black/50">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-[14px] border border-black/10 h-11 px-4 text-[14px]" /></div>
                {loginErr && <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-700">{loginErr}</div>}
                <button disabled={loginLoading} className="w-full rounded-full bg-[#0B1F18] text-white h-12 font-[700] disabled:opacity-50">{loginLoading? 'Signing in...' : 'Sign in'}</button>
                <div className="text-[11px] text-black/40 text-center">Demo: liddawi@gmail.com / Liddawi@123</div>
              </form>
            </motion.div>
          </div>
        </div>
        <div className="hidden lg:block w-[44%] bg-[#0B1F18] text-white p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ background:'radial-gradient(600px 400px at 30% 20%, #C6FF5A 0%, transparent 60%)'}} />
          <div className="relative h-full flex flex-col justify-between"><div><Logo light /><div className="mt-12 text-[42px] font-[800] tracking-[-0.04em] leading-[0.9]">Calm practice,<br/>clear schedule.</div><p className="mt-4 text-white/60 text-[14px] max-w-[36ch]">Secure doctor view for all patient requests. Confirm, reschedule, or cancel in one place.</p></div><div className="rounded-[20px] bg-white/10 backdrop-blur p-4 border border-white/10 text-[12px] text-white/70">📍 {fullAddress} • {phone}</div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-[#0B1F18]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-black/10">
        <div className="mx-auto max-w-[1280px] px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-4"><Logo /><span className="hidden sm:inline-flex rounded-full bg-[#C6FF5A] px-3 py-1 text-[11px] font-bold">{user.email}</span></div>
          <div className="flex items-center gap-2"><a href="/" className="rounded-full border border-black/10 px-4 h-9 grid place-items-center text-[13px] font-semibold">View site</a><button onClick={handleLogout} className="rounded-full bg-[#0B1F18] text-white px-4 h-9 flex items-center gap-2 text-[13px] font-semibold"><LogOut className="w-4 h-4"/> Logout</button></div>
        </div>
      </header>
      <div className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div><h1 className="text-[32px] font-[800] tracking-[-0.03em]">Appointments</h1><p className="text-[13px] text-black/60">{stats.total} total • {stats.pending} pending • {stats.confirmed} confirmed • Secure doctor view only</p></div>
          <div className="flex items-center gap-2"><div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/40"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient, email, service..." className="pl-9 pr-4 h-10 rounded-full border border-black/10 bg-white text-[13px] w-[260px]"/></div></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[['All','all',stats.total],['Pending','pending',stats.pending],['Confirmed','confirmed',stats.confirmed],['Cancelled','cancelled',stats.cancelled]].map(([label,key,count] )=>(
            <button key={key} onClick={()=>setFilter(key as string)} className={`rounded-[18px] border p-4 text-left transition ${filter===key ? 'bg-[#0B1F18] text-white border-[#0B1F18]' : 'bg-white border-black/10 hover:border-black/20'}`}><div className="text-[11px] font-bold uppercase tracking-widest opacity-60">{label}</div><div className="mt-1 text-[24px] font-[800]">{count as number}</div></button>
          ))}
        </div>
        <div className="rounded-[24px] bg-white border border-black/10 overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-black/[0.02] text-[11px] uppercase tracking-widest font-bold text-black/50"><tr><th className="text-left px-5 py-3 font-bold">Patient</th><th className="text-left px-5 py-3 font-bold">Service</th><th className="text-left px-5 py-3 font-bold">When</th><th className="text-left px-5 py-3 font-bold">Contact</th><th className="text-left px-5 py-3 font-bold">Status</th><th className="text-right px-5 py-3 font-bold">Actions</th></tr></thead>
              <tbody>
                {filtered.length===0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-black/50">No appointments found.</td></tr> : filtered.map(ap=>(
                  <tr key={ap.id} className="border-t border-black/10 hover:bg-black/[0.02]">
                    <td className="px-5 py-4"><div className="font-[700]">{ap.patient_name}</div><div className="text-[11px] text-black/50">{ap.doctor || 'Any doctor'} • #{ap.id}</div></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-semibold">{ap.service}</span>{ap.notes && <div className="mt-1 text-[11px] text-black/60 max-w-[22ch] truncate">{ap.notes}</div>}</td>
                    <td className="px-5 py-4"><div className="font-medium">{ap.date}</div><div className="text-[12px] text-black/60">{ap.time}</div></td>
                    <td className="px-5 py-4"><div>{ap.email}</div><div className="text-black/60">{ap.phone}</div></td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold capitalize border ${ap.status==='pending' ? 'bg-amber-50 border-amber-200 text-amber-800' : ap.status==='confirmed' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>{ap.status}</span></td>
                    <td className="px-5 py-4 text-right"><div className="inline-flex gap-1.5">
                      <button disabled={updating===ap.id} onClick={()=>updateStatus(ap.id,'confirmed')} className="rounded-full bg-[#0B1F18] text-white px-3 h-7 text-[11px] font-bold disabled:opacity-40">Confirm</button>
                      <button disabled={updating===ap.id} onClick={()=>updateStatus(ap.id,'cancelled')} className="rounded-full border border-black/15 px-3 h-7 text-[11px] font-semibold">Cancel</button>
                      <button onClick={()=>deleteAppt(ap.id)} className="w-7 h-7 rounded-full bg-red-50 border border-red-200 grid place-items-center text-red-600"><Trash2 className="w-4 h-4"/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 rounded-[16px] bg-white border border-black/10 p-4 text-[11px] text-black/50 flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> {address}</span>
          <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> {phone}</span>
          <span>Plus Code: 924G+F7</span>
          <span>• Secure at liddawi@gmail.com (doctor access only)</span>
        </div>
      </div>
    </div>
  );
}


import GithubSync from './components/GithubSync';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/admin" element={<AdminPage/>} />
        <Route path="/github-sync" element={<GithubSync/>} />
      </Routes>
    </BrowserRouter>
  );
}
