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
  if (!editMode) return null;

  const fields: { key: keyof DoctorInfo; label: string; placeholder: string }[] = [
    { key: "name", label: "Doctor Name", placeholder: "Dr. Mohammad Rahman" },
    { key: "degrees", label: "Degrees", placeholder: "MBBS, FCPS (Medicine)" },
    { key: "specialization", label: "Specialization", placeholder: "Medicine Specialist" },
    { key: "bmdcNo", label: "BMDC No", placeholder: "A-12345" },
    { key: "chamberAddress", label: "Chamber Address", placeholder: "123 Green Road, Dhaka" },
    { key: "phone", label: "Phone", placeholder: "01XXXXXXXXX" },
  ];

  return (
    <div className="section-card p-4 mb-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">Doctor Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="text-[11px] text-muted-foreground mb-1 block">{f.label}</Label>
            <Input
              value={doctor[f.key]}
              onChange={(e) => onChange({ ...doctor, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="h-9 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorHeader;
