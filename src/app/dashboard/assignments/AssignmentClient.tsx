'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, ArrowRightLeft, ArrowDownToLine, Download } from 'lucide-react';
import { assignAsset, returnAsset } from '@/app/actions/assignment';

export default function AssignmentClient({ assets, employees }: { assets: any[], employees: any[] }) {
  const [search, setSearch] = useState('');
  
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  const [employeeId, setEmployeeId] = useState('');
  const [remarks, setRemarks] = useState('');
  const selectedEmployee = employees.find(e => e.id === employeeId);

  const filtered = assets.filter(a => 
    (a.model || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.serialNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.assetType || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.assignments?.[0]?.employee?.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['Asset Type', 'Model/Name', 'Serial/Number', 'Status', 'Assigned To (Name)', 'Assigned To (Email)', 'Assigned To Dept', 'Assigned Date'];
    const rows = filtered.map(a => {
      const assignment = a.assignments && a.assignments.length > 0 ? a.assignments[0] : null;
      return [
        a.assetType, 
        `"${a.model || ''}"`, 
        a.serialNumber, 
        assignment ? 'With Employee' : 'In Office',
        assignment ? `"${assignment.employee?.name || ''}"` : '',
        assignment ? assignment.employee?.email : '',
        assignment ? `"${assignment.employee?.department || ''}"` : '',
        assignment ? new Date(assignment.assignedDatetime).toLocaleDateString() : ''
      ];
    });
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset_assignments.csv';
    a.click();
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    await assignAsset(selectedAsset.id, employeeId, remarks);
    window.location.reload();
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignment = selectedAsset.assignments[0];
    if (!assignment) return;
    await returnAsset(assignment.id, remarks);
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search assets..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Serial / SIM No</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Dept</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((asset) => {
              const assignment = asset.assignments && asset.assignments.length > 0 ? asset.assignments[0] : null;
              
              return (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">
                    {asset.model || '-'}
                    <div className="text-xs text-gray-500 mt-1">{asset.assetType}</div>
                  </TableCell>
                  <TableCell>{asset.serialNumber || '-'}</TableCell>
                  <TableCell>
                    {assignment ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">With Employee</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">In Office</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {assignment ? (
                      <div>
                        <div className="font-medium text-gray-900">{assignment.employee?.name || assignment.employee?.email}</div>
                        <div className="text-xs text-gray-500">Since {new Date(assignment.assignedDatetime).toLocaleDateString()}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{assignment?.employee?.department || '-'}</TableCell>
                  <TableCell className="text-right">
                    {!assignment ? (
                      <Button size="sm" onClick={() => {
                        setSelectedAsset(asset);
                        setEmployeeId('');
                        setRemarks('');
                        setIsAssignOpen(true);
                      }}>
                        <ArrowRightLeft className="h-4 w-4 mr-2" /> Assign
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => {
                        setSelectedAsset(asset);
                        setRemarks(assignment.remarks || '');
                        setIsReturnOpen(true);
                      }}>
                        <ArrowDownToLine className="h-4 w-4 mr-2" /> Return to Office
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No assets found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Assign Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Asset</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignSubmit} className="space-y-4 pt-4">
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
              Assigning: <strong className="text-gray-900">{selectedAsset?.model}</strong> (Serial: {selectedAsset?.serialNumber})
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Select Employee</label>
              <select 
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                value={employeeId} 
                onChange={e => setEmployeeId(e.target.value)}
              >
                <option value="" disabled>-- Select Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Dept</label>
              <Input value={selectedEmployee?.department || '-'} readOnly className="bg-gray-50 text-gray-600" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Assignment Remarks (Optional)</label>
              <Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. For project Alpha testing" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
              <Button type="submit">Complete Assignment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Asset to Office</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReturnSubmit} className="space-y-4 pt-4">
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
              Returning: <strong className="text-gray-900">{selectedAsset?.model}</strong> from <strong>{selectedAsset?.assignments?.[0]?.employee?.name || selectedAsset?.assignments?.[0]?.employee?.email}</strong>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Return Remarks / Condition</label>
              <Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Screen scratched, returned in working order" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsReturnOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Process Return</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
