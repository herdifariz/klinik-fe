import React, { useEffect, useState } from 'react';
import { userService, type User } from '@/services/userService';
import { DataTable } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { UserForm } from '@/features/users/UserForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
// import { useToast } from "@/components/ui/use-toast"; // Add this if you want toast notifications

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAll({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: search,
      });
      setUsers(response.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.meta?.totalPages || 1,
      }));
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, search]);

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.delete(id);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, data);
      } else {
        await userService.create(data);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user', error);
      throw error;
    }
  };

  const columns = [
    { header: 'Name', accessor: 'fullName' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    { 
      header: 'Role', 
      accessor: (user: User) => (
        <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'DOCTOR' ? 'default' : 'secondary'}>
          {user.role}
        </Badge>
      ) 
    },
    {
      header: 'Actions',
      accessor: (user: User) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-slate-500">Manage your clinic users and roles here.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        onSearch={setSearch}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: (page) => setPagination(prev => ({ ...prev, currentPage: page })),
        }}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Edit User' : 'Create User'}
        description={selectedUser ? 'Update user details below.' : 'Fill in the details to create a new user.'}
      >
        <UserForm
          initialData={selectedUser}
          onSubmit={handleSubmit}
        />
      </FormModal>
    </div>
  );
};

export default UsersPage;
