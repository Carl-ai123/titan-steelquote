import { CustomersDirectory } from '@/components/customers/customers-directory'
import { mockCustomers } from '@/lib/mock-data'

// TODO: Replace with server-side fetch: GET /api/customers
export default function CustomersPage() {
  return <CustomersDirectory customers={mockCustomers} />
}
