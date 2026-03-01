import { Link } from 'react-router-dom';
import { Users, UserCheck, CreditCard } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <Users className="text-blue-600 mb-3" size={32} />
          <h3 className="font-semibold text-lg">User Management</h3>
          <p className="text-sm text-gray-500 mt-1">View and manage all users</p>
        </Link>
        <Link to="/admin/doctors/verify" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <UserCheck className="text-green-600 mb-3" size={32} />
          <h3 className="font-semibold text-lg">Doctor Verification</h3>
          <p className="text-sm text-gray-500 mt-1">Verify doctor profiles</p>
        </Link>
        <Link to="/admin/transactions" className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
          <CreditCard className="text-purple-600 mb-3" size={32} />
          <h3 className="font-semibold text-lg">Transactions</h3>
          <p className="text-sm text-gray-500 mt-1">View payment history</p>
        </Link>
      </div>
    </div>
  );
}
