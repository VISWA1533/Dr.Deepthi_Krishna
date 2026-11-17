import { useEffect, useState } from 'react'
import GlowField from './webgl/GlowField'
import {
  profile, stats, chapters, education, rotations, experience, responsibilities,
  research, skills, interests, strengths, achievements, conferences, workshops, references,
} from './data'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useActiveChapter() {
  const [active, setActive] = useState('')
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ;['prologue', ...chapters.map((c) => c.id)].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return { active, progress }
}

function Chapter({ id, num, kicker, title, lead, children }) {
  return (
    <section id={id} className="chapter">
      <header className="chapter-head reveal">
        <span className="chapter-num">Chapter {num}</span>
        <span className="chapter-kicker">{kicker}</span>
        <h2>{title}</h2>
        {lead && <p className="lead">{lead}</p>}
      </header>
      {children}
    </section>
  )
}

const Icon = {
  mail: <svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z M4 7l8 6 8-6" /></svg>,
  phone: <svg viewBox="0 0 24 24"><path d="M6.6 3.5l3 3.2-1.8 2.4a12 12 0 006.1 6.1l2.4-1.8 3.2 3-1.7 3A15.5 15.5 0 013.6 5.2z" /></svg>,
  pin: <svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z M12 12.2a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2z" /></svg>,
  arrow: <svg viewBox="0 0 24 24"><path d="M5 12h14 M13 6l6 6-6 6" /></svg>,
  award: <svg viewBox="0 0 24 24"><path d="M12 15a6 6 0 100-12 6 6 0 000 12z M8.5 13.8L7 21l5-2.6L17 21l-1.5-7.2" /></svg>,
}

export default function App() {
  useReveal()
  const { active, progress } = useActiveChapter()
  const year = new Date().getFullYear()

  // Each story stage has its own palette (see index.css); blue at the start,
  // getting more vibrant chapter by chapter.
  useEffect(() => {
    document.documentElement.dataset.stage = active || 'prologue'
  }, [active])

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="blob b4" />
        <span className="grain" />
      </div>
      <GlowField />

      <nav className="topbar glass">
        <a href="#top" className="brand">
          <span className="brand-mark">DK</span>
          <span className="brand-text">Deepthi Krishna</span>
        </a>
        <div className="topbar-links">
          <a href="#practice">Practice</a>
          <a href="#research">Research</a>
          <a href="#expertise">Expertise</a>
          <a href="#contact" className="pill">Book a consult</a>
        </div>
      </nav>

      <aside className="storyline" aria-label="Chapters">
        <div className="storyline-track"><span style={{ transform: `scaleY(${progress})` }} /></div>
        {chapters.map((c) => (
          <a key={c.id} href={`#${c.id}`} className={active === c.id ? 'on' : ''}>
            <i />
            <span>{c.num} · {c.short}</span>
          </a>
        ))}
      </aside>

      <main id="top">
        {/* ---------- Prologue / hero ---------- */}
        <section id="prologue" className="hero">
          <div className="hero-copy reveal">
            <span className="eyebrow"><span className="dot" /> {profile.title} · {profile.specialty}</span>
            <h1>
              Deepthi Krishna <span className="soft">A.R</span>
              <small>{profile.credentials}</small>
            </h1>
            <p className="tagline">
              Helping people move, heal and return to the life they love — through careful assessment,
              evidence-based rehabilitation and a lot of patience.
            </p>
            <div className="hero-cta">
              <a href="#contact" className="btn primary">Get in touch {Icon.arrow}</a>
              <a href="#foundations" className="btn ghost">Read her story</a>
            </div>
            <div className="hero-meta">
              <span>{Icon.pin} {profile.location}</span>
              <span className="now"><b /> Currently at Malar Multispeciality Hospital</span>
            </div>
          </div>

          <div className="hero-visual reveal">
            <div className="portrait-frame glass" data-gl>
              <div className="monogram" role="img" aria-label="Deepthi Krishna monogram">
                <span className="ring r1" />
                <span className="ring r2" />
                <span className="ring r3" />
                <span className="mono-letters">DK</span>
              </div>
              <div className="portrait-caption glass">
                <strong>{profile.name}</strong>
                <span>{profile.title} · {profile.specialty}</span>
              </div>
            </div>
            <div className="float-card glass f1" data-gl>
              <span className="k">Focus</span>
              <span className="v">Neuro Rehabilitation</span>
            </div>
            <div className="float-card glass f2" data-gl>
              <span className="k">Award</span>
              <span className="v">1st Prize · SYMMETRY 26</span>
            </div>
          </div>
        </section>

        <section className="stats reveal">
          {stats.map((s) => (
            <div key={s.label} className="stat glass" data-gl>
              <span className="stat-value">{s.value}<em>{s.unit}</em></span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </section>

        <section className="about glass reveal" data-gl>
          <span className="chapter-num">Prologue</span>
          <h2>About Deepthi</h2>
          <p>{profile.summary}</p>
          <p className="muted">
            She trained across neurology, orthopaedics, paediatrics, cardio-thoracic, oncology and sports
            rehabilitation, and completed her Master of Physiotherapy in Neurosciences at Sri Ramachandra
            Institute of Higher Education and Research, Chennai.
          </p>
        </section>

        {/* ---------- 01 Foundations ---------- */}
        <Chapter
          id="foundations" num="01" kicker="Where it began" title="Foundations"
          lead="From a school classroom in Kumbakonam to a master’s degree in neurosciences — ten years of steady learning."
        >
          <ol className="timeline">
            {education.map((e, i) => (
              <li key={e.degree} className="reveal" style={{ '--d': `${i * 80}ms` }}>
                <span className="t-year">{e.year}</span>
                <div className="t-card glass" data-gl>
                  <h3>{e.degree}</h3>
                  <p>{e.place}</p>
                  <span className="muted">{e.board}</span>
                </div>
              </li>
            ))}
          </ol>
        </Chapter>

        {/* ---------- 02 Rotations ---------- */}
        <Chapter
          id="rotations" num="02" kicker="Compulsory rotatory residential internship" title="Eight hospitals, eight specialties"
          lead="Before choosing a path, she worked through every major branch of physiotherapy — from intensive cardiac care to a special school for children."
        >
          <div className="rot-grid">
            {rotations.map((r, i) => (
              <article key={r.place} className="rot glass reveal" data-gl style={{ '--d': `${(i % 4) * 70}ms` }}>
                <div className="rot-top">
                  <span className="tag">{r.tag}</span>
                  <span className="days"><b>{r.days}</b> days</span>
                </div>
                <h3>{r.place}</h3>
                {r.city && <span className="muted">{r.city}</span>}
                <p>{r.dept}</p>
                <span className="bar"><span style={{ width: `${(r.days / 31) * 100}%` }} /></span>
              </article>
            ))}
          </div>
        </Chapter>

        {/* ---------- 03 Practice ---------- */}
        <Chapter
          id="practice" num="03" kicker="Clinical experience" title="Into practice"
          lead="Today she consults at Malar Multispeciality Hospital, carrying two years of postgraduate clinical work into everyday patient care."
        >
          <div className="practice">
            <div className="exp-list">
              {experience.map((x, i) => (
                <article key={x.role} className={`exp glass reveal ${x.current ? 'current' : ''}`} data-gl style={{ '--d': `${i * 80}ms` }}>
                  <div>
                    <h3>{x.role}</h3>
                    <p>{x.org}</p>
                  </div>
                  <span className="when">{x.current && <b className="live" />}{x.when}</span>
                </article>
              ))}
            </div>
            <div className="duties glass reveal" data-gl>
              <h3>What her day looks like</h3>
              <ul>
                {responsibilities.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          </div>
        </Chapter>

        {/* ---------- 04 Research ---------- */}
        <Chapter
          id="research" num="04" kicker="Academic projects" title="Asking better questions"
          lead="Her research looks at pain, range of motion and coordination — measurable outcomes that change how patients are treated."
        >
          <div className="research">
            {research.map((r, i) => (
              <article key={r.title} className="paper glass reveal" data-gl style={{ '--d': `${i * 90}ms` }}>
                <span className="paper-no">0{i + 1}</span>
                <span className="tag">{r.kind}</span>
                <h3>{r.title}</h3>
                <span className="muted">{r.area}</span>
              </article>
            ))}
          </div>
        </Chapter>

        {/* ---------- 05 Expertise ---------- */}
        <Chapter
          id="expertise" num="05" kicker="Skills & areas of interest" title="What she brings to the room"
        >
          <div className="interest-grid">
            {interests.map((x, i) => (
              <article key={x.name} className="interest glass reveal" data-gl style={{ '--d': `${i * 70}ms` }}>
                <span className="i-index">{String(i + 1).padStart(2, '0')}</span>
                <h3>{x.name}</h3>
                <p>{x.note}</p>
              </article>
            ))}
          </div>
          <div className="skills-row">
            <div className="glass skills reveal" data-gl>
              <h3>Clinical skills</h3>
              <div className="chips">
                {skills.map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
            </div>
            <div className="glass skills reveal" data-gl>
              <h3>Strengths</h3>
              <ul className="ticks">
                {strengths.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </div>
        </Chapter>

        {/* ---------- 06 Recognition ---------- */}
        <Chapter
          id="growth" num="06" kicker="Achievements, conferences & workshops" title="Always learning"
        >
          <div className="awards">
            {achievements.map((a) => (
              <article key={a.what} className="award glass reveal" data-gl>
                <span className="award-icon">{Icon.award}</span>
                <div>
                  <strong>{a.place}</strong>
                  <p>{a.what}</p>
                  <span className="muted">{a.where}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="learn">
            <div className="glass learn-col reveal" data-gl>
              <h3>Conferences & CME</h3>
              <ul className="dated">
                {conferences.map((c) => <li key={c.name}><span>{c.name}</span><em>{c.year}</em></li>)}
              </ul>
            </div>
            <div className="glass learn-col reveal" data-gl>
              <h3>Workshops</h3>
              <ul className="dated">
                {workshops.map((c) => <li key={c.name}><span>{c.name}</span><em>{c.year}</em></li>)}
              </ul>
            </div>
          </div>
        </Chapter>

        {/* ---------- 07 Contact ---------- */}
        <Chapter id="contact" num="07" kicker="Epilogue" title="Let’s work together">
          <div className="contact glass reveal" data-gl>
            <p className="contact-lead">
              For consultations, rehabilitation enquiries or professional opportunities, reach out directly.
            </p>
            <div className="contact-grid">
              <a href={`mailto:${profile.email}`} className="contact-item">
                <span className="ci-icon">{Icon.mail}</span>
                <span><small>Email</small>{profile.email}</span>
              </a>
              <a href={`tel:${profile.phoneHref}`} className="contact-item">
                <span className="ci-icon">{Icon.phone}</span>
                <span><small>Phone</small>{profile.phone}</span>
              </a>
              <div className="contact-item">
                <span className="ci-icon">{Icon.pin}</span>
                <span><small>Based in</small>{profile.location}</span>
              </div>
            </div>
            <div className="contact-foot">
              <div>
                <small>Languages</small>
                <span>{profile.languages.join(' · ')}</span>
              </div>
              <div className="refs">
                <small>References</small>
                {references.map((r) => (
                  <span key={r.name}><b>{r.name}</b> — {r.role}</span>
                ))}
                <span className="muted">Contact details available on request.</span>
              </div>
            </div>
          </div>
        </Chapter>
      </main>

      <footer className="footer">
        <span>© {year} {profile.name}, {profile.credentials}</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </>
  )
}
