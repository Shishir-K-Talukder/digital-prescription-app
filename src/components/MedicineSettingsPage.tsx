import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Settings, Pencil, Check, X, Pill, Clock, Utensils, MessageSquare, CalendarDays, Layers, ClipboardList, Search, GripVertical, BookTemplate, Baby } from "lucide-react";
import { MedicineOptions } from "@/components/MedicineSettings";
import TreatmentTemplateManager from "@/components/TreatmentTemplateManager";
import PediatricDoseRuleManager from "@/components/PediatricDoseRuleManager";

interface ListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}

const ListEditor = ({ items, onChange, placeholder }: ListEditorProps) => {
  const [newItem, setNewItem] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const addItem = () => {
    const v = newItem.trim();
    if (v && !items.includes(v)) { onChange([...items, v]); setNewItem(""); }
  };

  const handleDragStart = (idx: number) => { dragItem.current = idx; };
  const handleDragEnter = (idx: number) => { dragOverItem.current = idx; setDragOverIdx(idx); };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const reordered = [...items];
      const [removed] = reordered.splice(dragItem.current, 1);
      reordered.splice(dragOverItem.current, 0, removed);
      onChange(reordered);
    }
    dragItem.current = null; dragOverItem.current = null; setDragOverIdx(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder={placeholder} className="h-14 text-base rounded-xl border-2 border-input focus:border-primary" onKeyDown={(e) => e.key === "Enter" && addItem()} />
        <Button size="lg" variant="default" className="h-14 text-base gap-2 px-7 shrink-0 font-bold rounded-xl shadow-md hover:shadow-lg transition-all" onClick={addItem}>
          <Plus className="w-6 h-6" /> Add
        </Button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            draggable={editIdx !== idx}
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3 text-base group border-2 transition-all cursor-grab active:cursor-grabbing ${
              dragOverIdx === idx ? "border-primary bg-primary/5 shadow-sm" : "border-transparent hover:border-border hover:bg-muted/60"
            }`}
          >
            {editIdx === idx ? (
              <>
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-12 text-base flex-1 rounded-lg" onKeyDown={(e) => e.key === "Enter" && (() => { const v = editValue.trim(); if (v) { const u = [...items]; u[idx] = v; onChange(u); } setEditIdx(null); })()} autoFocus />
                <Button size="icon" variant="default" className="h-12 w-12 shrink-0 rounded-xl shadow-sm" onClick={() => { const v = editValue.trim(); if (v) { const u = [...items]; u[idx] = v; onChange(u); } setEditIdx(null); }}>
                  <Check className="w-6 h-6" />
                </Button>
                <Button size="icon" variant="outline" className="h-12 w-12 shrink-0 rounded-xl border-2" onClick={() => setEditIdx(null)}>
                  <X className="w-6 h-6" />
                </Button>
              </>
            ) : (
              <>
                <GripVertical className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                <span className="flex-1 text-foreground font-medium text-[15px]">{item}</span>
                <Button size="icon" variant="outline" className="h-12 w-12 shrink-0 rounded-xl border-2 opacity-70 group-hover:opacity-100 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all" onClick={() => { setEditIdx(idx); setEditValue(item); }}>
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" className="h-12 w-12 shrink-0 rounded-xl border-2 opacity-70 group-hover:opacity-100 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all" onClick={() => onChange(items.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground font-semibold">{items.length} items</p>
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
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label" className="h-14 text-base flex-1 rounded-xl border-2 border-input focus:border-primary" />
        <Input value={newDays} onChange={(e) => setNewDays(e.target.value)} placeholder="Days" type="number" className="h-14 text-base w-24 rounded-xl border-2 border-input focus:border-primary" />
        <Button size="lg" variant="default" className="h-14 text-base gap-2 px-7 shrink-0 font-bold rounded-xl shadow-md hover:shadow-lg transition-all" onClick={addItem}>
          <Plus className="w-6 h-6" /> Add
        </Button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3 text-base group border-2 border-transparent hover:border-border hover:bg-muted/60 transition-all">
            <span className="flex-1 text-foreground font-medium text-[15px]">{item.label}</span>
            <span className="text-sm text-muted-foreground bg-muted rounded-full px-3 py-1.5 font-semibold">{item.days}d</span>
            <Button size="icon" variant="outline" className="h-12 w-12 shrink-0 rounded-xl border-2 opacity-70 group-hover:opacity-100 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all" onClick={() => onChange(items.filter((_, i) => i !== idx))}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground font-semibold">{items.length} items</p>
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
    { value: "investigations", label: "Investigation", icon: Search, content: <ListEditor items={options.investigations || []} onChange={(v) => handleChange("investigations", v)} placeholder="e.g. CBC, X-Ray Chest P/A" /> },
    { value: "chiefComplaints", label: "C/C", icon: ClipboardList, content: <ListEditor items={options.chiefComplaints || []} onChange={(v) => handleChange("chiefComplaints", v)} placeholder="e.g. Fever, Headache" /> },
    {
      value: "pediatric",
      label: "Pediatric",
      icon: Baby,
      content: (
        <PediatricDoseRuleManager
          rules={options.pediatricRules || []}
          meals={options.meals}
          durations={options.durations}
          onChange={(rules) => onChange({ ...options, pediatricRules: rules })}
        />
      ),
    },
    { value: "templates", label: "Templates", icon: BookTemplate, content: <TreatmentTemplateManager /> },
  ];

  return (
    <div className="section-card p-5">
      <h3 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" /> Prescription Settings
      </h3>
      <Tabs defaultValue="types">
        <TabsList className="w-full flex-wrap h-auto gap-2 p-2.5 bg-muted/50 rounded-xl">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-sm gap-2 px-4 py-2.5 font-semibold rounded-lg data-[state=active]:shadow-md transition-all">
              <tab.icon className="w-5 h-5" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-5">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MedicineSettingsPage;
