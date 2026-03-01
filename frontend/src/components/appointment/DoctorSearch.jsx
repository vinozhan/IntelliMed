import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchDoctors, getSpecialties } from '../../api/doctorApi';
import { Search, Star } from 'lucide-react';

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [filters, setFilters] = useState({ specialty: '', name: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, specRes] = await Promise.all([
          searchDoctors({}),
          getSpecialties(),
        ]);
        setDoctors(docsRes.data);
        setSpecialties(specRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const { data } = await searchDoctors(filters);
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Find a Doctor</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="flex-1 px-4 py-2 border rounded-lg"
            value={filters.specialty}
            onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
          >
            <option value="">All Specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by name..."
            className="flex-1 px-4 py-2 border rounded-lg"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Search size={18} /> Search
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : doctors.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No doctors found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">Dr. {doc.firstName || 'Doctor'} {doc.lastName || ''}</h3>
                  <p className="text-blue-600">{doc.specialty}</p>
                </div>
                {doc.isVerified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Verified</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-1">{doc.qualification}</p>
              <p className="text-sm text-gray-500 mb-1">{doc.hospital}</p>
              <p className="text-sm text-gray-500 mb-3">{doc.experienceYears} years experience</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-green-600">${doc.consultationFee}</span>
                <Link
                  to={`/doctors/${doc.id}/book`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
