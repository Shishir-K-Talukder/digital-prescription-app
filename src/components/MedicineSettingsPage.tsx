import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Settings, Pencil, Check, X, Pill, Clock, Utensils, MessageSquare, CalendarDays, Layers } from "lucide-react";
import { MedicineOptions } from "@/components/MedicineSettings";

interface ListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}

const ListEditor = ({ items, onChange, placeholder }: ListEditorProps) => {
  const [newItem, setNewItem] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const addItem = () => {
    const v = newItem.trim();
    if (v && !items.includes(v)) { onChange([...items, v]); setNewItem(""); }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={placeholder} className="h-9 text-sm" onKeyDown={(e) => e.key === "Enter" && addItem()} />
        <Button size="sm" variant="default" className="h-9 text-sm gap-1.5 px-4 shrink-0" onClick={addItem}><Plus className="w-3.5 h-3.5" /> Add</Button>
      </div>
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 text-sm group border border-transparent hover:border-border transition-colors">
            {editIdx === idx ? (
              <>
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 text-sm flex-1" onKeyDown={(e) => e.key === "Enter" && (() => { const v = editValue.trim(); if (v) { const u = [...items]; u[idx] = v; onChange(u); } setEditIdx(null); })()} autoFocus />
                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => { const v = editValue.trim(); if (v) { const u = [...items]; u[idx] = v; onChange(u); } setEditIdx(null); }}><Check className="w-4 h-4 text-primary" /></Button>
                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => setEditIdx(null)}><X className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-foreground">{item}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => { setEditIdx(idx); setEditValue(item); }}><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => onChange(items.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{items.length} items</p>
    </div>
  );
};

const FollowUpEditor = ({ items, onChange }: { items: { label: string; days: number }[]; onChange: (items: { label: string; days: number }[]) => void }) => {
  const [newLabel, setNewLabel] = useState("");
  const [newDays, setNewDays] = useState("");

  const addItem = () => {
    const l = newLabel.trim(); const d = parseInt(newDays);
    if (l && !isNaN(d) && d > 0) { onChange([...items, { label: l, days: d }]); setNewLabel(""); setNewDays(""); }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label" className="h-9 text-sm flex-1" />
        <Input value={newDays} onChange={(e) => setNewDays(e.target.value)} placeholder="Days" type="number" className="h-9 text-sm w-20" />
        <Button size="sm" variant="default" className="h-9 text-sm gap-1.5 px-4 shrink-0" onClick={addItem}><Plus className="w-3.5 h-3.5" /> Add</Button>
      </div>
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 text-sm group border border-transparent hover:border-border transition-colors">
            <span className="flex-1 text-foreground">{item.label}</span>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{item.days}d</span>
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => onChange(items.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{items.length} items</p>
    </div>
  );
};

interface Props {
  options: MedicineOptions;
  onChange: (options: MedicineOptions) => void;
}

const MedicineSettingsPage = ({ options, onChange }: Props) => {
  const handleChange = (key: keyof MedicineOptions, items: string[]) => onChange({ ...options, [key]: items });

  const tabs = [
    { value: "types", label: "Types", icon: Pill, content: <ListEditor items={options.types} onChange={(v) => handleChange("types", v)} placeholder="e.g. Nebulizer" /> },
    { value: "doses", label: "Doses", icon: Layers, content: <ListEditor items={options.doses} onChange={(v) => handleChange("doses", v)} placeholder="e.g. 2+0+2" /> },
    { value: "durations", label: "Duration", icon: Clock, content: <ListEditor items={options.durations} onChange={(v) => handleChange("durations", v)} placeholder="e.g. 21 days" /> },
    { value: "meals", label: "Meal", icon: Utensils, content: <ListEditor items={options.meals} onChange={(v) => handleChange("meals", v)} placeholder="e.g. With food" /> },
    { value: "advice", label: "Advice", icon: MessageSquare, content: <ListEditor items={options.adviceList} onChange={(v) => handleChange("adviceList", v)} placeholder="e.g. প্রচুর পানি পান করুন" /> },
    { value: "followup", label: "Follow-up", icon: CalendarDays, content: <ListEditor items={options.followUpOptions} onChange={(v) => handleChange("followUpOptions", v)} placeholder="e.g. ৭ দিন পর" /> },
  ];

  return (
    <div className="section-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Settings className="w-4 h-4 text-primary" /> Prescription Settings
      </h3>
      <Tabs defaultValue="types">
        <TabsList className="w-full flex-wrap h-auto gap-1 p-1.5 bg-muted/50">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5">
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MedicineSettingsPage;
