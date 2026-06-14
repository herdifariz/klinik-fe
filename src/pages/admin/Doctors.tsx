import React, { useEffect, useState } from 'react';
import { doctorService, type Doctor } from '@/services/doctorService';
import { userService } from '@/services/userService';
import { DataTable } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { DoctorForm } from '@/features/doctors/DoctorForm';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';

const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableUsers, setAvailableUsers] = useState<{ id: string, name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [doctorsResponse, usersResponse] = await Promise.all([
        doctorService.getAll({
          page: pagination.currentPage,
          limit: pagination.limit,
          search: search,
        }),
        userService.getAll({ role: 'DOCTOR' as any, limit: 100 }) // Fetch doctors to link profiles
      ]);

      setDoctors(doctorsResponse.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: doctorsResponse.meta?.totalPages || 1,
      }));

      // Filter users who don't have a doctor profile yet
      const doctorsList = doctorsResponse.data || [];
      const existingDoctorUserIds = doctorsList.map((d: Doctor) => d.userId);
      const filteredUsers = (usersResponse.data || [])
        .filter((u: any) => !existingDoctorUserIds.includes(u.id))
        .map((u: any) => ({ id: u.id, name: u.fullName }));

      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.currentPage, search]);

  const handleCreate = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedDoctor) {
        await doctorService.update(selectedDoctor.id, data);
      } else {
        await doctorService.create(data);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save doctor', error);
    }
  };

  const columns = [
    { header: 'Name', accessor: (doc: Doctor) => doc.user.name },
    { header: 'Specialty', accessor: 'specialty' as keyof Doctor },
    { header: 'Experience', accessor: (doc: Doctor) => `${doc.experience} Years` },
    { header: 'Email', accessor: (doc: Doctor) => doc.user.email },
    {
      header: 'Actions',
      accessor: (doctor: Doctor) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(doctor)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doctors</h1>
          <p className="text-slate-500">Manage medical staff profiles and specialties.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Profile
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={doctors}
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
        title={selectedDoctor ? 'Edit Doctor Profile' : 'Create Doctor Profile'}
        description={selectedDoctor ? 'Update specialty and experience.' : 'Link a user with role DOCTOR to a medical profile.'}
      >
        <DoctorForm
          initialData={selectedDoctor}
          users={availableUsers}
          onSubmit={handleSubmit}
        />
      </FormModal>
    </div>
  );
};

export default DoctorsPage;
