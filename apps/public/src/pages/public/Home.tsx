import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getProfile, getProjects, trackProjectClick } from '../../api';
import { Profile, Project } from '../../types';
import { PageLoader } from '../../components/ui/Spinner';
import { trackEvent, trackProjectGithubClick, trackProjectDemoClick, trackProjectView } from '../../hooks/useTracker';

const fadeUp = { hidden: { opacity: 0, y: 28 }, show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }) };

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getProjects()])
      .then(([pr, prj]) => { setProfile(pr.data.data); setProjects(prj.data.data.filter((p: Project) => p.featured).slice(0, 3)); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!profile) return null;

  const stats = [
    { value: `${profile.yearsExp}+`, label: 'Years Experience' },
    { value: `${profile.projectCount}+`, label: 'Projects Shipped' },
    { value: `${profile.clientCount}+`, label: 'Happy Clients' },
  ];

  return (
    <>
      <Helmet>
        <title>{profile.name} — {profile.title}</title>
        <meta name="description" content={profile.bioShort} />
      </Helmet>

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)', backgroundSize: '48px 48px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-950" />
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-max relative z-10">
          <div className="max-w-4xl">
            {/* Available badge */}
            {profile.available && (
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Available for new projects
              </motion.div>
            )}

            <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="show" className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
              <span className="gradient-text">Hi, I'm {profile.name.split(' ')[0]}.</span><br />
              <span className="text-slate-400 text-4xl sm:text-5xl lg:text-6xl font-semibold">{profile.title}</span>
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} initial="hidden" animate="show" className="text-slate-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl">
              {profile.bioShort}
            </motion.p>

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="flex flex-wrap gap-4 mb-16">
              <Link to="/services" onClick={() => trackEvent('BUTTON_CLICK', 'hire-me-btn')} className="btn-primary text-base px-8 py-3.5">
                Work With Me
              </Link>
              <Link to="/resume" onClick={() => trackEvent('BUTTON_CLICK', 'view-resume-btn')} className="btn-outline text-base px-8 py-3.5">
                View Resume
              </Link>
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('EXTERNAL_LINK', 'github')} className="btn-ghost text-base px-6 py-3.5">
                  GitHub ↗
                </a>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="flex flex-wrap gap-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-slate-500 text-sm mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-slate-600 text-xs font-mono">scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-5 h-8 rounded-full border border-slate-700 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-accent rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── About / Bio ── */}
      <section className="section border-t border-slate-800/50">
        <div className="container-max grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="section-label mb-4">About Me</p>
            <h2 className="font-display text-4xl font-bold text-white mb-6">Passionate about great software</h2>
            <div className="space-y-4">
              {profile.bio.split('\n\n').map((para, i) => (
                <p key={i} className="text-slate-400 leading-relaxed">{para}</p>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('EXTERNAL_LINK', 'linkedin')} className="btn-outline text-sm px-4 py-2">LinkedIn</a>}
              {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('EXTERNAL_LINK', 'github')} className="btn-ghost text-sm px-4 py-2">GitHub</a>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
            <p className="section-label mb-4">Tech Stack</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {profile.skills.map((skill) => (
                <span key={skill} className="tag">{skill}</span>
              ))}
            </div>
            {profile.location && (
              <div className="card p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-lg">📍</div>
                <div>
                  <p className="text-white font-medium">{profile.location}</p>
                  <p className="text-slate-500 text-sm">Based in</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Featured Projects ── */}
      {projects.length > 0 && (
        <section className="section border-t border-slate-800/50">
          <div className="container-max">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="section-label mb-3">Portfolio</p>
                <h2 className="font-display text-4xl font-bold text-white">Featured Work</h2>
              </div>
              <Link to="/services" className="btn-ghost text-sm hidden sm:flex">See all work →</Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="card-hover p-6 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-display font-bold">
                      {project.title[0]}
                    </div>
                    <div className="flex gap-2">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                          onClick={() => { trackProjectClick(project.id); trackProjectGithubClick(project.id, project.title); }}
                          className="text-slate-500 hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackProjectDemoClick(project.id, project.title)} className="text-slate-500 hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                  <h3
                    className="font-display font-bold text-white mb-2 group-hover:text-accent transition-colors cursor-pointer"
                    onClick={() => trackProjectView(project.id, project.title)}
                  >{project.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.slice(0, 4).map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">{t}</span>)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="section border-t border-slate-800/50">
        <div className="container-max text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl font-bold text-white mb-4">Let's build something great</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Have a project in mind? I'd love to hear about it.</p>
            <Link to="/services" onClick={() => trackEvent('BUTTON_CLICK', 'cta-services')} className="btn-primary text-base px-8 py-3.5">
              View Services & Get in Touch →
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
