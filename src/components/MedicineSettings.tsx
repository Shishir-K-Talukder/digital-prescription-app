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
const SETTINGS_VERSION = "v2";

const DEFAULT_OPTIONS: MedicineOptions = {
  types: ["Tab", "Cap", "Syr", "Inj", "Supp", "Drop", "Cream", "Oint"],
  doses: [
    "১+১+১", "১+০+১", "০+১+০", "০+০+১", "১+০+০", "১+১+১+১", "১+১+০",
    "১/২+০+১/২", "১/২+১/২+০", "১/২+০+০", "০+০+১/২", "২+২+২", "২+০+২", "২+০+০", "০+০+২", "০+১/২",
    "১ চামুচ × ১ বার", "১ চামুচ × ২ বার", "১ চামুচ × ৩ বার", "১ চামুচ × ৪ বার",
    "১/২ চামুচ × ১ বার", "১/২ চামুচ × ২ বার", "১/২ চামুচ × ৩ বার", "১/২ চামুচ × ৪ বার",
    "৩/৪ চামুচ × ১ বার", "৩/৪ চামুচ × ২ বার", "৩/৪ চামুচ × ৩ বার", "৩/৪ চামুচ × ৪ বার",
    "১/৩ চামুচ × ১ বার", "১/৩ চামুচ × ২ বার", "১/৩ চামুচ × ৩ বার", "১/৩ চামুচ × ৪ বার",
    "২ চামুচ × ১ বার", "২ চামুচ × ২ বার", "২ চামুচ × ৩ বার", "২ চামুচ × ৪ বার",
    "৩ চামুচ × ২ বার", "৩ চামুচ × ৩ বার", "৪ চামুচ × ২ বার", "৪ চামুচ × ৩ বার",
    "১০ ফোঁটা × ১ বার", "১০ ফোঁটা × ২ বার", "১০ ফোঁটা × ৩ বার", "১০ ফোঁটা × ৪ বার",
    "০৮ ফোঁটা × ১ বার", "০৮ ফোঁটা × ২ বার", "০৮ ফোঁটা × ৩ বার", "০৮ ফোঁটা × ৪ বার",
    "১৫ ফোঁটা × ১ বার", "১৫ ফোঁটা × ২ বার", "১৫ ফোঁটা × ৩ বার", "১৫ ফোঁটা × ৪ বার",
    "২০ ফোঁটা × ২ বার", "২০ ফোঁটা × ৩ বার",
    "২ চামচ ওষুধ ১ গ্লাস পানির সাথে মিশিয়ে × ৩ বার",
    "২ ফোটা ২ বার নাকে দিবেন",
    "০২ চাপ ০২ বার মুখে নিবেন এবং ব্যবহার করে ভালো করে কুলকুচি করবেন",
    "গলা হতে পা পর্যন্ত ব্যবহার করবেন এবং দুপুরবেলা শ্যাম্পু দিয়ে গোসল করবেন × এবং ০৭ দিন পরে আবার ব্যবহার করবেন",
    "গলা হতে পা পর্যন্ত ব্যবহার করবেন ১ বার এবং দুপুরবেলা শ্যাম্পু দিয়ে গোসল করবেন",
    "আক্রান্ত স্থানে একবার", "আক্রান্ত স্থানে একবার (দুপুরে)", "আক্রান্ত স্থানে দুবার", "আক্রান্ত স্থানে তিনবার",
    "পায়ুপথে × ১ বার", "পায়ুপথে × ২ বার", "পায়ুপথে × ৩ বার", "পায়ুপথে প্রয়োজনে দিবেন",
    "১ ফোটা আক্রান্ত চোখে × ১ বার", "১ ফোটা আক্রান্ত চোখে × ২ বার", "১ ফোটা আক্রান্ত চোখে × ৩ বার", "১ ফোটা আক্রান্ত চোখে × ৪ বার",
    "২ ফোটা নাকে × ২ বার",
    "১ ভায়েল শিরায় দিবেন ১ বার", "১ ভায়েল শিরায় দিবেন ২ বার", "১ ভায়েল শিরায় দিবেন ৩ বার",
    "১ এম্পল শিরায় দিবেন ১ বার", "১ এম্পল শিরায় দিবেন ২ বার", "১ এম্পল শিরায় দিবেন ৩ বার",
    "১ এম্পল মাংসে দিবেন ১ বার", "১ এম্পল মাংসে দিবেন ২ বার", "১ এম্পল মাংসে দিবেন ৩ বার",
    "৩০ ফোটা মিনিটে শিরায় দিবেন", "৪০ ফোটা মিনিটে শিরায় দিবেন", "১৫ ফোঁটা মিনিটের শিরায় দিবেন",
    "১২+০+১০ (±২) ১৫ মিনিট", "০+০+৮ (±২) ১৫ মিনিট", "১০+১০+০৮ (±২) ১৫ মিনিট",
    "১ টি ক্যাপসুল প্রতি শনিবার একবার", "১ টি ক্যাপসুল প্রতি রবিবার একবার", "১ টি ক্যাপসুল প্রতি সমবার একবার",
    "১ টি ক্যাপসুল প্রতি মঙ্গলবার একবার", "১ টি ক্যাপসুল প্রতি বুধবার একবার", "১ টি ক্যাপসুল প্রতি বৃহস্পতিবার একবার",
    "১ টি ক্যাপসুল প্রতি শুক্রবার একবার", "সপ্তাহে ৩ বার",
    "২ কাপ ওষুধ ১ গ্লাস পানির সাথে মিশিয়ে ভালো করে গার্গেল/কুলকুচি করবেন",
    "১ টি প্যাকেট যেকন খাবারে সাথে ১ বার",
    "প্রতিবার বমি ও পাতলা পায়েখানার পরে খাবেন।",
    "বার বার মুখে খাবেন ।",
    "১ টি প্যাকেট ২ চামুচ পানির সাথে মিশিয়ে ১বার",
    "২ কাপ ওষুধ ১ লিটার গরম পানির সাথে মিশিয়ে ভালো করে ভাপ নিবেন X ২ বার",
    "১/৩ কাপ ওষুধ ১ কাপ নারিকেল তেলের সাথে মিশিয়ে ভালো করে লাগাবেন আক্তান্ত এস্থানে ২ বার",
    "১ টি এমপুল ১ কাপ দুধের সাথে মিশিয়ে একবার ১৫ দিন পরপর",
    "০+১+০ প্রতি শনিবার,সোমবার,বৃহস্পতিবার",
    "১+০+০ ১ বার এবং ৭ দিন পরে ১ বার",
    "১ টি সাপোজিটর প্রতি রাতে মাসিকের রাস্তায় দিবেন।",
    "৪ কাপ ঔষধ ১ টি প্লাস্টিকের গামলায় ২-৩ লিটার কুসুম কুসুম গরম পানির সাথে মিশিয়ে বসবেন X ২ বার",
    "১৮+০+১২ (± ২) ১৫ মিনিট আহারে পূর্বে চামড়া নিচে নিবেন",
  ],
  durations: [
    "১ দিন", "২ দিন", "৩ দিন", "৪ দিন", "৫ দিন", "৬ দিন", "৭ দিন",
    "১০ দিন", "১৪ দিন", "১৫ দিন", "২১ দিন", "২৮ দিন",
    "১ মাস", "২ মাস", "৩ মাস", "চলবে", "৭ সপ্তাহ",
    "জ্বর থাকলে", "বেশি জ্বর থাকলে বা ১০২° হলে", "বমি হলে",
    "ব্যথা হলে", "বেশি ব্যথা হলে", "প্রয়োজনে",
    "রক্ত আসলে", "রক্ত বেশি আসলে", "জ্বর থাকলে/ব্যথা হলে", "৬ টি",
  ],
  meals: [
    "খাবারের আগে", "খাবারের পরে", "খাবার ১৫ মিঃ আগে", "খাবার ৩০ মিঃ পরে",
    "শোবার সময়", "খাবার পরে শোয়া নিষেধ", "খাবার ১৫ মিঃ আগে চামড়ার নিচে নিবেন",
  ],
  adviceList: [
    "হাঁসের মাংস, কবুতরের মাংস, গরুর মাংস, হাঁসের ডিম,পুঁইশাক, মিষ্টি কুমড়া, বেগুন, শিম, মুশুরের ডাল, খাবার নিষেধ।",
    "অতিরিক্ত তেল চর্বি জাতীয় খাবার এবং আলগা লবণ খাওয়া নিষেধ।",
    "অতিরিক্ত তেল চর্বি জাতীয় খাবার এবং মিষ্টি ও মিষ্টি জাতীয় খাবার নিষেধ।",
    "গরম পানির শেক দেবেন।শেখানো ব্যায়াম নিয়মিত করবেন। কোমরে বেল্ট ব্যবহার করবেন",
    "গরম পানির শেক দিবেন, নিয়মিত শেখানো ব্যায়াম করবেন।",
    "মাক্স ব্যবহার করবেন।ঠান্ডা খাবার খাবেন না। ধুলাবালি জায়গায় কম যাবেন।",
    "পর্যাপ্ত পরিমাণে পানি পান করবেন।কুসুম কুসুম গরম পানিতে দুই মুঠ লবণ মিশিয়ে দিয়ে প্রসাবের রাস্তা ও মাসিকের রাস্তা পরিষ্কার করবেন।",
    "হার্ট,ডায়াবেটিস ও প্রেসার এর পূর্বের ওষুধ চলবে।",
    "প্রচুর পানি পান করুন",
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
