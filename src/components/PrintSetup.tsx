import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Page Size */}
        <div>
          <Label className="text-xs text-muted-foreground">Page Size</Label>
          <Select value={settings.pageSize} onValueChange={(v) => onChange({ ...settings, pageSize: v as PrintSettings["pageSize"] })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4 (210×297mm)</SelectItem>
              <SelectItem value="A5">A5 (148×210mm)</SelectItem>
              <SelectItem value="Letter">Letter (216×279mm)</SelectItem>
              <SelectItem value="Custom">Custom Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom size inputs */}
        {settings.pageSize === "Custom" && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground">Width (mm)</Label>
              <Input
                value={settings.customWidth}
                onChange={(e) => onChange({ ...settings, customWidth: e.target.value })}
                placeholder="210"
                className="h-8 text-xs"
                type="number"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Height (mm)</Label>
              <Input
                value={settings.customHeight}
                onChange={(e) => onChange({ ...settings, customHeight: e.target.value })}
                placeholder="297"
                className="h-8 text-xs"
                type="number"
              />
            </div>
          </>
        )}

        {/* Header Size */}
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
      </div>

      {/* Section visibility toggles */}
      <div className="mt-4 pt-3 border-t border-border">
        <Label className="text-xs text-muted-foreground font-semibold mb-2 block">Show/Hide Sections on Print</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={settings.showDoctorInfo} onCheckedChange={(v) => onChange({ ...settings, showDoctorInfo: v })} id="show-doctor" />
            <Label htmlFor="show-doctor" className="text-xs text-muted-foreground cursor-pointer">Doctor Info</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={settings.showCC} onCheckedChange={(v) => onChange({ ...settings, showCC: v })} id="show-cc" />
            <Label htmlFor="show-cc" className="text-xs text-muted-foreground cursor-pointer">C/C</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={settings.showOE} onCheckedChange={(v) => onChange({ ...settings, showOE: v })} id="show-oe" />
            <Label htmlFor="show-oe" className="text-xs text-muted-foreground cursor-pointer">O/E</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={settings.showDiagnosis} onCheckedChange={(v) => onChange({ ...settings, showDiagnosis: v })} id="show-dx" />
            <Label htmlFor="show-dx" className="text-xs text-muted-foreground cursor-pointer">D/X</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={settings.showInvestigation} onCheckedChange={(v) => onChange({ ...settings, showInvestigation: v })} id="show-inv" />
            <Label htmlFor="show-inv" className="text-xs text-muted-foreground cursor-pointer">Investigation</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSetup;
