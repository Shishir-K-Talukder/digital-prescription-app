import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PrintSettings } from "./PrintPreview";

interface Props {
  settings: PrintSettings;
  onChange: (s: PrintSettings) => void;
}

const PrintSetup = ({ settings, onChange }: Props) => {
  return (
    <div className="bg-section-bg rounded-lg p-4 mb-4 border border-border">
      <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary" />
        Print Page Setup
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Page Size</Label>
          <Select value={settings.pageSize} onValueChange={(v) => onChange({ ...settings, pageSize: v as PrintSettings["pageSize"] })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="A5">A5</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Header Size</Label>
          <Select value={settings.headerSize} onValueChange={(v) => onChange({ ...settings, headerSize: v as PrintSettings["headerSize"] })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2 pb-1">
          <Switch
            checked={settings.showDoctorInfo}
            onCheckedChange={(v) => onChange({ ...settings, showDoctorInfo: v })}
            id="show-doctor"
          />
          <Label htmlFor="show-doctor" className="text-xs text-muted-foreground cursor-pointer">
            Show Doctor Info on Print
          </Label>
        </div>
      </div>
    </div>
  );
};

export default PrintSetup;
