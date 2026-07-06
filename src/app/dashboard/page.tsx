import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function formatModuleName(tableName: string) {
  return tableName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace('AI Subscription', 'AI Subscription');
}

function actionClass(action: string) {
  switch (action) {
    case 'INSERT':
      return 'bg-emerald-100 text-emerald-700';
    case 'UPDATE':
      return 'bg-amber-100 text-amber-700';
    case 'DELETE':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default async function DashboardPage() {
  const session = await getSession();
  const [
    totalEmployees,
    totalAssets,
    assignedLaptops,
    activeAISubscriptions,
    openRepairs,
    parkingPermits,
    recentActivity,
  ] = await prisma.$transaction([
    prisma.employee.count(),
    prisma.asset.count(),
    prisma.assetAssignment.count({
      where: {
        asset: {
          assetType: 'LAPTOP',
        },
      },
    }),
    prisma.aISubscriptionRegister.count(),
    prisma.repairHistory.count({
      where: {
        status: {
          in: ['REQUESTED', 'IN_PROGRESS'],
        },
      },
    }),
    prisma.parkingPermit.count(),
    prisma.auditLog.findMany({
      include: { changedByEmployee: true },
      orderBy: { changedAt: 'desc' },
      take: 8,
    }),
  ]);

  const metrics = [
    {
      label: 'Total Employees',
      value: totalEmployees,
      helper: 'Active in system',
    },
    {
      label: 'Total Assets',
      value: totalAssets,
      helper: 'Registered hardware',
    },
    {
      label: 'Laptops Assigned',
      value: assignedLaptops,
      helper: 'Currently with employees',
    },
    {
      label: 'Active AI Subscriptions',
      value: activeAISubscriptions,
      helper: 'Across all tiers',
    },
    {
      label: 'Open Repairs',
      value: openRepairs,
      helper: 'Requested or in progress',
    },
    {
      label: 'Parking Permits',
      value: parkingPermits,
      helper: 'Currently registered',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, {session?.name || 'Administrator'}!</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
              <p className="text-xs text-gray-500 mt-1">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-200 shadow-sm mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${actionClass(log.action)}`}>
                        {log.action}
                      </span>
                      <p className="truncate text-sm font-medium text-gray-900">{formatModuleName(log.tableName)}</p>
                    </div>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {log.changedByEmployee?.name || 'System'} · {new Date(log.changedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="hidden max-w-[180px] truncate text-xs text-gray-400 md:block" title={log.recordId}>
                    {log.recordId}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No activity recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
