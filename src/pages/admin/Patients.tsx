import React, { useEffect, useState } from 'react';
import { patientService, type Patient } from '@/services/patientService';
import { DataTable } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { PatientForm } from '@/features/patients/PatientForm';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await patientService.getAll({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: search,
      });
      setPatients(response.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.meta?.totalPages || 1,
      }));
    } catch (error) {
      console.error('Failed to fetch patients', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [pagination.currentPage, search]);

  const handleCreate = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.delete(id);
        fetchPatients();
      } catch (error) {
        console.error('Failed to delete patient', error);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedPatient) {
        await patientService.update(selectedPatient.id, data);
      } else {
        await patientService.create(data);
      }
      setIsModalOpen(false);
      fetchPatients();
    } catch (error) {
      console.error('Failed to save patient', error);
    }
  };

  const columns = [
    { header: 'NIK', accessor: 'nik' as keyof Patient },
    { header: 'Name', accessor: 'fullName' as keyof Patient },
    { header: 'Gender', accessor: 'gender' as keyof Patient },
    { header: 'Phone', accessor: 'phone' as keyof Patient },
    {
      header: 'Actions',
      accessor: (patient: Patient) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => console.log('View', patient.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(patient)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(patient.id)} className="text-red-500 hover:text-red-700">
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
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-slate-500">Manage your clinic patients and their records.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Register Patient
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={patients}
        isLoading={isLoading}
        searchPlaceholder="Search by name or NIK..."
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
        title={selectedPatient ? 'Edit Patient' : 'Register Patient'}
        description={selectedPatient ? 'Update patient details below.' : 'Fill in the details to register a new patient.'}
      >
        <PatientForm
          initialData={selectedPatient}
          onSubmit={handleSubmit}
        />
      </FormModal>
    </div>
  );
};

export default PatientsPage;
