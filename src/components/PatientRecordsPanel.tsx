import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePrescriptions, PrescriptionRecord } from "@/hooks/usePrescriptions";
import { Search, User, FileText, Printer, CalendarDays, Phone } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Props {
  onLoadPrescription?: (rx: PrescriptionRecord) => void;
}

const PatientRecordsPanel = ({ onLoadPrescription }: Props) => {
  const { prescriptions, loading } = usePrescriptions();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Group prescriptions by patient (name + mobile)
  const patients = useMemo(() => {
    const map = new Map<string, { name: string; mobile: string; prescriptions: PrescriptionRecord[] }>();
    prescriptions.forEach((rx) => {
      const key = `${rx.patient_data.name || "Unknown"}|${rx.patient_data.mobile || ""}`;
      if (!map.has(key)) {
        map.set(key, { name: rx.patient_data.name || "Unknown", mobile: rx.patient_data.mobile || "", prescriptions: [] });
      }
      map.get(key)!.prescriptions.push(rx);
    });
    return Array.from(map.values()).sort((a, b) => {
      const aDate = a.prescriptions[0]?.created_at || "";
      const bDate = b.prescriptions[0]?.created_at || "";
      return bDate.localeCompare(aDate);
    });
  }, [prescriptions]);

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(q) || p.mobile.includes(q));
  }, [patients, search]);

  const handlePrintRx = (rx: PrescriptionRecord) => {
    // Store print data and open print page
    const printData = {
      doctor: {},
      patient: rx.patient_data,
      clinical: rx.clinical_data,
      medicines: rx.medicines,
      advice: rx.advice,
      printSettings: {},
    };
    sessionStorage.setItem("prescription-print-data", JSON.stringify(printData));
    window.open(`${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, "")}/print`, "_blank");
  };

  if (loading) return <p className="text-sm text-muted-foreground text-center py-6">Loading records...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or mobile..." className="h-9 text-sm pl-8" />
        </div>
        <Badge variant="secondary" className="shrink-0">{patients.length} patients</Badge>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No patient records found</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
          {filtered.map((patient, idx) => (
            <details key={idx} className="section-card group">
              <summary className="p-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-lg list-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{patient.name}</p>
                      {patient.mobile && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {patient.mobile}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    <FileText className="w-2.5 h-2.5 mr-1" /> {patient.prescriptions.length} Rx
                  </Badge>
                </div>
              </summary>
              <div className="px-3 pb-3 space-y-1.5 border-t border-border/50 pt-2">
                {patient.prescriptions.map((rx) => (
                  <div key={rx.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3 h-3 text-muted-foreground" />
                      <span>{format(parseISO(rx.created_at), "dd MMM yyyy")}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{(rx.medicines as any[])?.length || 0} medicines</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {onLoadPrescription && (
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => onLoadPrescription(rx)}>
                          <FileText className="w-3 h-3 mr-1" /> Load
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => handlePrintRx(rx)}>
                        <Printer className="w-3 h-3 mr-1" /> Print
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientRecordsPanel;
