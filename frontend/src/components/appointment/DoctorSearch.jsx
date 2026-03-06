import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchDoctors, getSpecialties } from '../../api/doctorApi';
import SearchInput from '../ui/SearchInput';
import Select from '../ui/Select';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import PageHeader from '../ui/PageHeader';
import Avatar from '../ui/Avatar';
import EmptySearch from '../illustrations/EmptySearch';
import { Stethoscope, MapPin, Award, BadgeCheck } from 'lucide-react';

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([searchDoctors({}), getSpecialties()])
      .then(([docsRes, specRes]) => {
        setDoctors(docsRes.data);
        setSpecialties(specRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (searchName, searchSpecialty) => {
    setLoading(true);
    searchDoctors({ specialty: searchSpecialty !== undefined ? searchSpecialty : specialty, name: searchName !== undefined ? searchName : name })
      .then(({ data }) => setDoctors(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSpecialtyChange = (val) => {
    setSpecialty(val);
    handleSearch(name, val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Find a Doctor" subtitle="Browse verified healthcare professionals" />

      <Card className="mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <Select className="md:w-64" value={specialty} onChange={(e) => handleSpecialtyChange(e.target.value)}>
            <option value="">All Specialties</option>
            {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <SearchInput
            value={name}
            onChange={(val) => { setName(val); handleSearch(val); }}
            placeholder="Search by doctor name..."
            className="flex-1"
          />
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : doctors.length === 0 ? (
        <Card>
          <EmptyState illustration={<EmptySearch />} title="No doctors found" description="Try adjusting your search filters" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => (
            <Card key={doc.id} variant="interactive">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={`/images/avatar-doctor-${(doc.id % 8) + 1}.png`}
                    name={`${doc.firstName || 'Dr'} ${doc.lastName || ''}`}
                    size="lg"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Dr. {doc.firstName || 'Doctor'} {doc.lastName || ''}</h3>
                    <p className="text-sm text-primary-600 font-medium">{doc.specialty}</p>
                  </div>
                </div>
                {doc.isVerified && (
                  <Badge color="accent" variant="soft">
                    <BadgeCheck size={12} className="inline -mt-0.5" /> Verified
                  </Badge>
                )}
              </div>
              <div className="space-y-1.5 mb-4">
                {doc.qualification && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Award size={13} /> {doc.qualification}
                  </p>
                )}
                {doc.hospital && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin size={13} /> {doc.hospital}
                  </p>
                )}
                {doc.experienceYears && (
                  <p className="text-xs text-slate-500">{doc.experienceYears} years experience</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-lg font-bold font-mono text-accent-600">${doc.consultationFee}</span>
                <Link to={`/doctors/${doc.id}/book`}>
                  <Button size="sm">Book Now</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
