import { useState, useEffect, useRef } from 'react';
import { getReports, uploadReport } from '../../api/patientApi';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Input from '../ui/Input';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import { FileText, CloudUpload } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try { const { data } = await getReports(); setReports(data); }
    catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large. Maximum 10MB.'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      await uploadReport(formData);
      toast.success('Report uploaded!');
      setDescription('');
      fetchReports();
    } catch { toast.error('Failed to upload report'); }
    finally { setUploading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleUpload(e.dataTransfer.files[0]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Medical Reports" subtitle="Upload and manage your medical documents" />

      <Card className="mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Upload New Report</h2>
        <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="mb-3" />
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center gap-2 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-slate-50'
          }`}
        >
          <CloudUpload size={32} className={dragActive ? 'text-primary-500' : 'text-slate-400'} />
          <p className="text-sm text-slate-600 font-medium">{uploading ? 'Uploading...' : 'Drop a file here or click to browse'}</p>
          <p className="text-xs text-slate-400">PDF, images up to 10MB</p>
          <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} disabled={uploading} />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Your Reports</h2>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
        ) : reports.length === 0 ? (
          <EmptyState icon={FileText} title="No reports uploaded" description="Upload your medical reports for easy access" />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{report.fileName}</p>
                    {report.description && <p className="text-xs text-slate-500">{report.description}</p>}
                    <p className="text-xs text-slate-400">{formatDateTime(report.uploadedAt)}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">{report.fileType}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
