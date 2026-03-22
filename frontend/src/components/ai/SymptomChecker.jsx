import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSymptoms, getSymptomHistory } from '../../api/aiApi';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../utils/helpers';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Textarea from '../ui/Textarea';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { SkeletonCard } from '../ui/Skeleton';
import { SEVERITY_COLORS } from '../../utils/constants';
import { Brain, AlertTriangle, RotateCcw, History, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';

export default function SymptomChecker() {
  const [form, setForm] = useState({ symptoms: '', age: '', gender: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSymptomHistory()
      .then(({ data }) => setHistory(data))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await checkSymptoms({
        ...form,
        age: form.age ? parseInt(form.age) : null,
      });
      setResult(data);
      getSymptomHistory().then(({ data: h }) => setHistory(h)).catch(() => {});
    } catch { toast.error('Failed to analyze symptoms'); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    setForm({ symptoms: '', age: '', gender: '' });
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="AI Symptom Checker"
        subtitle="Get AI-powered preliminary health analysis"
        actions={result && <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleReset}>New Check</Button>}
      />

      <Card variant="bordered" className="!bg-warm-50 !border-warm-200 mb-6">
        <div className="flex gap-3">
          <AlertTriangle size={18} className="text-warm-600 shrink-0 mt-0.5" />
          <p className="text-sm text-warm-800">
            This AI tool provides preliminary analysis only. It is NOT a substitute for professional medical advice. Always consult a qualified healthcare provider.
          </p>
        </div>
      </Card>

      {!result && (
        <form onSubmit={handleSubmit}>
          <Card className="space-y-4 mb-6">
            <Textarea
              label="Describe your symptoms"
              required
              rows={4}
              value={form.symptoms}
              onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
              placeholder="e.g., I have a headache, fever, and sore throat for 2 days..."
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="e.g., 30" />
              <Select label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg" icon={Brain}>
              Analyze Symptoms
            </Button>
          </Card>
        </form>
      )}

      {result && (
        <Card className="space-y-5 mb-6 animate-slide-up">
          <h2 className="text-lg font-semibold font-heading text-slate-800">Analysis Results</h2>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Severity:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${SEVERITY_COLORS[result.severityLevel] || 'bg-slate-100 text-slate-600'}`}>
              {result.severityLevel}
            </span>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-600">Possible Conditions:</span>
            <ul className="mt-2 space-y-1">
              {result.possibleConditions?.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> {c}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-600">Recommended Specialty:</span>
            <p className="text-primary-600 font-semibold mt-1">{result.recommendedSpecialty}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-600">Advice:</span>
            <p className="text-sm text-slate-700 mt-1">{result.advice}</p>
          </div>

          {result.disclaimer && (
            <Card variant="bordered" className="!bg-danger-50 !border-danger-200">
              <p className="text-xs text-danger-700">{result.disclaimer}</p>
            </Card>
          )}

          <Button icon={Stethoscope} onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(result.recommendedSpecialty)}`)}>
            Find {result.recommendedSpecialty} Doctors
          </Button>
        </Card>
      )}

      {/* History */}
      <Card>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <History size={18} className="text-slate-500" />
            <h3 className="text-base font-semibold text-slate-800">Previous Checks</h3>
            <Badge color="slate">{history.length}</Badge>
          </div>
          {showHistory ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>

        {showHistory && (
          <div className="mt-4 space-y-3">
            {historyLoading ? (
              <SkeletonCard />
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No previous checks</p>
            ) : (
              history.map((h) => (
                <div key={h.id} className="p-3 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_COLORS[h.severityLevel] || ''}`}>
                      {h.severityLevel}
                    </span>
                    <span className="text-xs text-slate-400">{formatDateTime(h.checkedAt || h.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">{h.symptoms}</p>
                  {h.recommendedSpecialty && <p className="text-xs text-primary-600">{h.recommendedSpecialty}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
