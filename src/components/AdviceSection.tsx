import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export interface AdviceData {
  advice: string;
  followUpDate: string;
}

interface Props {
  data: AdviceData;
  onChange: (d: AdviceData) => void;
}

const AdviceSection = ({ data, onChange }: Props) => {
  return (
    <div className="bg-section-bg rounded-lg p-4 mb-4 border border-border">
      <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Advice & Follow-up
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <Label className="text-xs text-muted-foreground">Advice / পরামর্শ</Label>
          <Textarea
            value={data.advice}
            onChange={(e) => onChange({ ...data, advice: e.target.value })}
            placeholder="প্রচুর পানি পান করুন, বিশ্রাম নিন..."
            className="text-sm min-h-[60px] resize-none"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Follow-up Date</Label>
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
