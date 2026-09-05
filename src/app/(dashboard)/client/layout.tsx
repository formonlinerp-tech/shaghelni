import { DashboardLayout } from '../layout/dashboard-layout'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout role="CLIENT">{children}</DashboardLayout>
}