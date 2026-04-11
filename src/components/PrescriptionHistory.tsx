import { PrescriptionRecord } from "@/hooks/usePrescriptions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, FileText, Clock } from "lucide-react";
import { format } from "date-fns";

interface Props {
  prescriptions: PrescriptionRecord[];
  onLoad: (rx: PrescriptionRecord) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

const PrescriptionHistory = ({ prescriptions, onLoad, onDelete, loading }: Props) => {
  if (loading) {
    return <div className="text-center py-10 text-muted-foreground text-sm">Loading...</div>;
  }

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-10">
        <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No saved prescriptions yet</p>
        <p className="text-xs text-muted-foreground mt-1">Save a prescription to see it here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[60vh]">
      <div className="space-y-2 pr-3">
        {prescriptions.map((rx) => (
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
  );
};

export default PrescriptionHistory;
