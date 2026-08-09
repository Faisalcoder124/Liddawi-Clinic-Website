# Liddawi Clinic — Modern Dental Studio | Kuwait City

Modern, sleek, professional website for Liddawi Clinic with animations, booking flow, and doctor admin portal.

**Live location:** 81 St, Kuwait City 35908, Kuwait — 924G+F7 Kuwait City, Kuwait
**Hours:** Open · Closes 7 PM — Sat-Thu 9am-7pm, Fri Emergency only
**Phone:** +965 500 03073

## Features
- Minimal dental logo (tooth with smile curve) — instantly recognizable as dental
- Rounded corners on all images/cards (rounded-[28px] / rounded-[32px])
- Framer Motion animations — parallax hero, stagger, hover lift, mobile drawer
- Services from Supabase, Doctors, Testimonials
- 3-step booking modal: service → date/time → patient details → Supabase appointments table
- Admin portal at `/admin` — login with `liddawi@gmail.com / Liddawi@123` — view all patient requests, search, filter, confirm/cancel/delete
- Responsive: mobile floating book button, desktop nav

## Tech
Vite + React 19 + TypeScript + Tailwind v4 + framer-motion + lucide-react + react-router-dom + Supabase

## Setup
```bash
npm install
cp .env.example .env
# fill Supabase keys
npm run dev
```

## Env vars needed
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL (same as NEXT_...)
VITE_SUPABASE_ANON_KEY (same as NEXT_...)
```

## Supabase tables
- `appointments` (id, patient_name, email, phone, service, doctor, date, time, notes, status, created_at)
- `doctors` (id, name, specialty, experience, image)
- `services` (id, name, description, price, duration, icon)
- `testimonials` (id, name, text, rating, treatment)

Doctor user: `liddawi@gmail.com / Liddawi@123` created via Supabase Auth.

## Deployment
Vercel — `api/` folder contains serverless Supabase routes: appointments, doctors, services, testimonials. Import from `api/db-client.js`.

## GitHub
This repo is ready to push. See below.
