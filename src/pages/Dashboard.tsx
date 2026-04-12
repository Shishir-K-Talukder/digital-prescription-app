import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useDoctorSettings } from "@/hooks/useDoctorSettings";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import FloatingNav from "@/components/FloatingNav";
import PrintSetup from "@/components/PrintSetup";
import MedicineSettingsPage from "@/components/MedicineSettingsPage";
import AppointmentPanel from "@/components/AppointmentPanel";
import PatientRecordsPanel from "@/components/PatientRecordsPanel";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, FileText, CalendarDays, SlidersHorizontal, Settings, Stethoscope, Home, DollarSign, Plus, Trash2, Building2, Phone, TrendingUp, ClipboardList, FolderOpen } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { AdviceData } from "@/components/AdviceSection";

// --- Types ---
interface HonorariumEntry {
  id: string;
  company: string;
  amount: string;
  month: string;
}

interface OtherVisitEntry {
  id: string;
  date: string;
  description: string;
  amount: string;
  month: string;
}

// --- LocalStorage helpers ---
const HONORARIUM_KEY = "company-honorarium";
const OTHER_VISIT_KEY = "other-visit-income";

const loadFromLS = <T,>(key: string): T[] => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
};

const saveToLS = <T,>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { printSettings, savePrintSettings, medicineOptions, saveMedicineOptions, loading: settingsLoading } = useDoctorSettings();
  const { prescriptions, loading: rxLoading } = usePrescriptions();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  // Honorarium state
  const [honorariums, setHonorariums] = useState<HonorariumEntry[]>(() => loadFromLS(HONORARIUM_KEY));
  const [newCompany, setNewCompany] = useState("");
  const [newHonAmount, setNewHonAmount] = useState("");

  // Other visit (on-call) state
  const [otherVisits, setOtherVisits] = useState<OtherVisitEntry[]>(() => loadFromLS(OTHER_VISIT_KEY));
  const [newVisitDate, setNewVisitDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newVisitDesc, setNewVisitDesc] = useState("");
  const [newVisitAmount, setNewVisitAmount] = useState("");

  // 12 months data
  const monthlyData = useMemo(() => {
    const months: { name: string; month: string; patients: number; visitIncome: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthRx = prescriptions.filter((rx) => {
        const rxDate = new Date(rx.created_at);
        return isWithinInterval(rxDate, { start, end });
      });
      const visitIncome = monthRx.reduce((sum, rx) => {
        const fee = parseFloat((rx.advice as AdviceData)?.visitFee || "0");
        return sum + (isNaN(fee) ? 0 : fee);
      }, 0);
      months.push({
        name: format(date, "MMM yy"),
        month: format(date, "yyyy-MM"),
        patients: monthRx.length,
        visitIncome,
      });
    }
    return months;
  }, [prescriptions]);

  const uniquePatients = useMemo(() => {
    const names = new Set(prescriptions.map((rx) => rx.patient_data.name).filter(Boolean));
    return names.size;
  }, [prescriptions]);

  const thisMonthCount = monthlyData[monthlyData.length - 1]?.patients || 0;

  // Selected month calculations
  const currentMonthData = monthlyData.find(m => m.month === selectedMonth);
  const visitIncome = currentMonthData?.visitIncome || 0;
  const monthHonorariums = honorariums.filter(h => h.month === selectedMonth);
  const totalHonorarium = monthHonorariums.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0);
  const monthOtherVisits = otherVisits.filter(v => v.month === selectedMonth);
  const totalOtherVisit = monthOtherVisits.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);
  const totalIncome = visitIncome + totalHonorarium + totalOtherVisit;

  // Honorarium handlers
  const addHonorarium = () => {
    if (!newCompany.trim() || !newHonAmount.trim()) return;
    const entry: HonorariumEntry = { id: Date.now().toString(), company: newCompany.trim(), amount: newHonAmount.trim(), month: selectedMonth };
    const updated = [...honorariums, entry];
    setHonorariums(updated);
    saveToLS(HONORARIUM_KEY, updated);
    setNewCompany(""); setNewHonAmount("");
  };

  const removeHonorarium = (id: string) => {
    const updated = honorariums.filter(h => h.id !== id);
    setHonorariums(updated);
    saveToLS(HONORARIUM_KEY, updated);
  };

  // Other visit handlers
  const addOtherVisit = () => {
    if (!newVisitAmount.trim()) return;
    const entry: OtherVisitEntry = {
      id: Date.now().toString(),
      date: newVisitDate,
      description: newVisitDesc.trim() || "On-call Visit",
      amount: newVisitAmount.trim(),
      month: selectedMonth,
    };
    const updated = [...otherVisits, entry];
    setOtherVisits(updated);
    saveToLS(OTHER_VISIT_KEY, updated);
    setNewVisitDesc(""); setNewVisitAmount("");
  };

  const removeOtherVisit = (id: string) => {
    const updated = otherVisits.filter(v => v.id !== id);
    setOtherVisits(updated);
    saveToLS(OTHER_VISIT_KEY, updated);
  };

  if (profileLoading || settingsLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <FloatingNav />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-5 w-full grid grid-cols-6 h-11 bg-muted/60 p-1 rounded-xl border border-border shadow-sm">
            <TabsTrigger value="overview" className="gap-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
              <Home className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
              <ClipboardList className="w-3.5 h-3.5" /> Appointments
            </TabsTrigger>
            <TabsTrigger value="records" className="gap-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
              <FolderOpen className="w-3.5 h-3.5" /> Records
            </TabsTrigger>
            <TabsTrigger value="income" className="gap-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
              <DollarSign className="w-3.5 h-3.5" /> Income
            </TabsTrigger>
            <TabsTrigger value="print-setup" className="gap-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Print Setup
            </TabsTrigger>
            <TabsTrigger value="rx-settings" className="gap-1.5 text-xs font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all">
              <Settings className="w-3.5 h-3.5" /> Rx Settings
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="mt-0 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Prescriptions */}
              <div className="section-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="field-label mb-0">Total Prescriptions</p>
                  <p className="text-2xl font-bold text-foreground">{prescriptions.length}</p>
                </div>
              </div>
              {/* Unique Patients */}
              <div className="section-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="field-label mb-0">Unique Patients</p>
                  <p className="text-2xl font-bold text-foreground">{uniquePatients}</p>
                </div>
              </div>
              {/* This Month */}
              <div className="section-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="field-label mb-0">This Month</p>
                  <p className="text-2xl font-bold text-foreground">{thisMonthCount}</p>
                </div>
              </div>
            </div>

            <div className="section-card p-5">
              <h3 className="section-header mb-4">
                <div className="section-header-icon flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                Patients Seen Per Month (12 Months)
              </h3>
              {rxLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          {/* APPOINTMENTS TAB */}
          <TabsContent value="appointments" className="mt-0">
            <div className="section-card p-5">
              <h3 className="section-header mb-4">
                <div className="section-header-icon flex items-center justify-center">
                  <ClipboardList className="w-3.5 h-3.5" />
                </div>
                Patient Appointments
              </h3>
              <AppointmentPanel onStartRx={(patient) => {
                // Store patient info and navigate to Rx write page
                sessionStorage.setItem("appointment-patient", JSON.stringify(patient));
                navigate("/");
              }} />
            </div>
          </TabsContent>

          {/* PATIENT RECORDS TAB */}
          <TabsContent value="records" className="mt-0">
            <div className="section-card p-5">
              <h3 className="section-header mb-4">
                <div className="section-header-icon flex items-center justify-center">
                  <FolderOpen className="w-3.5 h-3.5" />
                </div>
                Patient Records
              </h3>
              <PatientRecordsPanel />
            </div>
          </TabsContent>

          {/* INCOME TAB */}
          <TabsContent value="income" className="mt-0 space-y-5">
            {/* Month selector */}
            <div className="section-card p-4 flex items-center gap-3">
              <Label className="text-sm font-medium whitespace-nowrap">Select Month:</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 text-sm w-48"
              />
            </div>

            {/* Income summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="section-card p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Visit Fee</span>
                </div>
                <p className="text-lg font-bold text-foreground mt-1">৳{visitIncome.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">{currentMonthData?.patients || 0} patients</p>
              </div>
              <div className="section-card p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-accent-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">On-call/Other</span>
                </div>
                <p className="text-lg font-bold text-foreground mt-1">৳{totalOtherVisit.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">{monthOtherVisits.length} visits</p>
              </div>
              <div className="section-card p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Honorarium</span>
                </div>
                <p className="text-lg font-bold text-foreground mt-1">৳{totalHonorarium.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">{monthHonorariums.length} companies</p>
              </div>
              <div className="section-card p-4 flex flex-col gap-1 border-primary/30 bg-primary/5">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Total Income</span>
                </div>
                <p className="text-lg font-bold text-primary mt-1">৳{totalIncome.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Other visit / on-call section */}
              <div className="section-card p-5">
                <h3 className="section-header mb-4">
                  <div className="section-header-icon flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  On-call / Other Visits
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="date"
                        value={newVisitDate}
                        onChange={(e) => setNewVisitDate(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Input
                        value={newVisitDesc}
                        onChange={(e) => setNewVisitDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="h-9 text-sm"
                      />
                      <Input
                        value={newVisitAmount}
                        onChange={(e) => setNewVisitAmount(e.target.value)}
                        placeholder="Amount"
                        type="number"
                        className="h-9 text-sm"
                      />
                    </div>
                    <Button size="sm" className="h-9 gap-1 shrink-0" onClick={addOtherVisit}>
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {monthOtherVisits.length > 0 ? monthOtherVisits.map((v) => (
                      <div key={v.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-1.5 text-xs group border border-transparent hover:border-border transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{v.date}</span>
                          <span className="font-medium text-foreground">{v.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-semibold">৳{parseFloat(v.amount).toLocaleString()}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeOtherVisit(v.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground text-center py-3">No on-call visits this month</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company honorarium section */}
              <div className="section-card p-5">
                <h3 className="section-header mb-4">
                  <div className="section-header-icon flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  Company Honorarium
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="Company name"
                      className="h-9 text-sm flex-1"
                    />
                    <Input
                      value={newHonAmount}
                      onChange={(e) => setNewHonAmount(e.target.value)}
                      placeholder="Amount"
                      type="number"
                      className="h-9 text-sm w-28"
                    />
                    <Button size="sm" className="h-9 gap-1 shrink-0" onClick={addHonorarium}>
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {monthHonorariums.length > 0 ? monthHonorariums.map((h) => (
                      <div key={h.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-1.5 text-xs group border border-transparent hover:border-border transition-colors">
                        <span className="font-medium text-foreground">{h.company}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-semibold">৳{parseFloat(h.amount).toLocaleString()}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => removeHonorarium(h.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground text-center py-3">No honorarium this month</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly income chart */}
            <div className="section-card p-5">
              <h3 className="section-header mb-4">
                <div className="section-header-icon flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                Monthly Visit Income (12 Months)
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, "Visit Income"]} />
                  <Bar dataKey="visitIncome" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="print-setup" className="mt-0">
            <PrintSetup settings={printSettings} onChange={savePrintSettings} />
          </TabsContent>

          <TabsContent value="rx-settings" className="mt-0">
            <MedicineSettingsPage options={medicineOptions} onChange={saveMedicineOptions} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
