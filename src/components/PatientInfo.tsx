import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "lucide-react";

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
    <div className="section-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <User className="w-4 h-4 text-primary" />
        Patient Information
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="col-span-2">
          <Label className="text-[11px] text-muted-foreground mb-1 block">Patient Name</Label>
          <Input value={patient.name} onChange={(e) => onChange({ ...patient, name: e.target.value })} placeholder="রোগীর নাম" className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Age</Label>
          <Input value={patient.age} onChange={(e) => onChange({ ...patient, age: e.target.value })} placeholder="বয়স" className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Sex</Label>
          <Select value={patient.sex} onValueChange={(v) => onChange({ ...patient, sex: v })}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Mobile</Label>
          <Input value={patient.mobile} onChange={(e) => onChange({ ...patient, mobile: e.target.value })} placeholder="01XXXXXXXXX" className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Date</Label>
          <Input type="date" value={patient.date} onChange={(e) => onChange({ ...patient, date: e.target.value })} className="h-9 text-sm" />
        </div>
        <div className="col-span-2 sm:col-span-3 lg:col-span-6">
          <Label className="text-[11px] text-muted-foreground mb-1 block">Address</Label>
          <Input value={patient.address} onChange={(e) => onChange({ ...patient, address: e.target.value })} placeholder="ঠিকানা" className="h-9 text-sm" />
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
