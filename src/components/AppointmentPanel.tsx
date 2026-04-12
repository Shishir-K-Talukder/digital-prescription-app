import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { CalendarDays, Plus, Trash2, CheckCircle, XCircle, Clock, Search, Phone, User, Stethoscope } from "lucide-react";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-accent text-accent-foreground border-accent",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

interface Props {
  onStartRx?: (patient: { name: string; age: string; sex: string; mobile: string }) => void;
}

const AppointmentPanel = ({ onStartRx }: Props) => {
  const { appointments, loading, addAppointment, updateAppointmentStatus, deleteAppointment } = useAppointments();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = appointments;
    if (filter !== "all") list = list.filter((a) => a.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.patient_name.toLowerCase().includes(q) || a.patient_mobile.includes(q));
    }
    return list;
  }, [appointments, filter, search]);

  const todayCount = appointments.filter((a) => isToday(parseISO(a.appointment_date)) && a.status === "scheduled").length;
  const upcomingCount = appointments.filter((a) => !isPast(parseISO(a.appointment_date)) && a.status === "scheduled").length;

  const handleAdd = async () => {
    if (!name.trim() || !date || !time) return;
    await addAppointment({
      patient_name: name.trim(), patient_age: age.trim(), patient_sex: sex,
      patient_mobile: mobile.trim(), appointment_date: date, appointment_time: time, notes: notes.trim(),
    });
    setName(""); setAge(""); setSex(""); setMobile(""); setNotes(""); setShowForm(false);
  };

  const getDateLabel = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "dd MMM yyyy");
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="section-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Today</p>
            <p className="text-xl font-bold text-foreground">{todayCount}</p>
          </div>
        </div>
        <div className="section-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Upcoming</p>
            <p className="text-xl font-bold text-foreground">{upcomingCount}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient..." className="h-9 text-sm pl-8" />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="h-9 gap-1.5" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5" /> New
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="section-card p-4 space-y-3 border-primary/30 bg-primary/5">
          <h4 className="text-sm font-semibold text-foreground">New Appointment</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] text-muted-foreground">Patient Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Patient name" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Age</Label>
              <Input value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 35" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Sex</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Mobile</Label>
              <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile number" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Time *</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." className="h-9 text-sm" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd}>Add Appointment</Button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-6">Loading appointments...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No appointments found</p>
          <p className="text-xs mt-1">Click "New" to schedule one</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {filtered.map((appt) => (
            <div key={appt.id} className="section-card p-3 group hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm text-foreground truncate">{appt.patient_name}</span>
                    {appt.patient_age && <span className="text-xs text-muted-foreground">{appt.patient_age}y</span>}
                    {appt.patient_sex && <span className="text-xs text-muted-foreground">/ {appt.patient_sex}</span>}
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusColors[appt.status]}`}>
                      {appt.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {getDateLabel(appt.appointment_date)} at {appt.appointment_time}
                    </span>
                    {appt.patient_mobile && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {appt.patient_mobile}
                      </span>
                    )}
                  </div>
                  {appt.notes && <p className="text-xs text-muted-foreground mt-1 italic">{appt.notes}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {appt.status === "scheduled" && onStartRx && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] gap-1 px-2"
                      onClick={() => onStartRx({ name: appt.patient_name, age: appt.patient_age, sex: appt.patient_sex, mobile: appt.patient_mobile })}
                      title="Write Rx for this patient"
                    >
                      <Stethoscope className="w-3 h-3" /> Rx
                    </Button>
                  )}
                  {appt.status === "scheduled" && (
                    <>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => updateAppointmentStatus(appt.id, "completed")} title="Mark completed">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => updateAppointmentStatus(appt.id, "cancelled")} title="Cancel">
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => deleteAppointment(appt.id)} title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentPanel;
