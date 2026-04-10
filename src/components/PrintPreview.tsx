import { DoctorInfo } from "./DoctorHeader";
import { PatientData } from "./PatientInfo";
import { ClinicalData } from "./ClinicalSection";
import { Medicine } from "./MedicineSection";
import { AdviceData } from "./AdviceSection";

interface Props {
  doctor: DoctorInfo;
  patient: PatientData;
  clinical: ClinicalData;
  medicines: Medicine[];
  advice: AdviceData;
}

const PrintPreview = ({ doctor, patient, clinical, medicines, advice }: Props) => {
  return (
    <div className="print-preview bg-card p-8 max-w-[800px] mx-auto border border-border rounded-lg shadow-sm" id="prescription-print">
      {/* Doctor Header */}
      <div className="text-center border-b-2 border-primary pb-3 mb-4">
        <h1 className="text-xl font-bold text-primary">{doctor.name || "Doctor Name"}</h1>
        <p className="text-xs text-muted-foreground">{doctor.degrees}</p>
        <p className="text-xs font-medium">{doctor.specialization}</p>
        <p className="text-[10px] text-muted-foreground">BMDC Reg. No: {doctor.bmdcNo}</p>
        <p className="text-[10px] text-muted-foreground">{doctor.chamberAddress} {doctor.phone && `| 📞 ${doctor.phone}`}</p>
      </div>

      {/* Patient Info */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-4 pb-2 border-b border-border">
        <span><strong>Patient:</strong> {patient.name}</span>
        <span><strong>Age:</strong> {patient.age}</span>
        <span><strong>Sex:</strong> {patient.sex}</span>
        {patient.mobile && <span><strong>Mobile:</strong> {patient.mobile}</span>}
        <span><strong>Date:</strong> {patient.date}</span>
        {patient.address && <span><strong>Address:</strong> {patient.address}</span>}
      </div>

      {/* Clinical + Rx side by side */}
      <div className="flex gap-6 min-h-[300px]">
        {/* Left: Clinical */}
        <div className="w-[35%] border-r border-border pr-4 space-y-3 text-xs">
          {clinical.chiefComplaint && (
            <div><p className="font-bold text-accent-foreground">C/C:</p><p className="whitespace-pre-wrap">{clinical.chiefComplaint}</p></div>
          )}
          {clinical.onExamination && (
            <div><p className="font-bold text-accent-foreground">O/E:</p><p className="whitespace-pre-wrap">{clinical.onExamination}</p></div>
          )}
          {clinical.diagnosis && (
            <div><p className="font-bold text-accent-foreground">D/X:</p><p className="whitespace-pre-wrap">{clinical.diagnosis}</p></div>
          )}
          {clinical.investigation && (
            <div><p className="font-bold text-accent-foreground">Inv:</p><p className="whitespace-pre-wrap">{clinical.investigation}</p></div>
          )}
        </div>

        {/* Right: Rx */}
        <div className="flex-1">
          <p className="text-3xl font-serif italic text-primary mb-3">℞</p>
          <div className="space-y-2">
            {medicines.map((med, idx) => (
              <div key={med.id} className="text-xs">
                <p className="font-medium">
                  {idx + 1}. {med.type}. {med.name}
                </p>
                <p className="text-muted-foreground pl-4">
                  {med.dose} × {med.duration} — {med.mealTiming}
                </p>
                {med.instructions && <p className="text-muted-foreground pl-4 italic">{med.instructions}</p>}
              </div>
            ))}
          </div>

          {/* Advice */}
          {(advice.advice || advice.followUpDate) && (
            <div className="mt-6 pt-3 border-t border-border text-xs">
              {advice.advice && (
                <div className="mb-2"><p className="font-bold text-accent-foreground">Advice:</p><p className="whitespace-pre-wrap">{advice.advice}</p></div>
              )}
              {advice.followUpDate && (
                <p><strong>Follow-up:</strong> {advice.followUpDate}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Signature */}
      <div className="mt-12 pt-4 border-t border-border flex justify-end">
        <div className="text-center text-xs">
          <div className="w-40 border-b border-foreground mb-1" />
          <p className="font-bold">{doctor.name}</p>
          <p className="text-muted-foreground">{doctor.degrees}</p>
          <p className="text-muted-foreground">BMDC: {doctor.bmdcNo}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
