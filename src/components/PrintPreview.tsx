import { DoctorInfo } from "./DoctorHeader";
import { PatientData } from "./PatientInfo";
import { ClinicalData, OnExaminationData } from "./ClinicalSection";
import { Medicine } from "./MedicineSection";
import { AdviceData } from "./AdviceSection";

export interface PrintSettings {
  pageSize: "A4" | "A5" | "Letter" | "Custom";
  customWidth: string;
  customHeight: string;
  headerSize: "small" | "medium" | "large" | "custom";
  customHeaderHeight?: string;
  customHeaderWidth?: string;
  showDoctorInfo: boolean;
  showDoctorText: boolean;
  showCC: boolean;
  showOE: boolean;
  showDiagnosis: boolean;
  showInvestigation: boolean;
}

export const defaultPrintSettings: PrintSettings = {
  pageSize: "A4",
  customWidth: "210",
  customHeight: "297",
  headerSize: "medium",
  customHeaderHeight: "80",
  showDoctorInfo: true,
  showDoctorText: true,
  showCC: true,
  showOE: true,
  showDiagnosis: true,
  showInvestigation: true,
};

interface Props {
  doctor: DoctorInfo;
  patient: PatientData;
  clinical: ClinicalData;
  medicines: Medicine[];
  advice: AdviceData;
  printSettings: PrintSettings;
}

const OE_LABELS: Record<keyof OnExaminationData, string> = {
  bp: "BP", weight: "Weight", temp: "Temp", pulse: "Pulse",
  heart: "Heart", lungs: "Lungs", abd: "Abd", anaemia: "Anaemia",
  jaundice: "Jaundice", cyanosis: "Cyanosis", oedema: "Oedema",
  rr: "RR", spo2: "SPO2", lmp: "LMP", edd: "EDD",
  fm: "FM", fhr: "FHR", gravida: "GRAVIDA",
};

const headerSizeMap: Record<string, number> = {
  small: 50,
  medium: 70,
  large: 100,
};

const headerTextClass: Record<string, string> = {
  small: "text-base",
  medium: "text-xl",
  large: "text-2xl",
  custom: "text-xl",
};

const isDoctorFilled = (doctor: DoctorInfo) =>
  !!(doctor.name || doctor.degrees || doctor.specialization || doctor.bmdcNo);

const PrintPreview = ({ doctor, patient, clinical, medicines, advice, printSettings }: Props) => {
  const settings = { ...defaultPrintSettings, ...printSettings };

  const filledOE = Object.entries(clinical.onExamination)
    .filter(([_, v]) => v && v !== "Absent" && v.trim() !== "")
    .map(([k, v]) => ({ label: OE_LABELS[k as keyof OnExaminationData], value: v }));

  const doctorHasInfo = isDoctorFilled(doctor);

  const headerHeight = settings.headerSize === "custom"
    ? `${settings.customHeaderHeight || "25"}mm`
    : headerSizeMap[settings.headerSize] || 70;

  const headerWidth = settings.headerSize === "custom" && settings.customHeaderWidth
    ? `${settings.customHeaderWidth}mm`
    : undefined;

  return (
    <div className="print-preview bg-white text-black p-8 max-w-[800px] mx-auto border border-border rounded-lg shadow-sm" id="prescription-print">
      {settings.showDoctorInfo && (
        <div className="text-center border-b-2 border-black pb-3 mb-4 mx-auto" style={{ minHeight: headerHeight, ...(headerWidth ? { maxWidth: headerWidth } : {}) }}>
          {settings.showDoctorText && doctorHasInfo ? (
            <>
              <h1 className={`font-bold ${headerTextClass[settings.headerSize]}`}>{doctor.name}</h1>
              {doctor.degrees && <p className="text-xs text-gray-600">{doctor.degrees}</p>}
              {doctor.specialization && <p className="text-xs font-medium">{doctor.specialization}</p>}
              {doctor.bmdcNo && <p className="text-[10px] text-gray-500">BMDC Reg. No: {doctor.bmdcNo}</p>}
              {(doctor.chamberAddress || doctor.phone) && (
                <p className="text-[10px] text-gray-500">{doctor.chamberAddress} {doctor.phone && `| ☎ ${doctor.phone}`}</p>
              )}
            </>
          ) : null}
        </div>
      )}

      <div className="flex flex-wrap justify-between text-xs mb-4 pb-2 border-b border-gray-300">
        <span><strong>Name :: </strong>{patient.name}</span>
        <span><strong>Age :: </strong>{patient.age}</span>
        <span><strong>Sex :: </strong>{patient.sex}</span>
        <span><strong>Date :: </strong>{patient.date}</span>
      </div>

      <div className="flex min-h-[400px]">
        <div className="w-[35%] border-r border-gray-300 pr-4 space-y-4 text-xs">
          {settings.showCC && clinical.chiefComplaint && (
            <div>
              <p className="font-bold underline">C/C</p>
              <p className="whitespace-pre-wrap mt-1">{clinical.chiefComplaint}</p>
            </div>
          )}
          {settings.showOE && filledOE.length > 0 && (
            <div>
              <p className="font-bold underline">O/E</p>
              <div className="mt-1 space-y-0.5">
                {filledOE.map((item) => (
                  <p key={item.label}>
                    <span className="font-bold">{item.label}</span>
                    <span className="ml-2">: {item.value}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
          {settings.showDiagnosis && clinical.diagnosis && (
            <div>
              <p className="font-bold underline">D/X</p>
              <p className="whitespace-pre-wrap mt-1">{clinical.diagnosis}</p>
            </div>
          )}
          {settings.showInvestigation && clinical.investigation && (
            <div>
              <p className="font-bold underline">Investigation</p>
              <p className="whitespace-pre-wrap mt-1">{clinical.investigation}</p>
            </div>
          )}
        </div>

        <div className="flex-1 pl-6">
          <p className="text-3xl font-serif italic mb-4">℞</p>
          <div className="space-y-4">
            {medicines.map((med) => (
              <div key={med.id} className="text-xs">
                <p className="font-bold uppercase">{med.name}</p>
                <p className="text-gray-600 mt-0.5">
                  {med.dose} — ({med.mealTiming}){med.duration ? ` — ${med.duration}` : ""}
                </p>
              </div>
            ))}
          </div>
          {(advice.advice || advice.followUpDate) && (
            <div className="mt-8 pt-3 border-t border-gray-300 text-xs">
              {advice.advice && (
                <div className="mb-2"><p className="font-bold">Advice:</p><p className="whitespace-pre-wrap">{advice.advice}</p></div>
              )}
              {advice.followUpDate && (
                <p><strong>Follow-up:</strong> {advice.followUpDate}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {settings.showDoctorInfo && doctorHasInfo && (
        <div className="mt-12 pt-4 border-t border-gray-300 flex justify-end">
          <div className="text-center text-xs">
            <div className="w-40 border-b border-black mb-1" />
            <p className="font-bold">{doctor.name}</p>
            {doctor.degrees && <p className="text-gray-500">{doctor.degrees}</p>}
            {doctor.bmdcNo && <p className="text-gray-500">BMDC: {doctor.bmdcNo}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintPreview;
