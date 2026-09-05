import { DashboardLayout } from '../layout/dashboard-layout'

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout role="PROVIDER">{children}</DashboardLayout>
}