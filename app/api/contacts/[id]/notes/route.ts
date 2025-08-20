import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get all notes for a contact
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

    // Get all notes for this contact by this user
    const notes = await prisma.contactNote.findMany({
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
      notes
    })

  } catch (error) {
    console.error('Failed to fetch contact notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

// POST - Create new note
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
    const { content, isPrivate, tags } = body

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Note content is required' },
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

    // Create the note
    const note = await prisma.contactNote.create({
      data: {
        contactId,
        userId: session.user.id,
        content: content.trim(),
        isPrivate: isPrivate || false,
        tags: tags || []
      }
    })

    return NextResponse.json({
      success: true,
      note,
      message: 'Note created successfully'
    })

  } catch (error) {
    console.error('Failed to create note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}

// PUT - Update note
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
    const { noteId, content, isPrivate, tags } = body

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingNote = await prisma.contactNote.findFirst({
      where: {
        id: noteId,
        userId: session.user.id
      }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const updatedNote = await prisma.contactNote.update({
      where: { id: noteId },
      data: {
        ...(content !== undefined && { content: content.trim() }),
        ...(isPrivate !== undefined && { isPrivate }),
        ...(tags !== undefined && { tags }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      note: updatedNote,
      message: 'Note updated successfully'
    })

  } catch (error) {
    console.error('Failed to update note:', error)
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
}

// DELETE - Delete note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingNote = await prisma.contactNote.findFirst({
      where: {
        id: noteId,
        userId: session.user.id
      }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    await prisma.contactNote.delete({
      where: { id: noteId }
    })

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}
