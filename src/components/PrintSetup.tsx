import { useState, useEffect } from "react";
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
  const [local, setLocal] = useState<PrintSettings>(settings);
  const [saved, setSaved] = useState(false);

  // Sync from parent when settings load from DB
  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const handleSave = () => {
    onChange(local);
    setSaved(true);
    toast({ title: "Saved", description: "Print settings saved to database successfully." });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="section-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          Print Page Setup
        </h3>
        <Button size="sm" onClick={handleSave} className="gap-1.5 h-8 text-xs">
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Page Size</Label>
          <Select value={local.pageSize} onValueChange={(v) => setLocal({ ...local, pageSize: v as PrintSettings["pageSize"] })}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4 (210×297mm)</SelectItem>
              <SelectItem value="A5">A5 (148×210mm)</SelectItem>
              <SelectItem value="Letter">Letter (216×279mm)</SelectItem>
              <SelectItem value="Custom">Custom Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {local.pageSize === "Custom" && (
          <>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
              <Input value={local.customWidth} onChange={(e) => setLocal({ ...local, customWidth: e.target.value })} placeholder="210" className="h-9 text-xs" type="number" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
              <Input value={local.customHeight} onChange={(e) => setLocal({ ...local, customHeight: e.target.value })} placeholder="297" className="h-9 text-xs" type="number" />
            </div>
          </>
        )}

        <div>
          <Label className="text-[11px] text-muted-foreground mb-1 block">Header Size</Label>
          <Select value={local.headerSize} onValueChange={(v) => {
            if (v === "custom") {
              setLocal({ ...local, headerSize: "custom" as any, customHeaderHeight: local.customHeaderHeight || "80" });
            } else {
              setLocal({ ...local, headerSize: v as PrintSettings["headerSize"] });
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

        {local.headerSize === "custom" && (
          <>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Header Height (mm)</Label>
              <Input value={local.customHeaderHeight || "25"} onChange={(e) => setLocal({ ...local, customHeaderHeight: e.target.value })} placeholder="25" className="h-9 text-xs" type="number" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1 block">Header Width (mm)</Label>
              <Input value={local.customHeaderWidth || "210"} onChange={(e) => setLocal({ ...local, customHeaderWidth: e.target.value })} placeholder="210" className="h-9 text-xs" type="number" />
            </div>
          </>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Patient Information Box Size</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
            <Input value={local.patientInfoWidth || ""} onChange={(e) => setLocal({ ...local, patientInfoWidth: e.target.value })} placeholder="Full width (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
            <Input value={local.patientInfoHeight || ""} onChange={(e) => setLocal({ ...local, patientInfoHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">Clinical Notes Section Size</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
            <Input value={local.clinicalNotesWidth || ""} onChange={(e) => setLocal({ ...local, clinicalNotesWidth: e.target.value })} placeholder="35% (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
            <Input value={local.clinicalNotesHeight || ""} onChange={(e) => setLocal({ ...local, clinicalNotesHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <Label className="text-[11px] text-muted-foreground font-semibold mb-3 block">℞ Prescription Section Size</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Width (mm)</Label>
            <Input value={local.rxSectionWidth || ""} onChange={(e) => setLocal({ ...local, rxSectionWidth: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Height (mm)</Label>
            <Input value={local.rxSectionHeight || ""} onChange={(e) => setLocal({ ...local, rxSectionHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
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
              <Switch checked={(local as any)[key]} onCheckedChange={(v) => setLocal({ ...local, [key]: v })} id={id} />
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
            <Input value={local.footerHeight || ""} onChange={(e) => setLocal({ ...local, footerHeight: e.target.value })} placeholder="Auto (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Footer Font Size (px)</Label>
            <Input value={local.footerFontSize || ""} onChange={(e) => setLocal({ ...local, footerFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Label className="text-[11px] text-muted-foreground mb-1 block">Custom Footer Text</Label>
            <textarea
              value={local.footerText || ""}
              onChange={(e) => setLocal({ ...local, footerText: e.target.value })}
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
            <Input value={local.patientInfoFontSize || ""} onChange={(e) => setLocal({ ...local, patientInfoFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Clinical Notes Font Size</Label>
            <Input value={local.clinicalNotesFontSize || ""} onChange={(e) => setLocal({ ...local, clinicalNotesFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Prescription (℞) Font Size</Label>
            <Input value={local.prescriptionFontSize || ""} onChange={(e) => setLocal({ ...local, prescriptionFontSize: e.target.value })} placeholder="12 (default)" className="h-9 text-xs" type="number" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSetup;
