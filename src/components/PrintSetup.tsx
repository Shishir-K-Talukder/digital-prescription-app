import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PrintSettings } from "./PrintPreview";
import { SlidersHorizontal, Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  settings: PrintSettings;
  onChange: (s: PrintSettings) => void;
}

const PrintSetup = ({ settings, onChange }: Props) => {
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onChange(settings);
    setSaved(true);
    toast({ title: "Saved", description: "Print settings saved successfully." });
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <div className="section-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        Print Page Setup
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Page Size</Label>
          <Select value={settings.pageSize} onValueChange={(v) => onChange({ ...settings, pageSize: v as PrintSettings["pageSize"] })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4 (210×297mm)</SelectItem>
              <SelectItem value="A5">A5 (148×210mm)</SelectItem>
              <SelectItem value="Letter">Letter (216×279mm)</SelectItem>
              <SelectItem value="Custom">Custom Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {settings.pageSize === "Custom" && (
          <>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
              <Input value={settings.customWidth} onChange={(e) => onChange({ ...settings, customWidth: e.target.value })} placeholder="210" className="h-9 text-xs" type="number" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
              <Input value={settings.customHeight} onChange={(e) => onChange({ ...settings, customHeight: e.target.value })} placeholder="297" className="h-9 text-xs" type="number" />
            </div>
          </>
        )}

        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Header Size</Label>
          <Select value={settings.headerSize} onValueChange={(v) => {
            if (v === "custom") {
              onChange({ ...settings, headerSize: "custom" as any, customHeaderHeight: settings.customHeaderHeight || "80" });
            } else {
              onChange({ ...settings, headerSize: v as PrintSettings["headerSize"] });
            }
          }}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {settings.headerSize === "custom" && (
          <>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Header Height (mm)</Label>
              <Input value={settings.customHeaderHeight || "25"} onChange={(e) => onChange({ ...settings, customHeaderHeight: e.target.value })} placeholder="25" className="h-9 text-xs" type="number" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Header Width (mm)</Label>
              <Input value={settings.customHeaderWidth || "210"} onChange={(e) => onChange({ ...settings, customHeaderWidth: e.target.value })} placeholder="210" className="h-9 text-xs" type="number" />
            </div>
          </>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Patient Information Box Size</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
            <Input value={settings.patientInfoWidth || ""} onChange={(e) => onChange({ ...settings, patientInfoWidth: e.target.value })} placeholder="Full width (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
            <Input value={settings.patientInfoHeight || ""} onChange={(e) => onChange({ ...settings, patientInfoHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Clinical Notes Section Size</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
            <Input value={settings.clinicalNotesWidth || ""} onChange={(e) => onChange({ ...settings, clinicalNotesWidth: e.target.value })} placeholder="35% (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
            <Input value={settings.clinicalNotesHeight || ""} onChange={(e) => onChange({ ...settings, clinicalNotesHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">℞ Prescription Section Size</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
            <Input value={settings.rxSectionWidth || ""} onChange={(e) => onChange({ ...settings, rxSectionWidth: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
            <Input value={settings.rxSectionHeight || ""} onChange={(e) => onChange({ ...settings, rxSectionHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Show / Hide Sections on Print</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { key: "showDoctorInfo", label: "Header Area", id: "show-doctor" },
            { key: "showDoctorText", label: "Doctor Info Text", id: "show-doctor-text" },
            { key: "showCC", label: "C/C", id: "show-cc" },
            { key: "showOE", label: "O/E", id: "show-oe" },
            { key: "showDiagnosis", label: "D/X", id: "show-dx" },
            { key: "showInvestigation", label: "Investigation", id: "show-inv" },
            { key: "showInvestigationResults", label: "IX Results", id: "show-ix-results" },
            { key: "showFooter", label: "Footer", id: "show-footer" },
          ].map(({ key, label, id }) => (
            <div key={key} className="flex items-center gap-2.5 bg-muted/30 rounded-lg px-3 py-2">
              <Switch checked={(settings as any)[key]} onCheckedChange={(v) => onChange({ ...settings, [key]: v })} id={id} />
              <Label htmlFor={id} className="text-xs text-foreground cursor-pointer">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Footer Customization</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Footer Height (mm)</Label>
            <Input value={settings.footerHeight || ""} onChange={(e) => onChange({ ...settings, footerHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Footer Font Size (px)</Label>
            <Input value={settings.footerFontSize || ""} onChange={(e) => onChange({ ...settings, footerFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Label className="text-[11px] text-muted-foreground mb-1 block">Custom Footer Text</Label>
            <textarea
              value={settings.footerText || ""}
              onChange={(e) => onChange({ ...settings, footerText: e.target.value })}
              placeholder="Leave empty to hide footer content"
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Section Text Sizes (px)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Patient Info Font Size</Label>
            <Input value={settings.patientInfoFontSize || ""} onChange={(e) => onChange({ ...settings, patientInfoFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Clinical Notes Font Size</Label>
            <Input value={settings.clinicalNotesFontSize || ""} onChange={(e) => onChange({ ...settings, clinicalNotesFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Prescription (℞) Font Size</Label>
            <Input value={settings.prescriptionFontSize || ""} onChange={(e) => onChange({ ...settings, prescriptionFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSetup;
