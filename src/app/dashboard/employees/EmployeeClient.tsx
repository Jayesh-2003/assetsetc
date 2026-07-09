'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Download, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { createEmployee, updateEmployee, deleteEmployee } from '@/app/actions/employee';

export default function EmployeeClient({ initialEmployees }: { initialEmployees: any[] }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', department: '', slack_id: '', mobile_number: '', role: 'EMPLOYEE', remarks: '' });

  const filtered = employees.filter(e => 
    (e.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (e.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Dept', 'Role', 'Slack ID', 'Mobile', 'Remarks'];
    const rows = filtered.map(e => [e.id, e.name, e.email, e.department, e.role, e.slack_id, e.mobile_number, `"${e.remarks || ''}"`]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createEmployee(formData);
    if (res.success) {
      setEmployees([res.data, ...employees]);
      setIsAddOpen(false);
      setFormData({ name: '', email: '', department: '', slack_id: '', mobile_number: '', role: 'EMPLOYEE', remarks: '' });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateEmployee(selectedEmp.id, formData);
    if (res.success) {
      setEmployees(employees.map(emp => emp.id === selectedEmp.id ? res.data : emp));
      setIsEditOpen(false);
    }
  };

  const handleDelete = async () => {
    const res = await deleteEmployee(selectedEmp.id);
    if (res.success) {
      setEmployees(employees.filter(emp => emp.id !== selectedEmp.id));
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search employees..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Employee
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Dept</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Slack ID</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell className="font-medium">{emp.name || '-'}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.department || '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {emp.role}
                  </span>
                </TableCell>
                <TableCell>{emp.slack_id || '-'}</TableCell>
                <TableCell className="max-w-[150px] truncate" title={emp.remarks}>{emp.remarks || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedEmp(emp);
                    setFormData({ name: emp.name || '', email: emp.email || '', department: emp.department || '', slack_id: emp.slack_id || '', mobile_number: emp.mobile_number || '', role: emp.role || 'EMPLOYEE', remarks: emp.remarks || '' });
                    setIsEditOpen(true);
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                    setSelectedEmp(emp);
                    setIsDeleteOpen(true);
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">No employees found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Dept</label>
              <Input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Role</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Slack ID</label>
              <Input value={formData.slack_id} onChange={e => setFormData({...formData, slack_id: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Remarks</label>
              <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Dept</label>
              <Input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Role</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Slack ID</label>
              <Input value={formData.slack_id} onChange={e => setFormData({...formData, slack_id: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Remarks</label>
              <Input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Warning Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Delete Employee
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-600">
            Are you sure you want to delete <strong>{selectedEmp?.name || selectedEmp?.email}</strong>? This action cannot be undone and will permanently remove their access.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
