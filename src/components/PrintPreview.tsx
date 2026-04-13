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
  patientInfoWidth?: string;
  patientInfoHeight?: string;
  clinicalNotesWidth?: string;
  clinicalNotesHeight?: string;
  rxSectionWidth?: string;
  rxSectionHeight?: string;
  showDoctorInfo: boolean;
  showDoctorText: boolean;
  showCC: boolean;
  showOE: boolean;
  showInvestigationResults: boolean;
  showDiagnosis: boolean;
  showInvestigation: boolean;
  showFooter: boolean;
  footerHeight?: string;
  footerText?: string;
  footerFontSize?: string;
  patientInfoFontSize?: string;
  clinicalNotesFontSize?: string;
  prescriptionFontSize?: string;
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
  showInvestigationResults: true,
  showDiagnosis: true,
  showInvestigation: true,
  showFooter: true,
  footerHeight: "",
  footerText: "",
  footerFontSize: "12",
  patientInfoFontSize: "12",
  clinicalNotesFontSize: "12",
  prescriptionFontSize: "12",
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

const toBanglaDigits = (str: string): string => {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (d) => banglaDigits[parseInt(d)]);
};

const formatFollowUpBangla = (followUp: string): string => {
  if (!followUp) return "";
  // "X days" format
  const daysMatch = followUp.match(/^(\d+)\s*days?$/i);
  if (daysMatch) {
    return `${toBanglaDigits(daysMatch[1])} দিন পর`;
  }
  // Date format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(followUp)) {
    const [y, m, d] = followUp.split("-");
    return `${toBanglaDigits(d)}/${toBanglaDigits(m)}/${toBanglaDigits(y)}`;
  }
  return toBanglaDigits(followUp);
};

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

  const pageWidthMm = settings.pageSize === "Custom" && settings.customWidth
    ? parseInt(settings.customWidth)
    : settings.pageSize === "A5" ? 148 : settings.pageSize === "Letter" ? 216 : 210;

  const pageHeightMm = settings.pageSize === "Custom" && settings.customHeight
    ? parseInt(settings.customHeight)
    : settings.pageSize === "A5" ? 210 : settings.pageSize === "Letter" ? 279 : 297;

  // Convert mm to px (approx 3.78 px/mm) for on-screen preview
  const MM_TO_PX = 3.78;
  const previewWidthPx = Math.round(pageWidthMm * MM_TO_PX);
  const previewHeightPx = Math.round(pageHeightMm * MM_TO_PX);

  return (
    <div
      className="print-preview bg-white text-black mx-auto border border-border rounded-lg shadow-lg"
      id="prescription-print"
      style={{
        width: `${previewWidthPx}px`,
        height: `${previewHeightPx}px`,
        maxWidth: `${previewWidthPx}px`,
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px',
        overflow: 'hidden',
      }}
    >
      {settings.showDoctorInfo && (
        <div className="text-center border-b-2 border-black pb-3 mb-4 mx-auto w-full" style={{ minHeight: headerHeight, ...(headerWidth ? { maxWidth: headerWidth } : {}) }}>
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

      <div
        className="flex flex-wrap justify-between mb-4 pb-2 border-b border-gray-300"
        style={{
          fontSize: settings.patientInfoFontSize ? `${settings.patientInfoFontSize}px` : '12px',
          ...(settings.patientInfoWidth ? { maxWidth: `${settings.patientInfoWidth}mm` } : {}),
          ...(settings.patientInfoHeight ? { minHeight: `${settings.patientInfoHeight}mm` } : {}),
        }}
      >
        <span><strong>Name :: </strong>{patient.name}</span>
        <span><strong>Age :: </strong>{patient.age}</span>
        <span><strong>Sex :: </strong>{patient.sex}</span>
        <span><strong>Date :: </strong>{patient.date}</span>
      </div>

      {/* Main content area - grows to fill available space */}
      <div className="flex flex-1 min-h-0">
        <div
          className="w-[35%] border-r border-gray-300 pr-4 space-y-4"
          style={{
            fontSize: settings.clinicalNotesFontSize ? `${settings.clinicalNotesFontSize}px` : '12px',
            ...(settings.clinicalNotesWidth ? { width: `${settings.clinicalNotesWidth}mm`, flex: 'none' } : {}),
            ...(settings.clinicalNotesHeight ? { minHeight: `${settings.clinicalNotesHeight}mm` } : {}),
          }}
        >
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
          {(clinical.drugHistory || (clinical as any).drugHistoryMedicines?.length > 0) && (
            <div>
              <p className="font-bold underline">D/H</p>
              {clinical.drugHistory && (
                <p className="whitespace-pre-wrap mt-1">{clinical.drugHistory}</p>
              )}
              {(clinical as any).drugHistoryMedicines?.length > 0 && (
                <ul className="mt-1 space-y-0.5 list-none pl-0">
                  {(clinical as any).drugHistoryMedicines.map((med: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="mt-0.5">•</span>
                      <span>{med}</span>
                    </li>
                  ))}
                </ul>
              )}
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
          {settings.showInvestigationResults && (clinical as any).investigationResults && (
            <div>
              <p className="font-bold underline">Investigation Results (IX)</p>
              <p className="whitespace-pre-wrap mt-1">{(clinical as any).investigationResults}</p>
            </div>
          )}
        </div>

        <div
          className="flex-1 pl-6"
          style={{
            fontSize: settings.prescriptionFontSize ? `${settings.prescriptionFontSize}px` : '12px',
            ...(settings.rxSectionWidth ? { width: `${settings.rxSectionWidth}mm`, flex: 'none' } : {}),
            ...(settings.rxSectionHeight ? { minHeight: `${settings.rxSectionHeight}mm` } : {}),
          }}
        >
          <p className="text-3xl font-serif italic mb-4">℞</p>
          <div className="space-y-4">
            {medicines.map((med) => (
              <div key={med.id}>
                <p className="font-bold uppercase">
                  {(med.formulation || med.type) ? `${med.formulation || med.type}. ` : ""}{med.name}
                </p>
                <p className="text-black mt-0.5">
                  {med.dose} — ({med.mealTiming}){med.duration ? ` — ${med.duration}` : ""}
                </p>
                {med.taperingDoses && med.taperingDoses.length > 0 && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {med.taperingDoses.map((td, i) => (
                      <p key={td.id || i} className="text-black">
                        Then → {td.dose} — {td.duration}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {(advice.advice || advice.followUpDate) && (
            <div className="mt-8 pt-3 border-t border-gray-300 text-xs">
              {advice.advice && (
                <div className="mb-2"><p className="font-bold">Advice:</p><p className="whitespace-pre-wrap">{advice.advice}</p></div>
              )}
              {advice.followUpDate && (
                <p><strong>Follow Up:</strong> {formatFollowUpBangla(advice.followUpDate)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer pinned to bottom */}
      {settings.showFooter && settings.footerText && (
        <div
          className="pt-4 border-t border-gray-300 mt-auto"
          style={settings.footerHeight ? { minHeight: `${settings.footerHeight}mm` } : {}}
        >
          <div
            className="text-center font-bold whitespace-pre-wrap"
            style={{ fontSize: settings.footerFontSize ? `${settings.footerFontSize}px` : '12px' }}
          >
            {settings.footerText}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintPreview;
