import { useState } from "react";
import { PrescriptionRecord } from "@/hooks/usePrescriptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, FileText, Clock, Search } from "lucide-react";
import { format } from "date-fns";

interface Props {
  prescriptions: PrescriptionRecord[];
  onLoad: (rx: PrescriptionRecord) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

const PrescriptionHistory = ({ prescriptions, onLoad, onDelete, loading }: Props) => {
  const [search, setSearch] = useState("");

  const filtered = prescriptions.filter((rx) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (rx.patient_data.name || "").toLowerCase();
    const mobile = (rx.patient_data.mobile || "").toLowerCase();
    const id = rx.id.toLowerCase();
    return name.includes(q) || mobile.includes(q) || id.includes(q);
  });

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name, mobile, or ID..."
          className="h-9 text-sm pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            {prescriptions.length === 0 ? "No saved prescriptions yet" : "No results found"}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[55vh]">
          <div className="space-y-2 pr-3">
            {filtered.map((rx) => (
              <div
                key={rx.id}
                className="section-card p-3 cursor-pointer hover:border-primary/30 transition-colors group"
                onClick={() => onLoad(rx)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {rx.patient_data.name || "Unnamed Patient"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      {format(new Date(rx.created_at), "dd MMM yyyy, hh:mm a")}
                    </div>
                    {rx.clinical_data.diagnosis && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        Dx: {rx.clinical_data.diagnosis as string}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {(rx.medicines as unknown[]).length} medicine(s)
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDelete(rx.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default PrescriptionHistory;
