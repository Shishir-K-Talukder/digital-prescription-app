import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DoctorInfo {
  name: string;
  degrees: string;
  specialization: string;
  bmdcNo: string;
  chamberAddress: string;
  phone: string;
}

interface Props {
  doctor: DoctorInfo;
  onChange: (d: DoctorInfo) => void;
  editMode: boolean;
}

const DoctorHeader = ({ doctor, onChange, editMode }: Props) => {
  if (!editMode) {
    return (
      <div className="text-center border-b-2 border-primary pb-4 mb-6">
        <h2 className="text-2xl font-bold text-primary">{doctor.name || "Doctor Name"}</h2>
        <p className="text-sm text-muted-foreground">{doctor.degrees}</p>
        <p className="text-sm font-medium text-foreground">{doctor.specialization}</p>
        <p className="text-xs text-muted-foreground">BMDC Reg. No: {doctor.bmdcNo}</p>
        <p className="text-xs text-muted-foreground">{doctor.chamberAddress}</p>
        {doctor.phone && <p className="text-xs text-muted-foreground">📞 {doctor.phone}</p>}
      </div>
    );
  }

  const fields: { key: keyof DoctorInfo; label: string; placeholder: string }[] = [
    { key: "name", label: "Doctor Name", placeholder: "Dr. Mohammad Rahman" },
    { key: "degrees", label: "Degrees", placeholder: "MBBS, FCPS (Medicine)" },
    { key: "specialization", label: "Specialization", placeholder: "Medicine Specialist" },
    { key: "bmdcNo", label: "BMDC No", placeholder: "A-12345" },
    { key: "chamberAddress", label: "Chamber Address", placeholder: "123 Green Road, Dhaka" },
    { key: "phone", label: "Phone", placeholder: "01XXXXXXXXX" },
  ];

  return (
    <div className="bg-section-bg rounded-lg p-4 mb-6 border border-border">
      <h3 className="text-sm font-semibold text-primary mb-3">Doctor Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="text-xs text-muted-foreground">{f.label}</Label>
            <Input
              value={doctor[f.key]}
              onChange={(e) => onChange({ ...doctor, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="h-8 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorHeader;
