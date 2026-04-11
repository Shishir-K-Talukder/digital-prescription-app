import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export interface AdviceData {
  advice: string;
  followUpDate: string;
}

interface Props {
  data: AdviceData;
  onChange: (d: AdviceData) => void;
}

const COMMON_ADVICE = [
  "প্রচুর পানি পান করুন",
  "বিশ্রাম নিন",
  "তৈলাক্ত খাবার পরিহার করুন",
  "নিয়মিত ব্যায়াম করুন",
  "লবণ কম খান",
  "ধূমপান পরিহার করুন",
  "সময়মতো ওষুধ সেবন করুন",
  "পরবর্তী ভিজিটে রিপোর্ট নিয়ে আসুন",
];

const FOLLOW_UP_OPTIONS = [
  { label: "3 দিন পর", days: 3 },
  { label: "5 দিন পর", days: 5 },
  { label: "7 দিন পর", days: 7 },
  { label: "10 দিন পর", days: 10 },
  { label: "15 দিন পর", days: 15 },
  { label: "1 মাস পর", days: 30 },
  { label: "2 মাস পর", days: 60 },
  { label: "3 মাস পর", days: 90 },
];

const getFollowUpDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const AdviceSection = ({ data, onChange }: Props) => {
  const [customAdvice, setCustomAdvice] = useState(false);

  const handleAdviceSelect = (value: string) => {
    if (value === "__custom__") {
      setCustomAdvice(true);
      return;
    }
    setCustomAdvice(false);
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
    const option = FOLLOW_UP_OPTIONS.find(o => o.days === days);
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
              {COMMON_ADVICE.map((a) => (
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
              {FOLLOW_UP_OPTIONS.map((opt) => (
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
