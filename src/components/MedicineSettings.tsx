import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Settings, Pencil, Check, X, Pill, Clock, Utensils, MessageSquare, CalendarDays, Layers } from "lucide-react";

export interface MedicineOptions {
  types: string[];
  doses: string[];
  durations: string[];
  meals: string[];
  adviceList: string[];
  followUpOptions: { label: string; days: number }[];
}

const STORAGE_KEY = "medicine-options";

const DEFAULT_OPTIONS: MedicineOptions = {
  types: ["Tab", "Cap", "Syr", "Inj", "Supp", "Drop", "Cream", "Oint"],
  doses: ["1+0+0", "0+0+1", "1+0+1", "1+1+1", "1+1+1+1", "0+1+0"],
  durations: ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "Continue"],
  meals: ["খাবার পরে (After meal)", "খাবার আগে (Before meal)", "Empty stomach"],
  adviceList: [
    "প্রচুর পানি পান করুন",
    "বিশ্রাম নিন",
    "তৈলাক্ত খাবার পরিহার করুন",
    "নিয়মিত ব্যায়াম করুন",
    "লবণ কম খান",
    "ধূমপান পরিহার করুন",
    "সময়মতো ওষুধ সেবন করুন",
    "পরবর্তী ভিজিটে রিপোর্ট নিয়ে আসুন",
  ],
  followUpOptions: [
    { label: "3 দিন পর", days: 3 },
    { label: "5 দিন পর", days: 5 },
    { label: "7 দিন পর", days: 7 },
    { label: "10 দিন পর", days: 10 },
    { label: "15 দিন পর", days: 15 },
    { label: "1 মাস পর", days: 30 },
    { label: "2 মাস পর", days: 60 },
    { label: "3 মাস পর", days: 90 },
  ],
};

export const loadMedicineOptions = (): MedicineOptions => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_OPTIONS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_OPTIONS;
};

const saveMedicineOptions = (options: MedicineOptions) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
};

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
    if (v && !items.includes(v)) {
      onChange([...items, v]);
      setNewItem("");
    }
  };

  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  const startEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(items[idx]);
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const v = editValue.trim();
    if (v) {
      const updated = [...items];
      updated[editIdx] = v;
      onChange(updated);
    }
    setEditIdx(null);
    setEditValue("");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          className="h-9 text-sm"
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <Button size="sm" variant="default" className="h-9 text-sm gap-1.5 px-4 shrink-0" onClick={addItem}>
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>
      <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 text-sm group border border-transparent hover:border-border transition-colors">
            {editIdx === idx ? (
              <>
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 text-sm flex-1" onKeyDown={(e) => e.key === "Enter" && saveEdit()} autoFocus />
                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={saveEdit}><Check className="w-4 h-4 text-primary" /></Button>
                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => setEditIdx(null)}><X className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-foreground">{item}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startEdit(idx)}><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => removeItem(idx)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{items.length} items • Hover to edit or delete</p>
    </div>
  );
};

const FollowUpEditor = ({ items, onChange }: { items: { label: string; days: number }[]; onChange: (items: { label: string; days: number }[]) => void }) => {
  const [newLabel, setNewLabel] = useState("");
  const [newDays, setNewDays] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDays, setEditDays] = useState("");

  const addItem = () => {
    const l = newLabel.trim();
    const d = parseInt(newDays);
    if (l && !isNaN(d) && d > 0) {
      onChange([...items, { label: l, days: d }]);
      setNewLabel(""); setNewDays("");
    }
  };

  const startEdit = (idx: number) => {
    setEditIdx(idx);
    setEditLabel(items[idx].label);
    setEditDays(String(items[idx].days));
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const l = editLabel.trim();
    const d = parseInt(editDays);
    if (l && !isNaN(d) && d > 0) {
      const updated = [...items];
      updated[editIdx] = { label: l, days: d };
      onChange(updated);
    }
    setEditIdx(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label (e.g. ৭ দিন পর)" className="h-9 text-sm flex-1" />
        <Input value={newDays} onChange={(e) => setNewDays(e.target.value)} placeholder="Days" type="number" className="h-9 text-sm w-20" />
        <Button size="sm" variant="default" className="h-9 text-sm gap-1.5 px-4 shrink-0" onClick={addItem}><Plus className="w-3.5 h-3.5" /> Add</Button>
      </div>
      <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 text-sm group border border-transparent hover:border-border transition-colors">
            {editIdx === idx ? (
              <>
                <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="h-8 text-sm flex-1" autoFocus />
                <Input value={editDays} onChange={(e) => setEditDays(e.target.value)} type="number" className="h-8 text-sm w-16" />
                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={saveEdit}><Check className="w-4 h-4 text-primary" /></Button>
                <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={() => setEditIdx(null)}><X className="w-4 h-4" /></Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{item.days}d</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startEdit(idx)}><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => onChange(items.filter((_, i) => i !== idx))}><Trash2 className="w-3.5 h-3.5" /></Button>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{items.length} items • Hover to edit or delete</p>
    </div>
  );
};

interface Props {
  options: MedicineOptions;
  onChange: (options: MedicineOptions) => void;
}

const MedicineSettings = ({ options, onChange }: Props) => {
  const handleChange = (key: keyof MedicineOptions, items: string[]) => {
    const updated = { ...options, [key]: items };
    onChange(updated);
    saveMedicineOptions(updated);
  };

  const handleFollowUpChange = (items: { label: string; days: number }[]) => {
    const updated = { ...options, followUpOptions: items };
    onChange(updated);
    saveMedicineOptions(updated);
  };

  const tabs = [
    { value: "types", label: "Types", icon: Pill, description: "Medicine types (Tab, Cap, Syr...)", content: <ListEditor items={options.types} onChange={(v) => handleChange("types", v)} placeholder="e.g. Nebulizer" /> },
    { value: "doses", label: "Doses", icon: Layers, description: "Dose patterns", content: <ListEditor items={options.doses} onChange={(v) => handleChange("doses", v)} placeholder="e.g. 2+0+2" /> },
    { value: "durations", label: "Duration", icon: Clock, description: "Duration options", content: <ListEditor items={options.durations} onChange={(v) => handleChange("durations", v)} placeholder="e.g. 21 days" /> },
    { value: "meals", label: "Meal", icon: Utensils, description: "Meal timing options", content: <ListEditor items={options.meals} onChange={(v) => handleChange("meals", v)} placeholder="e.g. With food" /> },
    { value: "advice", label: "Advice", icon: MessageSquare, description: "Advice options (পরামর্শ)", content: <ListEditor items={options.adviceList} onChange={(v) => handleChange("adviceList", v)} placeholder="e.g. প্রচুর পানি পান করুন" /> },
    { value: "followup", label: "Follow-up", icon: CalendarDays, description: "Follow-up duration options", content: <FollowUpEditor items={options.followUpOptions} onChange={handleFollowUpChange} /> },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Settings className="w-3.5 h-3.5" /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Prescription Settings
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Customize medicine options, advice, and follow-up. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="types" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1.5 bg-muted/50">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs gap-1.5 data-[state=active]:shadow-sm">
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex-1 overflow-y-auto mt-3">
            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                <Label className="text-sm text-muted-foreground mb-3 block">{tab.description}</Label>
                {tab.content}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MedicineSettings;
