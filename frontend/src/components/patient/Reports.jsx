import { useState, useEffect } from 'react';
import { getReports, uploadReport } from '../../api/patientApi';
import { formatDateTime } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { Upload, FileText } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await getReports();
      setReports(data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      await uploadReport(formData);
      toast.success('Report uploaded!');
      setDescription('');
      fetchReports();
    } catch (err) {
      toast.error('Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Medical Reports</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload New Report</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Description (optional)"
            className="w-full px-4 py-2 border rounded-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500">
            <Upload size={20} className="text-gray-500" />
            <span className="text-gray-500">{uploading ? 'Uploading...' : 'Choose file to upload'}</span>
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Your Reports</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-500">No reports uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" size={24} />
                  <div>
                    <p className="font-medium">{report.fileName}</p>
                    <p className="text-sm text-gray-500">{report.description}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(report.uploadedAt)}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{report.fileType}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
