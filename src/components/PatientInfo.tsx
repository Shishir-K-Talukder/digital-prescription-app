import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface PatientData {
  name: string;
  age: string;
  sex: string;
  mobile: string;
  address: string;
  date: string;
}

interface Props {
  patient: PatientData;
  onChange: (p: PatientData) => void;
}

const PatientInfo = ({ patient, onChange }: Props) => {
  return (
    <div className="bg-section-bg rounded-lg p-4 mb-4 border border-border">
      <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Patient Information
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Patient Name</Label>
          <Input value={patient.name} onChange={(e) => onChange({ ...patient, name: e.target.value })} placeholder="রোগীর নাম" className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Age</Label>
          <Input value={patient.age} onChange={(e) => onChange({ ...patient, age: e.target.value })} placeholder="বয়স" className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Sex</Label>
          <Select value={patient.sex} onValueChange={(v) => onChange({ ...patient, sex: v })}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Mobile</Label>
          <Input value={patient.mobile} onChange={(e) => onChange({ ...patient, mobile: e.target.value })} placeholder="01XXXXXXXXX" className="h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Date</Label>
          <Input type="date" value={patient.date} onChange={(e) => onChange({ ...patient, date: e.target.value })} className="h-8 text-sm" />
        </div>
        <div className="col-span-2 md:col-span-3 lg:col-span-6">
          <Label className="text-xs text-muted-foreground">Address</Label>
          <Input value={patient.address} onChange={(e) => onChange({ ...patient, address: e.target.value })} placeholder="ঠিকানা" className="h-8 text-sm" />
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
