import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useDoctorSettings } from "@/hooks/useDoctorSettings";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import FloatingNav from "@/components/FloatingNav";
import PrintSetup from "@/components/PrintSetup";
import MedicineSettingsPage from "@/components/MedicineSettingsPage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, FileText, CalendarDays, SlidersHorizontal, Settings, Stethoscope, LogOut, User, Home } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const Dashboard = () => {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { printSettings, savePrintSettings, medicineOptions, saveMedicineOptions, loading: settingsLoading } = useDoctorSettings();
  const { prescriptions, loading: rxLoading } = usePrescriptions();
  
  const [activeTab, setActiveTab] = useState("overview");

  const monthlyData = useMemo(() => {
    const months: { name: string; patients: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const count = prescriptions.filter((rx) => {
        const rxDate = new Date(rx.created_at);
        return isWithinInterval(rxDate, { start, end });
      }).length;
      months.push({ name: format(date, "MMM yyyy"), patients: count });
    }
    return months;
  }, [prescriptions]);

  const uniquePatients = useMemo(() => {
    const names = new Set(prescriptions.map((rx) => rx.patient_data.name).filter(Boolean));
    return names.size;
  }, [prescriptions]);

  const thisMonthCount = monthlyData[monthlyData.length - 1]?.patients || 0;

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
