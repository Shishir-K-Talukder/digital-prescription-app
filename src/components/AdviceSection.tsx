import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare } from "lucide-react";
import { MedicineOptions } from "./MedicineSettings";

export interface AdviceData {
  advice: string;
  followUpDate: string;
  visitFee?: string;
}

interface Props {
  data: AdviceData;
  onChange: (d: AdviceData) => void;
  options: MedicineOptions;
}

const AdviceSection = ({ data, onChange, options }: Props) => {
  const handleAdviceSelect = (value: string) => {
    if (value === "__custom__") return;
    const current = data.advice;
    const newAdvice = current ? `${current}\n${value}` : value;
    onChange({ ...data, advice: newAdvice });
  };

  const handleFollowUpSelect = (value: string) => {
    if (value === "__custom__") {
      onChange({ ...data, followUpDate: "" });
      return;
    }
    onChange({ ...data, followUpDate: value });
  };

  return (
    <div className="section-card p-5">
      <h3 className="section-header mb-4">
        <div className="section-header-icon flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
        Advice & Follow-up
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-2">
          <Label className="field-label">Quick Advice</Label>
          <Select onValueChange={handleAdviceSelect}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select advice..." /></SelectTrigger>
            <SelectContent>
              {options.adviceList.map((a) => (
                <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>
              ))}
              <SelectItem value="__custom__" className="text-xs font-medium">✏️ Custom Advice</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={data.advice}
            onChange={(e) => onChange({ ...data, advice: e.target.value })}
            placeholder="পরামর্শ লিখুন বা উপর থেকে নির্বাচন করুন..."
            className="text-sm min-h-[60px] resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label className="field-label">Follow-up</Label>
          <Select onValueChange={handleFollowUpSelect}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select follow-up..." /></SelectTrigger>
            <SelectContent>
              {options.followUpOptions.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
              ))}
              <SelectItem value="__custom__" className="text-xs font-medium">✏️ Custom</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={data.followUpDate}
            onChange={(e) => onChange({ ...data, followUpDate: e.target.value })}
            placeholder="কাস্টম ফলো-আপ লিখুন বা উপর থেকে নির্বাচন করুন..."
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="field-label">Visit Fee (৳)</Label>
          <Input
            value={data.visitFee || ""}
            onChange={(e) => onChange({ ...data, visitFee: e.target.value })}
            placeholder="৫০০"
            type="number"
            className="h-8 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">শুধু ড্যাশবোর্ডের হিসাবের জন্য, প্রিন্টে দেখাবে না</p>
        </div>
      </div>
    </div>
  );
};

export default AdviceSection;
