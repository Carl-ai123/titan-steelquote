import { MaterialRatesLibrary } from '@/components/rates/material-rates-library'
import { mockMaterialRates } from '@/lib/mock-data'

// TODO: Replace with server-side fetch: GET /api/rates/materials
export default function MaterialRatesPage() {
  return <MaterialRatesLibrary rates={mockMaterialRates} />
}
