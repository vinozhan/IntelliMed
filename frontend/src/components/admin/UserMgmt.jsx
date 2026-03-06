import { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus } from '../../api/adminApi';
import { toast } from 'react-toastify';
import PageHeader from '../ui/PageHeader';
import DataTable from '../ui/DataTable';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import SearchInput from '../ui/SearchInput';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Users } from 'lucide-react';

export default function UserMgmt() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmState, setConfirmState] = useState({ open: false, id: null, isActive: false });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const { data } = await getAllUsers(); setUsers(data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async () => {
    const { id, isActive } = confirmState;
    try {
      await updateUserStatus(id, !isActive);
      toast.success('User status updated');
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
    finally { setConfirmState({ open: false, id: null, isActive: false }); }
  };

  const filtered = users.filter((u) =>
    !search || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-xs">#{row.id}</span> },
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.firstName} {row.lastName}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (row) => <Badge status={row.role} /> },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} dot /> },
    {
      key: 'actions', label: 'Actions', render: (row) => (
        <Button
          size="sm"
          variant={row.isActive ? 'danger' : 'accent'}
          onClick={(e) => { e.stopPropagation(); setConfirmState({ open: true, id: row.id, isActive: row.isActive }); }}
        >
          {row.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="User Management" subtitle="View and manage platform users" />
      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search users..." className="max-w-sm" />
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No users found"
        emptyIcon={Users}
      />
      <ConfirmDialog
        open={confirmState.open}
        onClose={() => setConfirmState({ open: false, id: null, isActive: false })}
        onConfirm={toggleStatus}
        title={confirmState.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${confirmState.isActive ? 'deactivate' : 'activate'} this user?`}
        confirmLabel={confirmState.isActive ? 'Deactivate' : 'Activate'}
        variant={confirmState.isActive ? 'danger' : 'primary'}
      />
    </div>
  );
}
