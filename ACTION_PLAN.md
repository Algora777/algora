## What the competitors do that Algora didn't
- **Tradetron**: sells a 4-step pipeline (Build → Backtest → Live Offline → Go live), a big trust line ("Tradetron never holds your money"), a strategy marketplace, AI strategy building, "free until you go live" pricing, and a book-a-demo flow.
- **AlgoTest** (YC-backed): leads with proof numbers (backtests run, trades, traders), a product-suite grid, exchange empanelment and ISO 27001 badges, testimonials, an FAQ, and dozens of SEO tool pages (option chains, margin calculator).
- **Streak** is shutting down on 10 Dec 2026, so its Zerodha users are up for grabs. Worth a "Moving from Streak?" landing page.
- **Algora before**: a dashboard of market widgets on the home page, with no story, no proof, no safety message and no FAQ.

## What I changed on the home page
- Dark-first premium theme, glass top bar, Space Grotesk display type
- Hero: animated aurora, perspective grid and a live candlestick field, a rolling gradient headline, glowing CTAs with magnetic hover, and a floating bot console that streams simulated paper trades (clearly labelled as a demo)
- Broker logo marquee, animated stat counters, and a 4-step pipeline with a progress line that animates in
- Bento feature grid with spotlight-border and 3D-tilt cards, and an equity curve that draws itself
- Strategy library: 5 templates, each opening the builder pre-filled
- Compact market-pulse section (TradingView), a safety section, the broker grid, an FAQ and an animated final CTA
- Light theme, mobile layout and reduced-motion all still work, and the Dashboard, Bots and Backtest tabs are untouched

## Actions to make it a fully working platform

### Phase 1: Foundation (weeks 1–3)
1. Move to a real app stack: Next.js (frontend), plus Node/NestJS or Python FastAPI (backend), Postgres, and Redis
2. Auth: email OTP or Google sign-in, mandatory 2FA, and sessions. Swap the "Sign in arrives later" toast for the real thing
3. Move bots, accounts and backtests from localStorage into the database, scoped per user, with an audit log of every action
4. Legal: incorporate, then write the Terms, Privacy Policy (DPDP Act 2023) and Risk Disclosure pages, plus a grievance officer contact
5. Hosting: AWS Mumbai (ap-south-1) for data residency, with CI/CD, staging and prod, Sentry and uptime monitoring

### Phase 2: Broker connectivity (weeks 3–6)
6. Build broker OAuth for Zerodha Kite Connect first, then Upstox, Angel SmartAPI, Dhan and Fyers. Store tokens encrypted (KMS) and re-login daily, since sessions expire every day
7. Compliance route (the key decision): under SEBI's retail algo framework (in force since 1 Apr 2026), API orders need a whitelisted static IP and an exchange algo tag. NSE's 20 Nov 2026 circular says strategies must run on the broker's servers, and that static IPs are only for "tech-savvy" clients who code their own algos. So to offer no-code bots to the public, Algora must **empanel as an Algo Provider with NSE/BSE through partner brokers**. Start this now, because it's the longest lead item. Until then, keep public users on paper mode, and offer live trading only as self-hosted code for tech-savvy users.
8. Unified order adapter: one interface for place, modify, cancel, positions and margins across all brokers

### Phase 3: Engines (weeks 4–10)
9. Market data: a broker WebSocket feed (Kite ticker etc.) or a licensed vendor (TrueData, Global Datafeeds), plus candle aggregation into TimescaleDB
10. Strategy engine: an event-driven worker per bot that implements the 4 templates that aren't built yet (ORB, Gap fade, Monthly option spread, Momentum)
11. Server-side paper trading engine with fills, slippage and charges that feeds the Dashboard KPIs, trades, holdings and P&L bars
12. Backtesting on stored historical data (index, F&O and option premiums, not just delta × points), with slippage, brokerage and STT
13. Risk layer: max loss per day, max orders per second (stay under 10/s), a kill switch, auto square-off at 15:15 NSE and 23:15 MCX, and a holiday calendar

### Phase 4: Product polish (weeks 8–12)
14. Notifications: email and Telegram or WhatsApp alerts on entry, exit, error and daily P&L
15. Billing: Razorpay subscriptions, a free tier (build, backtest, paper), and a paid tier for live trading
16. Onboarding: guided first bot, a "Try a template" one-click paper deploy, and a sample CSV for the backtester
17. Trust: an About page with the team, SEBI/exchange empanelment badges once granted, a status page, and testimonials from beta users
18. SEO: strategy pages, an option-chain page, a margin calculator and a "Streak alternative" page
19. Mobile: PWA first, then React Native apps

### Phase 5: Launch
20. Security review and pentest, rate limiting, and a dependency audit
21. Closed beta with 50 traders in paper mode, then live with one broker, then scale out
22. Don't publish performance or return claims anywhere on marketing pages
