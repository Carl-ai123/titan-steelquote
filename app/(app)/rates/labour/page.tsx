import { LabourRatesLibrary } from '@/components/rates/labour-rates-library'
import { mockLabourRates } from '@/lib/mock-data'

// TODO: Replace with server-side fetch: GET /api/rates/labour
export default function LabourRatesPage() {
  return <LabourRatesLibrary rates={mockLabourRates} />
}
