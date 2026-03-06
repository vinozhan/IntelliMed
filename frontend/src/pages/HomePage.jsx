import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, Calendar, Video, Brain, Shield, Clock, ArrowRight, Heart } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    { icon: Stethoscope, title: 'Expert Doctors', desc: 'Access verified healthcare professionals across multiple specialties', color: 'bg-primary-100 text-primary-600' },
    { icon: Video, title: 'Video Consultations', desc: 'Consult with doctors from the comfort of your home via secure video calls', color: 'bg-accent-100 text-accent-600' },
    { icon: Brain, title: 'AI Health Insights', desc: 'Get AI-powered symptom analysis and specialist recommendations', color: 'bg-purple-100 text-purple-600' },
  ];

  const steps = [
    { step: '1', title: 'Create Account', desc: 'Sign up as a patient or doctor', icon: Shield },
    { step: '2', title: 'Find a Doctor', desc: 'Search by specialty or name', icon: Stethoscope },
    { step: '3', title: 'Book & Pay', desc: 'Select a time slot and pay securely', icon: Calendar },
    { step: '4', title: 'Consult', desc: 'Join video call at appointment time', icon: Clock },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-400/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-primary-100 mb-6">
              <Heart size={14} /> AI-Enabled Smart Healthcare Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 leading-tight">
              Your Health,<br />Our Priority
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
              Book appointments, consult doctors via video, and get AI-powered health insights — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface-secondary" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="features-heading" className="text-3xl font-bold font-heading text-center text-slate-800 mb-12">
            Why Choose IntelliMed?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${f.color.split(' ')[0]}`}>
                  <f.icon size={28} className={f.color.split(' ')[1]} />
                </div>
                <h3 className="text-lg font-semibold font-heading text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white" aria-labelledby="how-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="how-heading" className="text-3xl font-bold font-heading text-center text-slate-800 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <div key={item.step} className="text-center" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold font-heading text-primary-600">{item.step}</span>
                </div>
                <h3 className="text-base font-semibold font-heading text-slate-800 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-4xl mx-auto px-4 text-center">
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
          </div>
        </section>
      )}
    </div>
  );
}
