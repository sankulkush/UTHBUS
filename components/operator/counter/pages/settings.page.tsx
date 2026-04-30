"use client";

import { useState } from "react";
import { Save, User, Building2, Phone, Mail, MapPin, FileText, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { firestore as db } from "@/firebaseConfig";

export function SettingsPage() {
  const { operator, user } = useAuth();
  const [form, setForm] = useState({
    fullName: operator?.name || "",
    email: operator?.email || "",
    phoneNumber: operator?.phoneNumber || "",
    companyName: operator?.companyName || "",
    licenseNumber: operator?.licenseNumber || "",
    address: operator?.address || "",
    description: operator?.description || "",
    contactNumber: operator?.contactNumber || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      // Update in operators collection (as used by auth-context)
      await updateDoc(doc(db, "operators", user.uid), {
        ...form,
        updatedAt: new Date().toISOString(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Settings save failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "fullName", label: "Full Name", icon: User, type: "text" },
    { key: "email", label: "Email Address", icon: Mail, type: "email", disabled: true },
    { key: "phoneNumber", label: "Personal Phone", icon: Phone, type: "tel" },
    { key: "companyName", label: "Company Name", icon: Building2, type: "text" },
    { key: "licenseNumber", label: "License Number", icon: FileText, type: "text" },
    { key: "contactNumber", label: "Business Contact", icon: Phone, type: "tel" },
    { key: "address", label: "Address", icon: MapPin, type: "text" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-xl space-y-6">
      {/* Profile section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm">Company Profile</h2>
          <p className="text-xs text-muted-foreground mt-0.5">This information is used across the operator portal</p>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {fields.map(({ key, label, icon: Icon, type, disabled }) => (
            <div key={key}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => set(key, e.target.value)}
                  disabled={disabled}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Brief description of your transport service..."
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : saving ? (
              "Saving…"
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-sm">Account</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="text-foreground">{operator?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="text-foreground">Operator</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Portal version</span>
            <span className="text-foreground">V2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
