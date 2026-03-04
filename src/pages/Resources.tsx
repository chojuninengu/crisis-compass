import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getResources, addResource } from "@/lib/api";
import type { Resource } from "@/lib/supabase";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Resources = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", contact: "", availability: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Resources — CrisisCompass";
    (async () => {
      const data = await getResources();
      setResources(data ?? []);
      setLoading(false);
    })();
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const created = await addResource(form);
    if (created) {
      setResources((prev) => [...prev, created]);
      setForm({ name: "", category: "", contact: "", availability: "", notes: "" });
      setOpen(false);
      toast({ title: "Resource added!" });
    } else {
      toast({ title: "Failed to add resource", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Resources</h2>
          <p className="text-sm text-muted-foreground mt-1">Community resource directory</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-1" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Resource name" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crisis">Crisis</SelectItem>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Outpatient">Outpatient</SelectItem>
                    <SelectItem value="Peer Support">Peer Support</SelectItem>
                    <SelectItem value="Substance Use">Substance Use</SelectItem>
                    <SelectItem value="Youth">Youth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contact</Label>
                <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Phone or email" />
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="e.g. 24/7, M-F 9-5" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional details" rows={2} />
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={saving || !form.name.trim()}>
                {saving ? "Saving…" : "Add Resource"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Availability</TableHead>
                <TableHead className="hidden lg:table-cell">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                  </TableRow>
                ))
              ) : resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No resources yet. Add the first one!
                  </TableCell>
                </TableRow>
              ) : (
                resources.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell className="hidden md:table-cell">{r.contact}</TableCell>
                    <TableCell className="hidden lg:table-cell">{r.availability}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{r.notes}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Resources;
