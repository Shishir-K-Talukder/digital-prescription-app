import { useEffect, useState } from "react";
import PrintPreview, { PrintSettings, defaultPrintSettings } from "@/components/PrintPreview";
import { DoctorInfo } from "@/components/DoctorHeader";
import { PatientData } from "@/components/PatientInfo";
import { ClinicalData, defaultOnExamination } from "@/components/ClinicalSection";
import { Medicine } from "@/components/MedicineSection";
import { AdviceData } from "@/components/AdviceSection";

const PrintPage = () => {
  const [data, setData] = useState<{
    doctor: DoctorInfo;
    patient: PatientData;
    clinical: ClinicalData;
    medicines: Medicine[];
    advice: AdviceData;
    printSettings: PrintSettings;
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("prescription-print-data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData({
          ...parsed,
          printSettings: { ...defaultPrintSettings, ...parsed.printSettings },
        });
      } catch {
        // fallback
      }
    }
  }, []);

  useEffect(() => {
    if (data) {
      // Auto-trigger print after render
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data) {
    return <div className="p-8 text-center text-gray-500">No prescription data found. Please go back and click Print.</div>;
  }

  const { printSettings } = data;
  const pageCSS = printSettings.pageSize === "Custom"
    ? `${printSettings.customWidth}mm ${printSettings.customHeight}mm`
    : printSettings.pageSize;

  return (
    <>
      <style>{`
        @media print {
          @page { size: ${pageCSS} portrait; margin: 10mm; }
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-preview { border: none !important; box-shadow: none !important; max-width: 100% !important; }
        }
        body { background: #f5f5f5; }
      `}</style>
      <div className="no-print py-4 text-center bg-white border-b shadow-sm">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 mr-2"
        >
          🖨️ Print Now
        </button>
        <button
          onClick={() => window.close()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
        >
          ✕ Close
        </button>
      </div>
      <div className="py-6">
        <PrintPreview
          doctor={data.doctor}
          patient={data.patient}
          clinical={data.clinical}
          medicines={data.medicines}
          advice={data.advice}
          printSettings={data.printSettings}
        />
      </div>
    </>
  );
};

export default PrintPage;
