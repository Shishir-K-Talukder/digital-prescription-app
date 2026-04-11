import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, FileText, CalendarDays, SlidersHorizontal, Settings, Stethoscope, LogOut, User, Home, DollarSign, Plus, Trash2, Building2 } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { AdviceData } from "@/components/AdviceSection";

interface HonorariumEntry {
  id: string;
  company: string;
  amount: string;
  month: string;
}

const HONORARIUM_KEY = "company-honorarium";

const loadHonorarium = (): HonorariumEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(HONORARIUM_KEY) || "[]");
  } catch { return []; }
};

const saveHonorarium = (entries: HonorariumEntry[]) => {
  localStorage.setItem(HONORARIUM_KEY, JSON.stringify(entries));
};

const Dashboard = () => {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { printSettings, savePrintSettings, medicineOptions, saveMedicineOptions, loading: settingsLoading } = useDoctorSettings();
  const { prescriptions, loading: rxLoading } = usePrescriptions();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [honorariums, setHonorariums] = useState<HonorariumEntry[]>(loadHonorarium);
  const [newCompany, setNewCompany] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  const monthlyData = useMemo(() => {
    const months: { name: string; month: string; patients: number; visitIncome: number }[] = [];
    for (let i = 5; i >= 0; i--) {
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
        name: format(date, "MMM yyyy"),
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

  // Current selected month income
  const currentMonthData = monthlyData.find(m => m.month === selectedMonth);
  const visitIncome = currentMonthData?.visitIncome || 0;
  const monthHonorariums = honorariums.filter(h => h.month === selectedMonth);
  const totalHonorarium = monthHonorariums.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0);
  const totalIncome = visitIncome + totalHonorarium;

  const addHonorarium = () => {
    if (!newCompany.trim() || !newAmount.trim()) return;
    const entry: HonorariumEntry = {
      id: Date.now().toString(),
      company: newCompany.trim(),
      amount: newAmount.trim(),
      month: selectedMonth,
    };
    const updated = [...honorariums, entry];
    setHonorariums(updated);
    saveHonorarium(updated);
    setNewCompany("");
    setNewAmount("");
  };

  const removeHonorarium = (id: string) => {
    const updated = honorariums.filter(h => h.id !== id);
    setHonorariums(updated);
    saveHonorarium(updated);
  };

  if (profileLoading || settingsLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <FloatingNav />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-5 bg-card border border-border shadow-sm h-10">
            <TabsTrigger value="overview" className="gap-1.5 text-xs">
              <Home className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="income" className="gap-1.5 text-xs">
              <DollarSign className="w-3.5 h-3.5" /> Income
            </TabsTrigger>
            <TabsTrigger value="print-setup" className="gap-1.5 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Print Setup
            </TabsTrigger>
            <TabsTrigger value="rx-settings" className="gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" /> Rx Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Total Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{prescriptions.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Unique Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{uniquePatients}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" /> This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{thisMonthCount}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Patients Seen Per Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rxLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="mt-0 space-y-5">
            {/* Month selector */}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium">মাস নির্বাচন:</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 text-sm w-48"
              />
            </div>

            {/* Income summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" /> ভিজিট ফি আয়
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">৳{visitIncome.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {currentMonthData?.patients || 0} জন রোগী
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> কোম্পানি অনারিয়াম
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">৳{totalHonorarium.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {monthHonorariums.length} টি কোম্পানি
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> মোট আয়
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">৳{totalIncome.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            {/* Company honorarium section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> কোম্পানি অনারিয়াম যোগ করুন
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="কোম্পানির নাম"
                    className="h-9 text-sm flex-1"
                  />
                  <Input
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="টাকার পরিমাণ"
                    type="number"
                    className="h-9 text-sm w-32"
                  />
                  <Button size="sm" className="h-9 gap-1.5 shrink-0" onClick={addHonorarium}>
                    <Plus className="w-3.5 h-3.5" /> যোগ
                  </Button>
                </div>
                {monthHonorariums.length > 0 ? (
                  <div className="space-y-1.5">
                    {monthHonorariums.map((h) => (
                      <div key={h.id} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 text-sm border border-transparent hover:border-border transition-colors group">
                        <span className="font-medium text-foreground">{h.company}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-semibold">৳{parseFloat(h.amount).toLocaleString()}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            onClick={() => removeHonorarium(h.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    এই মাসে কোনো অনারিয়াম যোগ করা হয়নি
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Monthly income chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" /> মাসিক ভিজিট আয়
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => [`৳${value.toLocaleString()}`, "ভিজিট আয়"]} />
                    <Bar dataKey="visitIncome" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
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
