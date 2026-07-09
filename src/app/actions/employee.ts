'use server';

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function createEmployee(data: any) {
  const session = await getSession();
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const newEmp = await prisma.employee.create({
    data: {
      email: data.email,
      name: data.name,
      department: data.department,
      slack_id: data.slack_id,
      mobile_number: data.mobile_number,
      role: data.role || 'EMPLOYEE',
      remarks: data.remarks,
      password: hashedPassword,
    }
  });
  
  await logAudit('Employee', newEmp.id, 'INSERT', null, newEmp, session?.id);
  revalidatePath('/dashboard/employees');
  return { success: true, data: newEmp };
}

export async function updateEmployee(id: string, data: any) {
  const session = await getSession();
  const oldEmp = await prisma.employee.findUnique({ where: { id }});
  
  const updatedEmp = await prisma.employee.update({
    where: { id },
    data: {
      email: data.email,
      name: data.name,
      department: data.department,
      slack_id: data.slack_id,
      mobile_number: data.mobile_number,
      role: data.role,
      remarks: data.remarks,
    }
  });
  
  await logAudit('Employee', id, 'UPDATE', oldEmp, updatedEmp, session?.id);
  revalidatePath('/dashboard/employees');
  return { success: true, data: updatedEmp };
}

export async function deleteEmployee(id: string) {
  const session = await getSession();
  const oldEmp = await prisma.employee.findUnique({ where: { id }});
  
  await prisma.employee.delete({ where: { id } });
  
  await logAudit('Employee', id, 'DELETE', oldEmp, null, session?.id);
  revalidatePath('/dashboard/employees');
  return { success: true };
}
