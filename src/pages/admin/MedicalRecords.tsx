import React, { useEffect, useState } from 'react';
import { medicalRecordService, type MedicalRecord } from '@/services/medicalRecordService';
import { DataTable } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';

const MedicalRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await medicalRecordService.getAll({
        page: pagination.currentPage,
        limit: pagination.limit,
      });
      setRecords(response.data || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.meta?.totalPages || 1,
      }));
    } catch (error) {
      console.error('Failed to fetch medical records', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [pagination.currentPage]);

  const handleViewDetail = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  const columns = [
    {
      header: 'Date',
      accessor: (rec: MedicalRecord) => {
        const date = new Date(rec.createdAt);
        return (
          <span className="font-semibold text-slate-800">
            {date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        );
      },
    },
    {
      header: 'Patient',
      accessor: (rec: MedicalRecord) => (
        <div className="flex flex-col">
          <span className="font-semibold">{rec.patient?.name || 'N/A'}</span>
          <span className="text-slate-500 text-xs">NIK: {rec.patient?.nik || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Doctor',
      accessor: (rec: MedicalRecord) => (
        <span className="font-medium text-slate-700">{rec.doctor?.user?.name || 'N/A'}</span>
      ),
    },
    {
      header: 'Diagnosis',
      accessor: 'diagnosis' as keyof MedicalRecord,
    },
    {
      header: 'Actions',
      accessor: (rec: MedicalRecord) => (
        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(rec)}>
          <Eye className="h-4 w-4 mr-1" /> View Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Medical Records</h1>
        <p className="text-slate-500">History of all clinical consultations, diagnoses, and medical actions.</p>
      </div>

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: (page) => setPagination((prev) => ({ ...prev, currentPage: page })),
        }}
      />

      {/* Record Detail Modal */}
      <FormModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Medical Record Detail"
        description="Detailed summary of the patient's consultation."
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="border-b pb-3 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{selectedRecord.patient?.name}</h3>
                <p className="text-sm text-slate-500">NIK: {selectedRecord.patient?.nik}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">Examined By:</p>
                <p className="text-sm font-semibold">{selectedRecord.doctor?.user?.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Diagnosis</span>
              <p className="bg-slate-50 p-2.5 rounded-md border text-slate-800 font-medium">
                {selectedRecord.diagnosis}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Treatment / Action Taken</span>
              <p className="bg-slate-50 p-2.5 rounded-md border text-slate-800">
                {selectedRecord.treatment}
              </p>
            </div>

            {selectedRecord.medications && selectedRecord.medications.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Medications Given</span>
                <ul className="list-disc list-inside bg-slate-50 p-2.5 rounded-md border space-y-1">
                  {selectedRecord.medications.map((med, index) => (
                    <li key={index} className="text-slate-700">{med}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedRecord.investigations && (
              <div className="space-y-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Lab Investigations</span>
                <p className="bg-slate-50 p-2.5 rounded-md border text-slate-700">
                  {selectedRecord.investigations}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Follow-up Required</span>
                <p className="font-semibold text-sm">
                  {selectedRecord.followUpRequired ? 'Yes' : 'No'}
                </p>
              </div>
              {selectedRecord.followUpRequired && selectedRecord.followUpDate && (
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Follow-up Date</span>
                  <p className="font-semibold text-sm text-indigo-600">
                    {new Date(selectedRecord.followUpDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {selectedRecord.notes && (
              <div className="border-t pt-3 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Clinical Notes</span>
                <p className="text-sm text-slate-600 italic">
                  {selectedRecord.notes}
                </p>
              </div>
            )}

            {selectedRecord.documentUrl && (
              <div className="pt-2">
                <a
                  href={selectedRecord.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <FileText className="h-4 w-4 mr-1" /> View Attached Document
                </a>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
};

export default MedicalRecordsPage;
