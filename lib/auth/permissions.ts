import type { UserRole } from '@/lib/types'

export const PERMISSIONS = {
  manageOrganisation: ['Admin', 'Director'],
  manageUsers: ['Admin'],
  viewCommercials: ['Admin', 'Director', 'Estimating Manager', 'Senior Estimator'],
  createEnquiries: [
    'Admin',
    'Director',
    'Estimating Manager',
    'Senior Estimator',
    'Estimator',
  ],
} as const satisfies Record<string, readonly UserRole[]>

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(role: UserRole, permission: Permission) {
  return PERMISSIONS[permission].includes(role as never)
}

export function canManageRole(actorRole: UserRole, targetRole: UserRole) {
  if (actorRole !== 'Admin') {
    return false
  }

  return targetRole !== 'Admin'
}
