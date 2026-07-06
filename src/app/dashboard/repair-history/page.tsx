import { prisma } from '@/lib/prisma';
import RepairHistoryClient from './RepairHistoryClient';

export default async function RepairHistoryPage() {
  const repairHistories = await prisma.repairHistory.findMany({
    include: { asset: true },
    orderBy: { repairDate: 'desc' },
  });

  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Repair History</h1>
        <p className="text-gray-500 mt-1">Track repairs, vendors, costs, and status for registered assets.</p>
      </div>
      <RepairHistoryClient repairHistories={repairHistories} assets={assets} />
    </div>
  );
}
