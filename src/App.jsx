import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const LogoModel = lazy(() => import('./LogoModel.jsx'))

const navigation = [
  { label: 'Project', href: '#project' },
  { label: 'Trailer', href: '#trailer' },
  { label: 'Studio', href: '#studio' },
  { label: 'Team', href: '#team' },
]

const pillars = [
  {
    number: '01',
    title: 'Narrative first',
    text: 'Every mechanic serves the story. We begin with what a player should feel, then engineer backwards from that emotion.',
  },
  {
    number: '02',
    title: 'No compromise',
    text: 'We protect the detail that makes an experience memorable. Quality, clarity, and conviction shape every decision.',
  },
  {
    number: '03',
    title: 'Cinematic craft',
    text: 'Film, architecture, and sound influence our worlds. Every frame is composed and every beat is given room to land.',
  },
]

const team = [
  {
    initials: 'AK',
    name: 'Aswin Krishna',
    role: 'Founder & Creative Director',
    bio: 'Vision, systems, and the belief that a studio from Kerala can build games the world talks about.',
  },
  {
    initials: 'FJ',
    name: 'Febin Jacob',
    role: 'Co-Founder & Technical Director',
    bio: 'Engineering the technical backbone and the systems that bring each world to life.',
  },
  {
    initials: 'DV',
    name: 'Diljith VS',
    role: 'Co-Founder & Lead Game Designer',
    bio: 'Crafting mechanics that make every moment of play feel intentional, responsive, and alive.',
  },
  {
    initials: 'RR',
    name: 'Renjith R',
    role: 'Co-Founder & Art Director',
    bio: 'Building a visual identity that makes every Frame Drop world unmistakable.',
  },
  {
    initials: 'PB',
    name: 'Pranav B',
    role: 'Co-Founder & Production Lead',
    bio: 'Keeping the machine moving so each project is delivered with precision and purpose.',
  },
]

function ArrowIcon({ down = false }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d={down ? 'M10 3v13m0 0 5-5m-5 5-5-5' : 'M4 16 16 4m0 0H7m9 0v9'} />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="m11 8 13 8-13 8V8Z" />
    </svg>
  )
}

function MenuIcon({ open }) {
  return (
    <span className={`menu-icon ${open ? 'is-open' : ''}`} aria-hidden="true">
      <i />
      <i />
    </span>
  )
}

function Logo({ onClick }) {
  return (
    <a className="logo" href="#top" onClick={onClick} aria-label="Frame Drop Interactive, home">
      <span className="logo-symbol" aria-hidden="true">
        <img src="/brand-mark.png" alt="" />
      </span>
      <span className="logo-type">
        <strong>Framedrop</strong>
        <small>Interactive</small>
      </span>
    </a>
  )
}

function SiteLoader({ phase }) {
  if (phase === 'done') return null

  return (
    <div className={`site-loader ${phase === 'exit' ? 'is-exiting' : ''}`} role="status" aria-live="polite">
      <div className="loader-grid" aria-hidden="true" />
      <div className="loader-orbit" aria-hidden="true"><i /><i /><i /></div>
      <div className="loader-lockup">
        <img src="/brand-lockup.png" alt="Frame Drop Interactive" />
      </div>
      <div className="loader-status">
        <span>Initializing world</span>
        <span>FDI / 2025</span>
      </div>
      <div className="loader-progress" aria-hidden="true"><i /></div>
    </div>
  )
}

function Cursor() {
  const cursorRef = useRef(null)
  const [active, setActive] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    const canUseCursor = window.matchMedia('(pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!canUseCursor) return undefined

    const cursor = cursorRef.current
    let mouseX = -100
    let mouseY = -100
    let cursorX = -100
    let cursorY = -100
    let frameId

    const move = (event) => {
      mouseX = event.clientX
      mouseY = event.clientY
    }

    const render = () => {
      cursorX += (mouseX - cursorX) * 0.18
      cursorY += (mouseY - cursorY) * 0.18
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`
      frameId = requestAnimationFrame(render)
    }

    const targets = document.querySelectorAll('a, button, [data-cursor]')
    const enter = (event) => {
      setActive(true)
      setLabel(event.currentTarget.dataset.cursor || '')
    }
    const leave = () => {
      setActive(false)
      setLabel('')
    }

    document.documentElement.classList.add('has-custom-cursor')
    window.addEventListener('mousemove', move)
    targets.forEach((target) => {
      target.addEventListener('mouseenter', enter)
      target.addEventListener('mouseleave', leave)
    })
    render()

    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(frameId)
      targets.forEach((target) => {
        target.removeEventListener('mouseenter', enter)
        target.removeEventListener('mouseleave', leave)
      })
    }
  }, [])

  return (
    <div ref={cursorRef} className={`cursor ${active ? 'is-active' : ''}`} aria-hidden="true">
      <span>{label}</span>
    </div>
  )
}

function Header({ menuOpen, setMenuOpen, introActive }) {
  const menuButtonRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const restoreFocusRef = useRef(null)
  const wasOpenRef = useRef(false)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    if (!menuOpen) {
      if (wasOpenRef.current) {
        const target = restoreFocusRef.current
        if (target?.isConnected && target.getClientRects().length > 0) target.focus()
        wasOpenRef.current = false
      }
      return undefined
    }

    wasOpenRef.current = true
    restoreFocusRef.current = document.activeElement

    const button = menuButtonRef.current
    const menu = mobileMenuRef.current
    const menuItems = Array.from(menu?.querySelectorAll('a[href], button:not([disabled])') || [])
    const focusableItems = [button, ...menuItems].filter(Boolean)
    const firstItem = focusableItems[0]
    const lastItem = focusableItems[focusableItems.length - 1]
    const focusFrame = requestAnimationFrame(() => button?.focus())

    const trapFocus = (event) => {
      if (event.key !== 'Tab' || focusableItems.length === 0) return
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', trapFocus)
    return () => {
      cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', trapFocus)
    }
  }, [menuOpen])

  return (
    <header
      className="site-header"
      inert={introActive ? true : undefined}
      aria-hidden={introActive ? 'true' : undefined}
    >
      <Logo onClick={closeMenu} />

      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <a href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <a className="header-contact" href="#contact">
        Start a conversation <ArrowIcon />
      </a>

      <button
        ref={menuButtonRef}
        type="button"
        className="menu-toggle"
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <MenuIcon open={menuOpen} />
      </button>

      <div
        ref={mobileMenuRef}
        id="mobile-navigation"
        className={`mobile-menu ${menuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <img className="mobile-menu-mark" src="/brand-mark.png" alt="" aria-hidden="true" />
        <div className="mobile-menu-meta">Wayanad, Kerala / India</div>
        <nav aria-label="Mobile navigation">
          {navigation.map((item, index) => (
            <a href={item.href} key={item.href} onClick={closeMenu}>
              <span>0{index + 1}</span>
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={closeMenu}>
            <span>05</span>
            Contact
          </a>
        </nav>
        <div className="mobile-menu-footer">
          <a href="mailto:framedropinteractive@gmail.com">framedropinteractive@gmail.com</a>
        </div>
      </div>
    </header>
  )
}

function SectionLabel({ index, children }) {
  return (
    <div className="section-label">
      <span>{index}</span>
      <i />
      {children}
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [trailerPlaying, setTrailerPlaying] = useState(false)
  const [introPhase, setIntroPhase] = useState('active')

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const exitDelay = reduceMotion ? 180 : 1800
    const doneDelay = reduceMotion ? 420 : 2500
    document.body.classList.add('intro-running')

    const exitTimer = window.setTimeout(() => setIntroPhase('exit'), exitDelay)
    const doneTimer = window.setTimeout(() => {
      setIntroPhase('done')
      document.body.classList.remove('intro-running')
    }, doneDelay)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(doneTimer)
      document.body.classList.remove('intro-running')
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const parallaxItems = document.querySelectorAll('[data-parallax]')
    let ticking = false

    const updateScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0
      root.style.setProperty('--scroll-y', window.scrollY)
      root.style.setProperty('--scroll-progress', `${progress}%`)
      root.dataset.scrolled = window.scrollY > 28 ? 'true' : 'false'
      if (!reduceMotion) {
        parallaxItems.forEach((item) => {
          const rect = item.getBoundingClientRect()
          const speed = Number(item.dataset.parallax || 0.04)
          const offset = Math.max(-80, Math.min(80, (window.innerHeight * 0.5 - (rect.top + rect.height * 0.5)) * speed))
          item.style.setProperty('--parallax-offset', `${offset.toFixed(2)}px`)
        })
      }
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll)
        ticking = true
      }
    }

    const onPointerMove = (event) => {
      root.style.setProperty('--pointer-x', `${event.clientX}px`)
      root.style.setProperty('--pointer-y', `${event.clientY}px`)
    }

    const revealItems = document.querySelectorAll('[data-reveal]')
    let observer

    if (reduceMotion) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      )
      revealItems.forEach((item) => observer.observe(item))
    }

    updateScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      observer?.disconnect()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  useEffect(() => {
    const closeAtDesktop = () => {
      if (window.innerWidth >= 1101) setMenuOpen(false)
    }

    window.addEventListener('resize', closeAtDesktop)
    return () => window.removeEventListener('resize', closeAtDesktop)
  }, [])

  const introActive = introPhase !== 'done'
  const pageBlocked = menuOpen || introActive

  return (
    <>
      <SiteLoader phase={introPhase} />
      {!introActive && <a className="skip-link" href="#content">Skip to content</a>}
      <div className="scroll-progress" aria-hidden="true" />
      <Cursor />
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} introActive={introActive} />

      <main id="content" inert={pageBlocked ? true : undefined} aria-hidden={pageBlocked ? 'true' : undefined}>
        <section className="hero" id="top">
          <div className="hero-media" aria-hidden="true" />
          <div className="hero-vignette" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-grain" aria-hidden="true" />

          <div className="hero-side-note" aria-hidden="true">
            FDI / 2025
          </div>

          <div className="hero-content page-shell">
            <div className="hero-kicker hero-animate">
              <span className="signal-dot" />
              <span>Independent game studio</span>
              <span className="hero-kicker-divider" />
              <span className="hero-location">Wayanad, Kerala</span>
            </div>

            <h1 className="hero-title" aria-label="Worlds that refuse to be forgotten">
              <span className="hero-line hero-animate">Worlds that</span>
              <span className="hero-line hero-line-offset hero-animate">refuse to be</span>
              <span className="hero-line hero-line-accent hero-animate">forgotten.</span>
            </h1>

            <div className="hero-footer hero-animate">
              <p>
                Story-driven games with raw cinematic vision — built in Kerala,
                felt everywhere.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#project">
                  Explore our world <ArrowIcon down />
                </a>
                <a className="button button-text" href="#trailer">
                  Watch the reveal <span>01:10</span>
                </a>
              </div>
            </div>

            <a className="hero-status hero-animate glass-surface" href="#project">
              <span className="hero-status-index">01</span>
              <span>
                <small>Now building</small>
                Second Breath
              </span>
              <ArrowIcon />
            </a>
          </div>

          <a className="scroll-cue" href="#statement" aria-label="Scroll to studio statement">
            <span>Scroll to enter</span>
            <ArrowIcon down />
          </a>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((group) => (
              <div className="marquee-group" key={group}>
                <span>Second Breath</span><i />
                <span>Narrative First</span><i />
                <span>Frame Drop Interactive</span><i />
                <span>Built in Kerala</span><i />
              </div>
            ))}
          </div>
        </div>

        <section className="statement section page-shell" id="statement">
          <div data-reveal>
            <SectionLabel index="00">The studio</SectionLabel>
          </div>
          <div className="statement-layout">
            <h2 data-reveal>
              We engineer moments that stay with you long after you put the controller down.
            </h2>
            <div className="statement-copy" data-reveal>
              <p>
                Frame Drop Interactive is a lean independent studio bringing a new voice from
                Wayanad to narrative gaming.
              </p>
              <p>
                Tight mechanics. Relentless atmosphere. Characters that breathe. Every pixel is
                a creative decision.
              </p>
              <a className="text-link" href="#studio">
                Inside the studio <ArrowIcon />
              </a>
            </div>
          </div>
          <div className="statement-orbit" aria-hidden="true" data-reveal data-parallax="0.035">
            <span>FD</span>
            <i /><i /><i />
          </div>
        </section>

        <section className="identity-section section" aria-labelledby="identity-title">
          <div className="identity-grid page-shell">
            <div className="identity-copy" data-reveal>
              <SectionLabel index="FDI">Brand artifact</SectionLabel>
              <h2 id="identity-title">Our mark.<br /><em>In motion.</em></h2>
              <p>
                The Frame Drop mark rebuilt as real beveled geometry — reflective, responsive,
                and suspended inside a field of glass.
              </p>
              <div className="identity-specs">
                <span>SVG geometry</span>
                <span>Realtime light</span>
                <span>Move to interact</span>
              </div>
            </div>

            <div className="identity-stage glass-surface" data-reveal data-parallax="0.055">
              <Suspense
                fallback={(
                  <div className="logo-model is-static model-suspense" role="img" aria-label="Frame Drop Interactive mark">
                    <img className="logo-model-fallback" src="/brand-mark.png" alt="" aria-hidden="true" />
                  </div>
                )}
              >
                <LogoModel />
              </Suspense>
              <div className="identity-hud" aria-hidden="true">
                <span>Object / FDI-001</span>
                <span>Realtime render</span>
              </div>
              <div className="identity-corners" aria-hidden="true"><i /><i /><i /><i /></div>
            </div>
          </div>
        </section>

        <section className="trailer-section section" id="trailer">
          <div className="page-shell trailer-heading" data-reveal>
            <div>
              <SectionLabel index="01">Character reveal</SectionLabel>
              <h2>Second<br /><em>Breath.</em></h2>
            </div>
            <p>
              Our first title. A survival story told through one character — and the world that
              tried to break him.
            </p>
          </div>

          <div className="trailer-frame page-shell" data-reveal>
            {trailerPlaying ? (
              <iframe
                src="https://www.youtube.com/embed/HSEq-ouyL78?autoplay=1&rel=0&modestbranding=1&color=white"
                title="Second Breath — Character Reveal Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <button
                className="trailer-poster"
                type="button"
                onClick={() => setTrailerPlaying(true)}
                data-cursor="PLAY"
                aria-label="Play the Second Breath character reveal trailer"
              >
                <img
                  src="https://i.ytimg.com/vi/HSEq-ouyL78/maxresdefault.jpg"
                  alt="Second Breath character reveal trailer"
                />
                <span className="trailer-shade" />
                <span className="trailer-meta trailer-meta-top">Reveal / 001</span>
                <span className="trailer-meta trailer-meta-bottom">Frame Drop Interactive</span>
                <span className="trailer-play">
                  <PlayIcon />
                  <i />
                </span>
              </button>
            )}
          </div>
        </section>

        <section className="project-section section page-shell" id="project">
          <div className="project-heading" data-reveal>
            <SectionLabel index="02">Our project</SectionLabel>
            <h2>One world.<br />No shortcuts.</h2>
          </div>

          <article className="project-card" data-reveal data-parallax="0.018">
            <div className="project-visual">
              <img
                className="project-poster"
                src="/second-breath-poster.jpg"
                alt="Second Breath game poster showing a lone character facing a fog-covered abandoned town"
                loading="lazy"
                decoding="async"
              />
              <div className="project-poster-shade" aria-hidden="true" />
              <div className="project-visual-grid" aria-hidden="true" />
              <span className="project-art-tag" aria-hidden="true">Official key art / 001</span>
              <span className="project-coordinate" aria-hidden="true">Wayanad / Kerala / India</span>
              <span className="project-crosshair" aria-hidden="true"><i /><i /></span>
              <div className="project-scanline" aria-hidden="true" />
            </div>
            <div className="project-content glass-surface">
              <div className="project-status"><i /> In active development</div>
              <div>
                <span className="project-number">Project / 001</span>
                <h3>Second Breath</h3>
                <p>
                  A story-driven survival experience about reclaiming the will to live — told
                  through raw mechanics, haunting environments, and a narrative that does not flinch.
                </p>
              </div>
              <div className="project-details">
                <span>Single player</span>
                <span>Narrative survival</span>
                <span>Release / TBA</span>
              </div>
              <a className="button button-outline" href="#contact">
                Follow the project <ArrowIcon />
              </a>
            </div>
          </article>

          <div className="next-project" data-reveal>
            <span>02</span>
            <p>Future worlds</p>
            <strong>Transmission locked</strong>
            <i aria-hidden="true">••••••••••</i>
          </div>
        </section>

        <section className="studio-section section" id="studio">
          <div className="studio-glow" aria-hidden="true" />
          <div className="page-shell">
            <div className="studio-intro" data-reveal>
              <div>
                <SectionLabel index="03">Built different</SectionLabel>
                <h2>Small team.<br /><em>Unbreakable vision.</em></h2>
              </div>
              <p>
                We are early. We are lean. And we are building something intended to stand
                alongside the greats — one considered frame at a time.
              </p>
            </div>

            <div className="stats glass-surface" data-reveal>
              <div><strong>01</strong><span>Game in development</span></div>
              <div><strong>05</strong><span>Core team members</span></div>
              <div><strong>2025</strong><span>Studio established</span></div>
              <div><strong>∞</strong><span>Stories left to tell</span></div>
            </div>

            <div className="pillars-heading" data-reveal>
              <span>Our code / Three pillars</span>
              <p>The principles behind every world we build.</p>
            </div>

            <div className="pillars">
              {pillars.map((pillar) => (
                <article className="pillar glass-surface" key={pillar.number} data-reveal>
                  <span>{pillar.number}</span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                  <i aria-hidden="true"><ArrowIcon /></i>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="team-section section page-shell" id="team">
          <div className="team-heading" data-reveal>
            <div>
              <SectionLabel index="04">The people</SectionLabel>
              <h2>Five minds.<br /><em>One frame.</em></h2>
            </div>
            <p>
              A focused team across creative direction, technology, design, art, and production.
            </p>
          </div>

          <div className="team-grid">
            {team.map((member, index) => (
              <article className="team-card glass-surface" key={member.name} data-reveal style={{ '--team-index': index }}>
                <div className="team-portrait" aria-hidden="true">
                  <span>{member.initials}</span>
                  <i />
                  <small>FD / 0{index + 1}</small>
                </div>
                <div className="team-card-copy">
                  <span>0{index + 1}</span>
                  <h3>{member.name}</h3>
                  <strong>{member.role}</strong>
                  <p>{member.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section section" id="contact">
          <div className="contact-grid" aria-hidden="true" />
          <div className="contact-watermark" aria-hidden="true">
            <img src="/brand-mark.png" alt="" />
          </div>
          <div className="page-shell contact-inner" data-reveal>
            <SectionLabel index="05">Get in touch</SectionLabel>
            <h2>Let’s build<br /><em>something.</em></h2>
            <div className="contact-bottom">
              <p>
                Press. Collaboration. Joining the studio. Investor conversations. Or simply a
                note to say you believe in what we are building — it all lands here.
              </p>
              <a className="contact-email" href="mailto:framedropinteractive@gmail.com" data-cursor="MAIL">
                <span>framedropinteractive<br className="email-break" />@gmail.com</span>
                <i><ArrowIcon /></i>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" inert={pageBlocked ? true : undefined} aria-hidden={pageBlocked ? 'true' : undefined}>
        <div className="page-shell footer-inner">
          <Logo />
          <div className="footer-socials">
            <a href="https://www.instagram.com/framedropinteractive?igsh=MWwwbGE4YnZ0ZnFtcQ==" target="_blank" rel="noreferrer">
              Instagram <ArrowIcon />
            </a>
            <a href="https://www.linkedin.com/company/framedrop-interactive/" target="_blank" rel="noreferrer">
              LinkedIn <ArrowIcon />
            </a>
          </div>
          <div className="footer-meta">
            <span>© {new Date().getFullYear()} Frame Drop Interactive</span>
            <span>Wayanad, Kerala / India</span>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
