import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MedicineOptions } from "./MedicineSettings";

export interface AdviceData {
  advice: string;
  followUpDate: string;
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
    const days = parseInt(value);
    const option = options.followUpOptions.find(o => o.days === days);
    onChange({ ...data, followUpDate: option ? `${option.days} days` : `${days} days` });
  };

  return (
    <div className="bg-section-bg rounded-lg p-4 mb-4 border border-border">
      <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Advice & Follow-up
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs text-muted-foreground">Quick Advice / দ্রুত পরামর্শ</Label>
          <Select onValueChange={handleAdviceSelect}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select advice..." />
            </SelectTrigger>
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
          <Label className="text-xs text-muted-foreground">Follow-up / ফলো-আপ</Label>
          <Select onValueChange={handleFollowUpSelect}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select follow-up..." />
            </SelectTrigger>
            <SelectContent>
              {options.followUpOptions.map((opt) => (
                <SelectItem key={opt.days} value={String(opt.days)} className="text-xs">{opt.label}</SelectItem>
              ))}
              <SelectItem value="__custom__" className="text-xs font-medium">📅 Custom Date</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={data.followUpDate}
            onChange={(e) => onChange({ ...data, followUpDate: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default AdviceSection;
