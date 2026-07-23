import { describe, expect, it } from 'vitest'

import { canManageRole, hasPermission } from './permissions'

describe('role permissions', () => {
  it('allows only administrators to manage users', () => {
    expect(hasPermission('Admin', 'manageUsers')).toBe(true)
    expect(hasPermission('Director', 'manageUsers')).toBe(false)
    expect(hasPermission('Estimating Manager', 'manageUsers')).toBe(false)
  })

  it('allows directors and administrators to manage organisation settings', () => {
    expect(hasPermission('Admin', 'manageOrganisation')).toBe(true)
    expect(hasPermission('Director', 'manageOrganisation')).toBe(true)
    expect(hasPermission('Senior Estimator', 'manageOrganisation')).toBe(false)
  })

  it('prevents an administrator from changing another administrator', () => {
    expect(canManageRole('Admin', 'Admin')).toBe(false)
    expect(canManageRole('Admin', 'Estimator')).toBe(true)
    expect(canManageRole('Director', 'Estimator')).toBe(false)
  })
})
