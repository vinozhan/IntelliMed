import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, Calendar, Video, Brain, Shield, Clock } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              AI-Enabled Smart Healthcare Platform. Book appointments, consult doctors via video,
              and get AI-powered health insights - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/doctors"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/10 transition"
                  >
                    Find Doctors
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/doctors"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
                  >
                    Book Appointment
                  </Link>
                  <Link
                    to="/symptom-checker"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/10 transition"
                  >
                    AI Symptom Checker
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose IntelliMed?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <Stethoscope className="text-blue-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Doctors</h3>
              <p className="text-gray-600">
                Access verified healthcare professionals across multiple specialties
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <Video className="text-green-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Video Consultations</h3>
              <p className="text-gray-600">
                Consult with doctors from the comfort of your home via secure video calls
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <Brain className="text-purple-600" size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Health Insights</h3>
              <p className="text-gray-600">
                Get AI-powered symptom analysis and specialist recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up as a patient or doctor', icon: Shield },
              { step: '2', title: 'Find a Doctor', desc: 'Search by specialty or name', icon: Stethoscope },
              { step: '3', title: 'Book & Pay', desc: 'Select a time slot and pay securely', icon: Calendar },
              { step: '4', title: 'Consult', desc: 'Join video call at appointment time', icon: Clock },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-16 bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to take control of your health?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Join thousands of patients and doctors on IntelliMed
            </p>
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition"
            >
              Register Now
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
