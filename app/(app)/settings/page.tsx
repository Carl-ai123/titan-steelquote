import { SettingsPanel } from '@/components/settings/settings-panel'
import { mockOrgSettings, mockUsers } from '@/lib/mock-data'

// TODO: Replace with server-side fetch: GET /api/settings
export default function SettingsPage() {
  return <SettingsPanel settings={mockOrgSettings} users={mockUsers} />
}
