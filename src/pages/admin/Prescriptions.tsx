import React, { useEffect, useState } from "react";
import {
  prescriptionService,
  type Prescription,
} from "@/services/prescriptionService";
import { DataTable } from "@/components/shared/DataTable";
import { FormModal } from "@/components/shared/FormModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

const PrescriptionsPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setIsLoading(true);
        const response = await prescriptionService.getAll({
          page: currentPage,
          limit: LIMIT,
        });
        setPrescriptions(response.data || []);
        setTotalPages(response.meta?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch prescriptions", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [currentPage]);

  const handleViewDetail = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: Prescription["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Cancelled
          </Badge>
        );
    }
  };

  const columns = [
    {
      header: "Date Issued",
      accessor: (pres: Prescription) => {
        const date = new Date(pres.createdAt);
        return (
          <span className="font-semibold text-slate-800">
            {date.toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      header: "Patient",
      accessor: (pres: Prescription) => (
        <span className="font-semibold">{pres.patient?.name || "N/A"}</span>
      ),
    },
    {
      header: "Doctor",
      accessor: (pres: Prescription) => (
        <span className="font-medium text-slate-700">
          {pres.doctor?.user?.name || "N/A"}
        </span>
      ),
    },
    {
      header: "Validity (Days)",
      accessor: (pres: Prescription) => `${pres.validityDays} Days`,
    },
    {
      header: "Status",
      accessor: (pres: Prescription) => getStatusBadge(pres.status),
    },
    {
      header: "Actions",
      accessor: (pres: Prescription) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(pres)}
        >
          <Eye className="h-4 w-4 mr-1" /> View Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Prescriptions</h1>
        <p className="text-slate-500">
          Track and view doctor's prescriptions issued to patients.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={prescriptions}
        isLoading={isLoading}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          onPageChange: (page) => setCurrentPage(page),
        }}
      />

      {/* Prescription Detail Modal */}
      <FormModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Prescription Detail"
        description="List of medicines and guidelines issued by doctor."
      >
        {selectedPrescription && (
          <div className="space-y-4">
            <div className="border-b pb-3 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedPrescription.patient?.name}
                </h3>
                <p className="text-sm text-slate-500">
                  Issued by: {selectedPrescription.doctor?.user?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {getStatusBadge(selectedPrescription.status)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Validity: {selectedPrescription.validityDays} Days
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                Medicines List
              </span>
              <div className="space-y-2">
                {selectedPrescription.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-md bg-slate-50 space-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800">
                        {item.medicine?.name || "Unknown Medicine"}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-slate-700 bg-white"
                      >
                        Qty: {item.quantity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-500">
                          Dosage:{" "}
                        </span>
                        {item.dosage}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">
                          Freq:{" "}
                        </span>
                        {item.frequency}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">
                          Dur:{" "}
                        </span>
                        {item.duration}
                      </div>
                    </div>
                    {item.instructions && (
                      <div className="text-xs text-slate-600 bg-indigo-50/50 p-1.5 rounded mt-1.5">
                        <span className="font-semibold text-indigo-800">
                          Instructions:{" "}
                        </span>
                        {item.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedPrescription.notes && (
              <div className="border-t pt-3 space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Doctor's Notes
                </span>
                <p className="text-sm text-slate-600 italic">
                  {selectedPrescription.notes}
                </p>
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

export default PrescriptionsPage;
