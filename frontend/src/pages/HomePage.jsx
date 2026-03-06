import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useInView from '../hooks/useInView';
import { ArrowRight, Heart, Star, Quote } from 'lucide-react';
import Avatar from '../components/ui/Avatar';

function ScrollReveal({ children, className = '' }) {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
}

const features = [
  {
    title: 'Expert Doctors',
    desc: 'Access verified healthcare professionals across multiple specialties',
    image: '/images/feature-doctors.png',
    color: 'bg-primary-100',
  },
  {
    title: 'Video Consultations',
    desc: 'Consult with doctors from the comfort of your home via secure video calls',
    image: '/images/feature-video.png',
    color: 'bg-accent-100',
  },
  {
    title: 'AI Health Insights',
    desc: 'Get AI-powered symptom analysis and specialist recommendations',
    image: '/images/feature-ai.png',
    color: 'bg-purple-100',
  },
  {
    title: 'Secure Payments',
    desc: 'Pay for consultations securely with encrypted Stripe payments',
    image: '/images/feature-payments.png',
    color: 'bg-warm-100',
  },
];

const steps = [
  { step: '1', title: 'Create Account', desc: 'Sign up as a patient or doctor' },
  { step: '2', title: 'Find a Doctor', desc: 'Search by specialty or name' },
  { step: '3', title: 'Book & Pay', desc: 'Select a time slot and pay securely' },
  { step: '4', title: 'Consult', desc: 'Join video call at appointment time' },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Patient',
    text: 'IntelliMed made it so easy to find a specialist and book a video consultation. The AI symptom checker gave me peace of mind before my appointment.',
    rating: 5,
    avatar: '/images/avatar-patient-1.png',
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Cardiologist',
    text: 'As a doctor, I love how streamlined the platform is. Managing appointments, writing prescriptions, and conducting video calls — all in one place.',
    rating: 5,
    avatar: '/images/avatar-doctor-1.png',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Patient',
    text: 'The video consultation feature is incredible. I consulted with a doctor from my living room and received my prescription within minutes.',
    rating: 5,
    avatar: '/images/avatar-patient-2.png',
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-primary-100 mb-6">
                <Heart size={14} /> AI-Enabled Smart Healthcare Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 leading-tight">
                Your Health,<br />Our Priority
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Book appointments, consult doctors via video, and get AI-powered health insights — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {!user ? (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-primary-700 rounded-xl text-base font-semibold hover:bg-primary-50 active:scale-[0.98] transition-all shadow-lg shadow-primary-900/20"
                    >
                      Get Started <ArrowRight size={18} />
                    </Link>
                    <Link
                      to="/doctors"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-white/30 text-white rounded-xl text-base font-semibold hover:bg-white/10 active:scale-[0.98] transition-all"
                    >
                      Find Doctors
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/doctors"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-primary-700 rounded-xl text-base font-semibold hover:bg-primary-50 active:scale-[0.98] transition-all shadow-lg shadow-primary-900/20"
                    >
                      Book Appointment <ArrowRight size={18} />
                    </Link>
                    <Link
                      to="/symptom-checker"
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-white/30 text-white rounded-xl text-base font-semibold hover:bg-white/10 active:scale-[0.98] transition-all"
                    >
                      AI Symptom Checker
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <img
                src="/images/hero-illustration.png"
                alt="Healthcare platform illustration"
                className="w-full max-w-lg animate-float"
                loading="eager"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface-secondary" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 id="features-heading" className="text-3xl font-bold font-heading text-center text-slate-800 mb-4">
              Why Choose IntelliMed?
            </h2>
            <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
              Everything you need for modern healthcare, powered by technology and trusted by thousands
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {features.map((f, i) => (
              <ScrollReveal key={f.title}>
                <div
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-full h-36 rounded-xl mb-4 overflow-hidden ${f.color} flex items-center justify-center`}>
                    <img
                      src={f.image}
                      alt={f.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold font-heading text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white" aria-labelledby="how-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 id="how-heading" className="text-3xl font-bold font-heading text-center text-slate-800 mb-12">
              How It Works
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <ScrollReveal key={item.step}>
                <div className="text-center" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold font-heading text-primary-600">{item.step}</span>
                  </div>
                  <h3 className="text-base font-semibold font-heading text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-surface-secondary" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 id="testimonials-heading" className="text-3xl font-bold font-heading text-center text-slate-800 mb-4">
              Trusted by Patients & Doctors
            </h2>
            <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
              See what our users have to say about their experience
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name}>
                <div
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full flex flex-col"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Quote size={24} className="text-primary-200 mb-3" />
                  <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-4">{t.text}</p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="fill-warm-400 text-warm-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <Avatar src={t.avatar} name={t.name} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-sm text-slate-400 font-medium mb-6 uppercase tracking-wider">Trusted Technology Partners</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            <svg width="100" height="28" viewBox="0 0 100 28" aria-label="Stripe"><rect width="100" height="28" rx="4" className="fill-slate-300" /><text x="50" y="18" textAnchor="middle" className="fill-white" fontSize="12" fontWeight="600">Stripe</text></svg>
            <svg width="100" height="28" viewBox="0 0 100 28" aria-label="Jitsi"><rect width="100" height="28" rx="4" className="fill-slate-300" /><text x="50" y="18" textAnchor="middle" className="fill-white" fontSize="12" fontWeight="600">Jitsi Meet</text></svg>
            <svg width="100" height="28" viewBox="0 0 100 28" aria-label="OpenAI"><rect width="100" height="28" rx="4" className="fill-slate-300" /><text x="50" y="18" textAnchor="middle" className="fill-white" fontSize="12" fontWeight="600">OpenAI</text></svg>
            <svg width="100" height="28" viewBox="0 0 100 28" aria-label="Spring"><rect width="100" height="28" rx="4" className="fill-slate-300" /><text x="50" y="18" textAnchor="middle" className="fill-white" fontSize="12" fontWeight="600">Spring</text></svg>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <ScrollReveal>
              <h2 className="text-3xl font-bold font-heading text-white mb-4">
                Ready to take control of your health?
              </h2>
              <p className="text-primary-100 text-lg mb-8">
                Join thousands of patients and doctors on IntelliMed
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 rounded-xl text-base font-semibold hover:bg-primary-50 active:scale-[0.98] transition-all shadow-lg shadow-primary-900/20"
              >
                Register Now <ArrowRight size={18} />
              </Link>
            </ScrollReveal>
          </div>
        </section>
      )}
    </div>
  );
}
