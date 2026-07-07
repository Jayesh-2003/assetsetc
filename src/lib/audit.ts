import { prisma } from './prisma';

export async function logAudit(
  tableName: string,
  recordId: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  oldData: any = null,
  newData: any = null,
  changedByEmployeeId: string | null = null
) {
  try {
    let validEmployeeId = null;
    if (changedByEmployeeId) {
      const exists = await prisma.employee.findUnique({
        where: { id: changedByEmployeeId },
        select: { id: true }
      });
      if (exists) {
        validEmployeeId = changedByEmployeeId;
      }
    }

    await prisma.auditLog.create({
      data: {
        tableName,
        recordId,
        action,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
        changedByEmployeeId: validEmployeeId,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
