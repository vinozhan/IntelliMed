import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSymptoms } from '../../api/aiApi';
import { toast } from 'react-toastify';
import { Brain, AlertTriangle } from 'lucide-react';
import { SEVERITY_COLORS } from '../../utils/constants';

export default function SymptomChecker() {
  const [form, setForm] = useState({ symptoms: '', age: '', gender: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await checkSymptoms({
        ...form,
        age: form.age ? parseInt(form.age) : null,
      });
      setResult(data);
    } catch (err) {
      toast.error('Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Brain className="text-purple-600" size={36} />
        <h1 className="text-3xl font-bold text-gray-800">AI Symptom Checker</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
        <p className="text-sm text-yellow-800">
          This AI tool provides preliminary analysis only. It is NOT a substitute for professional medical advice.
          Always consult a qualified healthcare provider.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Describe your symptoms</label>
          <textarea
            required
            rows="4"
            className="w-full px-4 py-2 border rounded-lg"
            value={form.symptoms}
            onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
            placeholder="e.g., I have a headache, fever, and sore throat for 2 days..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="number" className="w-full px-4 py-2 border rounded-lg" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select className="w-full px-4 py-2 border rounded-lg" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
          {loading ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>
      </form>

      {result && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Analysis Results</h2>
          <div>
            <span className="text-sm font-medium text-gray-600">Severity Level:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${SEVERITY_COLORS[result.severityLevel] || ''}`}>
              {result.severityLevel}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Possible Conditions:</span>
            <ul className="mt-1 list-disc list-inside text-gray-800">
              {result.possibleConditions?.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Recommended Specialty:</span>
            <p className="text-blue-600 font-medium">{result.recommendedSpecialty}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Advice:</span>
            <p className="text-gray-800">{result.advice}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{result.disclaimer}</p>
          </div>
          <button
            onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(result.recommendedSpecialty)}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Find {result.recommendedSpecialty} Doctors
          </button>
        </div>
      )}
    </div>
  );
}
