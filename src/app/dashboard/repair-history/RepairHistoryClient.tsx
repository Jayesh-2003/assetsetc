'use client';

import { useState } from 'react';
import { AlertTriangle, Download, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { Asset, RepairHistory } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createRepairHistory, deleteRepairHistory, updateRepairHistory } from '@/app/actions/repair-history';

type RepairHistoryWithAsset = RepairHistory & {
  asset: Asset;
};

type RepairHistoryForm = {
  assetId: string;
  repairDate: string;
  issue: string;
  vendor: string;
  status: string;
  costInr: string;
  costEur: string;
  remarks: string;
};

const statuses = ['REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function dateInputValue(value: string | Date | null | undefined) {
  if (!value) return todayInputValue();
  return new Date(value).toISOString().slice(0, 10);
}

function assetLabel(asset: Asset | null | undefined) {
  if (!asset) return 'Unknown asset';

  const tag = asset.assetTag ? `${asset.assetTag} - ` : '';
  const model = asset.model || asset.description || 'Untitled asset';
  const serial = asset.serialNumber ? ` (${asset.serialNumber})` : '';
  return `${tag}${model}${serial}`;
}

function statusLabel(status: string) {
  return status.replaceAll('_', ' ');
}

function statusClass(status: string) {
  switch (status) {
    case 'REQUESTED':
      return 'bg-slate-100 text-slate-700';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-700';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function csvValue(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function hasCost(value: unknown) {
  return value !== null && value !== undefined && value !== '';
}

export default function RepairHistoryClient({ repairHistories, assets }: { repairHistories: RepairHistoryWithAsset[]; assets: Asset[] }) {
  const [items, setItems] = useState<RepairHistoryWithAsset[]>(repairHistories);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairHistoryWithAsset | null>(null);

  const defaultForm: RepairHistoryForm = {
    assetId: assets[0]?.id || '',
    repairDate: todayInputValue(),
    issue: '',
    vendor: '',
    status: 'COMPLETED',
    costInr: '',
    costEur: '',
    remarks: '',
  };

  const [formData, setFormData] = useState<RepairHistoryForm>(defaultForm);

  const filtered = items.filter((item) => {
    const normalizedSearch = search.toLowerCase();
    const matchesSearch =
      (item.issue || '').toLowerCase().includes(normalizedSearch) ||
      (item.vendor || '').toLowerCase().includes(normalizedSearch) ||
      (item.remarks || '').toLowerCase().includes(normalizedSearch) ||
      (item.asset?.assetTag || '').toLowerCase().includes(normalizedSearch) ||
      (item.asset?.model || '').toLowerCase().includes(normalizedSearch) ||
      (item.asset?.serialNumber || '').toLowerCase().includes(normalizedSearch);

    return matchesSearch && (statusFilter === 'ALL' || item.status === statusFilter);
  });

  const openAddDialog = () => {
    setFormData({
      ...defaultForm,
      assetId: assets[0]?.id || '',
      repairDate: todayInputValue(),
    });
    setIsAddOpen(true);
  };

  const openEditDialog = (repair: RepairHistoryWithAsset) => {
    setSelectedRepair(repair);
    setFormData({
      assetId: repair.assetId,
      repairDate: dateInputValue(repair.repairDate),
      issue: repair.issue || '',
      vendor: repair.vendor || '',
      status: repair.status || 'COMPLETED',
      costInr: repair.costInr === null || repair.costInr === undefined ? '' : String(repair.costInr),
      costEur: repair.costEur === null || repair.costEur === undefined ? '' : String(repair.costEur),
      remarks: repair.remarks || '',
    });
    setIsEditOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Asset', 'Asset Type', 'Repair Date', 'Issue', 'Vendor', 'Status', 'Cost (INR)', 'Cost (EUR)', 'Remarks'];
    const rows = filtered.map((item) => [
      assetLabel(item.asset),
      item.asset?.assetType || '',
      new Date(item.repairDate).toLocaleDateString(),
      item.issue || '',
      item.vendor || '',
      statusLabel(item.status || ''),
      hasCost(item.costInr) ? item.costInr : '',
      hasCost(item.costEur) ? item.costEur : '',
      item.remarks || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map(csvValue).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'repair_history.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createRepairHistory(formData);
    if (res.success) {
      setItems([res.data, ...items]);
      setIsAddOpen(false);
      setFormData(defaultForm);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepair) return;

    const res = await updateRepairHistory(selectedRepair.id, formData);
    if (res.success) {
      setItems(items.map((item) => (item.id === selectedRepair.id ? res.data : item)));
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRepair) return;

    const res = await deleteRepairHistory(selectedRepair.id);
    if (res.success) {
      setItems(items.filter((item) => item.id !== selectedRepair.id));
      setIsDeleteOpen(false);
    }
  };

  const renderRepairForm = (onSubmit: (e: React.FormEvent) => Promise<void>, submitLabel: string, onCancel: () => void) => (
    <form onSubmit={onSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium">Asset</label>
          <select
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={formData.assetId}
            onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
          >
            {assets.length === 0 && <option value="">No assets registered</option>}
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {assetLabel(asset)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Repair Date</label>
          <Input
            type="date"
            required
            value={formData.repairDate}
            onChange={(e) => setFormData({ ...formData, repairDate: e.target.value })}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Status</label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium">Issue / Repair Work</label>
          <Input
            required
            value={formData.issue}
            onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
            placeholder="e.g. Battery replacement, display repair"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Vendor / Service Center</label>
          <Input
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            placeholder="e.g. Apple Service"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Cost (INR)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.costInr}
              onChange={(e) => setFormData({ ...formData, costInr: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Cost (EUR)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.costEur}
              onChange={(e) => setFormData({ ...formData, costEur: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium">Remarks</label>
          <Input
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            placeholder="Warranty notes, invoice reference, or condition notes"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={assets.length === 0}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search repairs or assets..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={openAddDialog} disabled={assets.length === 0} className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Repair
          </Button>
        </div>
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Repair Date</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.asset?.assetTag || item.asset?.model || '-'}
                  <div className="text-xs text-gray-500 mt-1">
                    {item.asset?.model || item.asset?.assetType || '-'}
                    {item.asset?.serialNumber ? ` / ${item.asset.serialNumber}` : ''}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{new Date(item.repairDate).toLocaleDateString()}</TableCell>
                <TableCell className="max-w-[220px] truncate" title={item.issue}>
                  {item.issue}
                </TableCell>
                <TableCell>{item.vendor || '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(item.status)}`}>
                    {statusLabel(item.status || '')}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  {hasCost(item.costInr) ? `₹${item.costInr}` : ''}
                  {hasCost(item.costInr) && hasCost(item.costEur) && ' | '}
                  {hasCost(item.costEur) ? `€${item.costEur}` : ''}
                  {!hasCost(item.costInr) && !hasCost(item.costEur) && '-'}
                </TableCell>
                <TableCell className="max-w-[180px] truncate" title={item.remarks || undefined}>
                  {item.remarks || '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setSelectedRepair(item);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No repair history found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Repair History</DialogTitle>
          </DialogHeader>
          {renderRepairForm(handleAddSubmit, 'Save Repair', () => setIsAddOpen(false))}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Repair History</DialogTitle>
          </DialogHeader>
          {renderRepairForm(handleEditSubmit, 'Save Changes', () => setIsEditOpen(false))}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Delete Repair History
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-600">
            Are you sure you want to delete this repair record for{' '}
            <strong>{selectedRepair?.asset ? assetLabel(selectedRepair.asset) : 'this asset'}</strong>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
