import React, { useEffect, useState } from 'react';
import { medicineService, type Medicine } from '@/services/medicineService';
import { DataTable } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { MedicineForm } from '@/features/medicines/MedicineForm';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';

const MedicinesPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const [search, setSearch] = useState('');

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      const response = await medicineService.getAll({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: search,
      });
      setMedicines(response.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.meta?.totalPages || 1,
      }));
    } catch (error) {
      console.error('Failed to fetch medicines', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [pagination.currentPage, search]);

  const handleCreate = () => {
    setSelectedMedicine(null);
    setIsModalOpen(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicineService.delete(id);
        fetchMedicines();
      } catch (error) {
        console.error('Failed to delete medicine', error);
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedMedicine) {
        await medicineService.update(selectedMedicine.id, data);
      } else {
        await medicineService.create(data);
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (error) {
      console.error('Failed to save medicine', error);
    }
  };

  const columns = [
    { header: 'Code', accessor: 'code' as keyof Medicine },
    { header: 'Name', accessor: 'name' as keyof Medicine },
    { header: 'Type', accessor: 'category' as keyof Medicine },
    { header: 'Stock', accessor: (med: Medicine) => `${med.stock} ${med.form}` },
    { header: 'Price', accessor: (med: Medicine) => formatCurrency(med.unitPrice) },
    {
      header: 'Actions',
      accessor: (medicine: Medicine) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(medicine)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(medicine.id)} className="text-red-500 hover:text-red-700">
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
          <h1 className="text-2xl font-bold tracking-tight">Medicines</h1>
          <p className="text-slate-500">Manage your medicine inventory and pricing.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={medicines}
        isLoading={isLoading}
        searchPlaceholder="Search by name or code..."
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
        title={selectedMedicine ? 'Edit Medicine' : 'Add Medicine'}
        description={selectedMedicine ? 'Update medicine details below.' : 'Fill in the details to add a new medicine to inventory.'}
      >
        <MedicineForm
          initialData={selectedMedicine}
          onSubmit={handleSubmit}
        />
      </FormModal>
    </div>
  );
};

export default MedicinesPage;
