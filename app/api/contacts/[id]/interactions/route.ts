import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, InteractionType } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get all interactions for a contact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contactId } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: { company: { select: { name: true } } }
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    // Get all interactions for this contact by this user
    const interactions = await prisma.contactInteraction.findMany({
      where: {
        contactId,
        userId: session.user.id
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        name: contact.fullName,
        company: contact.company.name
      },
      interactions
    })

  } catch (error) {
    console.error('Failed to fetch contact interactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    )
  }
}

// POST - Create new interaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: contactId } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, notes, outcome, followUpAt, scheduledAt } = body

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { error: 'Interaction type is required' },
        { status: 400 }
      )
    }

    // Verify contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    // Validate interaction type
    const validTypes = Object.values(InteractionType)
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      )
    }

    // Create the interaction
    const interaction = await prisma.contactInteraction.create({
      data: {
        contactId,
        userId: session.user.id,
        type,
        notes,
        outcome,
        followUpAt: followUpAt ? new Date(followUpAt) : undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        completedAt: new Date() // Mark as completed now
      }
    })

    // Update contact status if this is the first interaction
    const contactStatus = await prisma.contactStatus.findUnique({
      where: { contactId }
    })

    if (!contactStatus) {
      await prisma.contactStatus.create({
        data: {
          contactId,
          userId: session.user.id,
          status: 'CONTACTED',
          lastActivity: new Date()
        }
      })
    } else {
      await prisma.contactStatus.update({
        where: { contactId },
        data: {
          status: 'CONTACTED',
          lastActivity: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      interaction,
      message: 'Interaction recorded successfully'
    })

  } catch (error) {
    console.error('Failed to create interaction:', error)
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500 }
    )
  }
}

// PUT - Update interaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { interactionId, notes, outcome, followUpAt, completedAt } = body

    if (!interactionId) {
      return NextResponse.json(
        { error: 'Interaction ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingInteraction = await prisma.contactInteraction.findFirst({
      where: {
        id: interactionId,
        userId: session.user.id
      }
    })

    if (!existingInteraction) {
      return NextResponse.json(
        { error: 'Interaction not found' },
        { status: 404 }
      )
    }

    const updatedInteraction = await prisma.contactInteraction.update({
      where: { id: interactionId },
      data: {
        ...(notes !== undefined && { notes }),
        ...(outcome !== undefined && { outcome }),
        ...(followUpAt !== undefined && { followUpAt: followUpAt ? new Date(followUpAt) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      interaction: updatedInteraction,
      message: 'Interaction updated successfully'
    })

  } catch (error) {
    console.error('Failed to update interaction:', error)
    return NextResponse.json(
      { error: 'Failed to update interaction' },
      { status: 500 }
    )
  }
}
