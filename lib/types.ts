// Core domain types for Titan SteelQuote

/**
 * Canonical enquiry statuses — single source of truth for the whole application.
 * Do NOT add statuses here without updating STATUS_TRANSITIONS and StatusBadge.
 */
export const ENQUIRY_STATUSES = [
  'New',
  'Reviewing',
  'Estimating',
  'Awaiting Clarification',
  'Internal Approval',
  'Quoted',
  'Won',
  'Lost',
  'Withdrawn',
] as const

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]

/** Ordered workflow stages — used to drive progress indicators */
export const WORKFLOW_STAGES = [
  'New',
  'Reviewing',
  'Estimating',
  'Awaiting Clarification',
  'Internal Approval',
  'Quoted',
  'Won',
] as const satisfies readonly EnquiryStatus[]

/** Terminal statuses that cannot progress further */
export const TERMINAL_STATUSES: EnquiryStatus[] = ['Won', 'Lost', 'Withdrawn']

/** Live/active statuses for dashboard value calculations */
export const LIVE_STATUSES: EnquiryStatus[] = [
  'New',
  'Reviewing',
  'Estimating',
  'Awaiting Clarification',
  'Internal Approval',
  'Quoted',
]

/**
 * Permitted workflow transitions.
 *
 * This is the single source of truth for UI controls today and will also be
 * enforced by the server when persistence is introduced.
 */
export const STATUS_TRANSITIONS: Record<EnquiryStatus, readonly EnquiryStatus[]> = {
  New: ['Reviewing', 'Withdrawn'],
  Reviewing: ['Estimating', 'Awaiting Clarification', 'Withdrawn'],
  Estimating: ['Awaiting Clarification', 'Internal Approval', 'Withdrawn'],
  'Awaiting Clarification': ['Reviewing', 'Estimating', 'Withdrawn'],
  'Internal Approval': ['Estimating', 'Quoted', 'Withdrawn'],
  Quoted: ['Won', 'Lost', 'Estimating', 'Withdrawn'],
  Won: [],
  Lost: [],
  Withdrawn: [],
}

export type EnquirySource =
  | 'Client Direct'
  | 'Main Contractor'
  | 'Architect'
  | 'Structural Engineer'
  | 'Framework Agreement'
  | 'Tender Portal'
  | 'Referral'

export interface Customer {
  id: string
  name: string
  type: 'Main Contractor' | 'Developer' | 'Private Client' | 'Public Sector' | 'Subcontractor'
  address: string
  city: string
  postcode: string
  country: string
  primaryContact: string
  email: string
  phone: string
  website?: string
  notes?: string
  activeEnquiries: number
  wonJobs: number
  totalValue: number
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  customerId: string
  name: string
  role: string
  email: string
  phone: string
  isPrimary: boolean
}

export interface Enquiry {
  id: string
  enquiryNumber: string
  customerId: string
  customerName: string
  project: string
  projectAddress: string
  contactId?: string
  contactName?: string
  receivedDate: string
  tenderDeadline: string
  estimatorId: string
  estimatorName: string
  status: EnquiryStatus
  source: EnquirySource
  estimatedValue?: number
  probability: number
  description: string
  notes?: string
  inclusions?: string[]
  exclusions?: string[]
  assumptions?: string[]
  paymentTerms?: string
  quoteValidity?: string
  lastUpdated: string
  createdAt: string
  documents: Document[]
  revisions: QuoteRevision[]
}

export interface Document {
  id: string
  enquiryId: string
  name: string
  type: 'Drawing' | 'Specification' | 'BOM' | 'Quote' | 'Correspondence' | 'Other'
  size: string
  uploadedBy: string
  uploadedAt: string
  url?: string
}

export interface SteelMaterialLine {
  id: string
  enquiryId: string
  mark: string
  section: string
  grade: string
  lengthMm: number
  quantity: number
  unitWeightKgm: number
  totalWeightKg: number
  pricePerTonne: number
  wastePercent: number
  totalCost: number
  validationStatus: 'Valid' | 'Warning' | 'Error'
  validationMessage?: string
}

export interface LabourOperation {
  id: string
  enquiryId: string
  operation: string
  description: string
  quantity: number
  setupHours: number
  unitHours: number
  totalHours: number
  hourlyRate: number
  totalLabourCost: number
}

export interface EstimateSummary {
  id: string
  enquiryId: string
  revision: number
  materials: number
  labour: number
  consumables: number
  coating: number
  subcontracting: number
  transport: number
  plant: number
  overheadPercent: number
  overheadValue: number
  contingencyPercent: number
  contingencyValue: number
  totalEstimatedCost: number
  targetMarginPercent: number
  sellingPrice: number
  profit: number
  effectiveMarginPercent: number
  status: 'Draft' | 'Submitted for Approval' | 'Approved' | 'Rejected'
  createdAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface QuoteRevision {
  id: string
  enquiryId: string
  quoteNumber: string
  revision: number
  sellingPrice: number
  status: 'Draft' | 'Issued' | 'Accepted' | 'Declined' | 'Superseded'
  issuedAt?: string
  validUntil?: string
  createdAt: string
}

export interface ActivityEntry {
  id: string
  enquiryId: string
  userId: string
  userName: string
  action: string
  detail?: string
  timestamp: string
  type: 'status_change' | 'comment' | 'document' | 'estimate' | 'quote' | 'edit'
}

export interface MaterialRate {
  id: string
  section: string
  grade: string
  supplier: string
  pricePerTonne: number
  wasteAllowancePercent: number
  effectiveDate: string
  expiryDate?: string
  status: 'Current' | 'Expired'
  notes?: string
}

export interface LabourRate {
  id: string
  operation: string
  description: string
  hourlyRate: number
  setupTimeHours: number
  unitTimeHours: number
  effectiveDate: string
  expiryDate?: string
  status: 'Current' | 'Expired'
  notes?: string
}

export interface User {
  id: string
  name: string
  initials: string
  role: 'Estimator' | 'Senior Estimator' | 'Estimating Manager' | 'Director' | 'Admin'
  email: string
  active: boolean
}

export interface OrgSettings {
  companyName: string
  tradingName?: string
  address: string
  city: string
  postcode: string
  phone: string
  email: string
  website?: string
  vatNumber: string
  companyNumber: string
  logoUrl?: string
  quotePrefix: string
  quoteStartNumber: number
  defaultOverheadPercent: number
  defaultMarginPercent: number
  defaultContingencyPercent: number
  defaultPaymentTerms: string
  defaultQuoteValidity: string
  vatRate: number
  defaultInclusions: string[]
  defaultExclusions: string[]
  defaultAssumptions: string[]
}
