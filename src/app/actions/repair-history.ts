'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

type RepairHistoryInput = {
  assetId: string;
  repairDate?: string;
  issue: string;
  vendor?: string;
  status?: string;
  costInr?: string | number | null;
  costEur?: string | number | null;
  remarks?: string;
};

function parseCost(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function repairHistoryData(data: RepairHistoryInput) {
  return {
    assetId: data.assetId,
    repairDate: data.repairDate ? new Date(data.repairDate) : new Date(),
    issue: data.issue,
    vendor: data.vendor || null,
    status: data.status || 'COMPLETED',
    costInr: parseCost(data.costInr),
    costEur: parseCost(data.costEur),
    remarks: data.remarks || null,
  };
}

export async function createRepairHistory(data: RepairHistoryInput) {
  const session = await getSession();
  const repairHistory = await prisma.repairHistory.create({
    data: repairHistoryData(data),
    include: { asset: true },
  });

  await logAudit('RepairHistory', repairHistory.id, 'INSERT', null, repairHistory, session?.id);
  revalidatePath('/dashboard/repair-history');
  return { success: true, data: repairHistory };
}

export async function updateRepairHistory(id: string, data: RepairHistoryInput) {
  const session = await getSession();
  const oldRepairHistory = await prisma.repairHistory.findUnique({
    where: { id },
    include: { asset: true },
  });

  const repairHistory = await prisma.repairHistory.update({
    where: { id },
    data: repairHistoryData(data),
    include: { asset: true },
  });

  await logAudit('RepairHistory', id, 'UPDATE', oldRepairHistory, repairHistory, session?.id);
  revalidatePath('/dashboard/repair-history');
  return { success: true, data: repairHistory };
}

export async function deleteRepairHistory(id: string) {
  const session = await getSession();
  const oldRepairHistory = await prisma.repairHistory.findUnique({
    where: { id },
    include: { asset: true },
  });

  await prisma.repairHistory.delete({ where: { id } });

  await logAudit('RepairHistory', id, 'DELETE', oldRepairHistory, null, session?.id);
  revalidatePath('/dashboard/repair-history');
  return { success: true };
}
