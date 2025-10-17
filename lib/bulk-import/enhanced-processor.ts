import { PrismaClient } from '@prisma/client'
import { findCompanyDuplicates, findContactDuplicates } from './duplicate-detection'
import { prepareCompanyForDatabase, normalizeEmail } from '@/lib/normalization-utils'
import { getCompanyLogoUrl, getContactPhotoUrl } from '@/lib/logo-utils'

const prisma = new PrismaClient()

// Import data interface
export interface ImportData {
  // Company fields
  companyName: string
  domain?: string
  website?: string
  industry?: string
  employeeCount?: number
  revenue?: string
  headquarters?: string
  description?: string
  companyType?: string
  
  // Contact fields
  firstName: string
  lastName: string
  email?: string
  phone?: string
  title: string
  department?: string
  seniority?: string
  linkedinUrl?: string
  isDecisionMaker?: boolean
}

// Results interface
export interface BulkImportResults {
  companiesCreated: number
  companiesUpdated: number
  contactsCreated: number
  contactsUpdated: number
  duplicatesFound: number
  merged: number
  errors: string[]
  warnings: string[]
  executionTime: number
}

// Enhanced bulk import with intelligent duplicate handling and data merging
export async function processBulkImport(data: ImportData[]): Promise<BulkImportResults> {
  const startTime = Date.now()
  
  const results: BulkImportResults = {
    companiesCreated: 0,
    companiesUpdated: 0,
    contactsCreated: 0,
    contactsUpdated: 0,
    duplicatesFound: 0,
    merged: 0,
    errors: [],
    warnings: [],
    executionTime: 0
  }

  console.log(`🚀 Starting enhanced bulk import for ${data.length} records...`)

  for (let i = 0; i < data.length; i++) {
    const record = data[i]
    
    try {
      console.log(`📊 Processing record ${i + 1}/${data.length}: ${record.companyName} - ${record.firstName} ${record.lastName}`)

      // STEP 1: Handle company duplicate detection and merging
      const existingCompany = await findCompanyDuplicates({
        name: record.companyName,
        website: record.domain || record.website
      })

      let company
      if (existingCompany) {
        console.log(`🔄 Found existing company: ${existingCompany.name}`)
        
        // Intelligent data merging - only update fields with better/new data
        const updateData: any = {
          updatedAt: new Date()
        }

        // Smart field merging logic
        if (record.industry && record.industry !== existingCompany.industry) {
          updateData.industry = record.industry
        }
        if (record.employeeCount && String(record.employeeCount) !== String(existingCompany.employeeCount)) {
          updateData.employeeCount = record.employeeCount
        }
        if (record.revenue && record.revenue !== existingCompany.revenue) {
          updateData.revenue = record.revenue
        }
        if (record.headquarters && record.headquarters !== existingCompany.headquarters) {
          updateData.headquarters = record.headquarters
        }
        if (record.description && record.description !== existingCompany.description) {
          updateData.description = record.description
        }
        if ((record.domain || record.website) &&
            (record.domain || record.website) !== existingCompany.website) {
          updateData.website = record.domain || record.website
        }
        if (record.companyType && record.companyType !== existingCompany.companyType) {
          updateData.companyType = record.companyType
        }

        // Add logo if missing
        if (!existingCompany.logoUrl && (record.domain || record.website)) {
          const logoUrl = getCompanyLogoUrl(record.domain || record.website, record.companyName)
          if (logoUrl) {
            updateData.logoUrl = logoUrl
          }
        }

        // Update normalized fields if data changed
        if (Object.keys(updateData).length > 1) { // More than just updatedAt
          const normalizedData = prepareCompanyForDatabase({
            ...existingCompany,
            ...updateData
          })
          
          company = await prisma.company.update({
            where: { id: existingCompany.id },
            data: normalizedData
          })
          
          results.companiesUpdated++
          results.merged++
          console.log(`✅ Updated existing company with new data`)
        } else {
          company = existingCompany
          results.warnings.push(`Company "${record.companyName}" found but no new data to merge`)
        }
        
        results.duplicatesFound++
      } else {
        console.log(`🆕 Creating new company: ${record.companyName}`)
        
        // Create new company with normalization
        company = await createCompanyWithNormalization(record)
        results.companiesCreated++
        console.log(`✅ Created new company`)
      }

      // STEP 2: Handle contact duplicate detection and merging
      const existingContact = await findContactDuplicates({
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        companyId: company.id
      })

      if (existingContact) {
        console.log(`🔄 Found existing contact: ${existingContact.firstName} ${existingContact.lastName}`)
        
        // Update existing contact with merge logic
        await updateContactWithMerge(existingContact.id, record)
        results.contactsUpdated++
        results.duplicatesFound++
        results.merged++
        console.log(`✅ Updated existing contact with new data`)
      } else {
        console.log(`🆕 Creating new contact: ${record.firstName} ${record.lastName}`)
        
        // Create new contact
        await createContactWithValidation(record, company.id)
        results.contactsCreated++
        console.log(`✅ Created new contact`)
      }

    } catch (error) {
      const errorMsg = `Record ${i + 1} (${record.companyName} - ${record.firstName} ${record.lastName}): ${error instanceof Error ? error.message : 'Unknown error'}`
      results.errors.push(errorMsg)
      console.error(`❌ Error processing record:`, errorMsg)
    }
  }

  results.executionTime = Date.now() - startTime
  
  console.log(`🎉 Enhanced bulk import completed!`)
  console.log(`📊 Results:`)
  console.log(`   - Companies: ${results.companiesCreated} created, ${results.companiesUpdated} updated`)
  console.log(`   - Contacts: ${results.contactsCreated} created, ${results.contactsUpdated} updated`)
  console.log(`   - Duplicates found: ${results.duplicatesFound}`)
  console.log(`   - Records merged: ${results.merged}`)
  console.log(`   - Errors: ${results.errors.length}`)
  console.log(`   - Execution time: ${results.executionTime}ms`)

  return results
}

// Helper function to create company with normalization
async function createCompanyWithNormalization(record: ImportData) {
  // Generate logo URL
  const logoUrl = getCompanyLogoUrl(
    record.domain || record.website,
    record.companyName
  )

  const companyData = prepareCompanyForDatabase({
    name: record.companyName,
    slug: record.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
    website: record.domain || record.website,
    logoUrl: logoUrl, // Add generated logo
    industry: record.industry,
    employeeCount: record.employeeCount,
    revenue: record.revenue,
    headquarters: record.headquarters,
    description: record.description,
    companyType: record.companyType || 'ADVERTISER',
    dataQuality: 'BASIC',
    verified: false
  })

  return await prisma.company.create({
    data: companyData as any
  })
}

// Helper function to update contact with intelligent merging
async function updateContactWithMerge(contactId: string, record: ImportData) {
  // Fetch existing contact to check for uploaded photos
  const existingContact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { logoUrl: true }
  })

  const updateData: any = {
    updatedAt: new Date()
  }

  // Smart field merging - only update if we have better/new data
  if (record.email && record.email.trim()) {
    updateData.email = normalizeEmail(record.email)
  }
  if (record.phone && record.phone.trim()) {
    updateData.phone = record.phone.trim()
  }
  if (record.title && record.title.trim()) {
    updateData.title = record.title.trim()
  }
  if (record.department) {
    updateData.department = mapDepartmentValue(record.department) as any
  }
  if (record.seniority) {
    updateData.seniority = mapSeniorityValue(record.seniority) as any
  }
  if (record.linkedinUrl && record.linkedinUrl.trim()) {
    updateData.linkedinUrl = record.linkedinUrl.trim()
  }
  if (typeof record.isDecisionMaker === 'boolean') {
    updateData.isDecisionMaker = record.isDecisionMaker
  }

  // Generate photo URL, but only update if no uploaded photo exists (preserve manual uploads)
  if (!existingContact?.logoUrl || existingContact.logoUrl.includes('dicebear')) {
    const photoUrl = getContactPhotoUrl(
      record.firstName,
      record.lastName,
      record.email
    )
    updateData.logoUrl = photoUrl
  }

  // Only update if there are actual changes
  if (Object.keys(updateData).length > 1) { // More than just updatedAt
    await prisma.contact.update({
      where: { id: contactId },
      data: updateData
    })
  }
}

// Helper function to create contact with validation
async function createContactWithValidation(record: ImportData, companyId: string) {
  // Generate photo URL with Gravatar/DiceBear fallback
  const photoUrl = getContactPhotoUrl(
    record.firstName,
    record.lastName,
    record.email
  )

  const contactData = {
    firstName: record.firstName.trim(),
    lastName: record.lastName.trim(),
    fullName: `${record.firstName.trim()} ${record.lastName.trim()}`,
    title: record.title.trim(),
    email: record.email ? normalizeEmail(record.email) : null,
    phone: record.phone?.trim() || null,
    linkedinUrl: record.linkedinUrl?.trim() || null,
    logoUrl: photoUrl, // Add generated photo
    department: mapDepartmentValue(record.department) as any,
    seniority: mapSeniorityValue(record.seniority) || 'SPECIALIST' as any,
    isDecisionMaker: record.isDecisionMaker || false,
    companyId,
    verified: false,
    isActive: true,
    dataQuality: 'BASIC',
    preferredContact: record.email ? 'EMAIL' : 'PHONE'
  }

  return await prisma.contact.create({
    data: contactData as any
  })
}

// Department mapping function (same as existing APIs)
function mapDepartmentValue(inputDepartment?: string): string | undefined {
  if (!inputDepartment) return undefined
  
  const deptLower = inputDepartment.toLowerCase().trim()
  const departmentMap: Record<string, string> = {
    'marketing': 'MARKETING',
    'media planning': 'MEDIA_PLANNING',
    'media buying': 'MEDIA_BUYING',
    'digital marketing': 'DIGITAL_MARKETING',
    'programmatic': 'PROGRAMMATIC',
    'social media': 'SOCIAL_MEDIA',
    'search marketing': 'SEARCH_MARKETING',
    'strategy': 'STRATEGY_PLANNING',
    'analytics': 'ANALYTICS_INSIGHTS',
    'creative': 'CREATIVE_SERVICES',
    'account management': 'ACCOUNT_MANAGEMENT',
    'business development': 'BUSINESS_DEVELOPMENT',
    'operations': 'OPERATIONS',
    'technology': 'TECHNOLOGY',
    'finance': 'FINANCE',
    'leadership': 'LEADERSHIP',
    'hr': 'HUMAN_RESOURCES',
    'sales': 'SALES',
    'product': 'PRODUCT',
    'data science': 'DATA_SCIENCE'
  }
  
  return departmentMap[deptLower] || 'MARKETING'
}

// Seniority mapping function (same as existing APIs)
function mapSeniorityValue(inputSeniority?: string): string | undefined {
  if (!inputSeniority) return undefined
  
  const seniorityLower = inputSeniority.toLowerCase().trim()
  const seniorityMap: Record<string, string> = {
    'coordinator': 'COORDINATOR',
    'specialist': 'SPECIALIST',
    'senior specialist': 'SENIOR_SPECIALIST',
    'manager': 'MANAGER',
    'senior manager': 'SENIOR_MANAGER',
    'director': 'DIRECTOR',
    'senior director': 'SENIOR_DIRECTOR',
    'vp': 'VP',
    'svp': 'SVP',
    'c-level': 'C_LEVEL',
    'ceo': 'C_LEVEL',
    'cmo': 'C_LEVEL',
    'cto': 'C_LEVEL',
    'president': 'C_LEVEL'
  }
  
  return seniorityMap[seniorityLower] || 'SPECIALIST'
}

export default processBulkImport
