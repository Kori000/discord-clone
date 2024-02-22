import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { Message } from '@prisma/client'
import { NextResponse } from 'next/server'

const MESSAGES_BATCH = 10

export async function GET(req: Request) {
  try {
    const profile = await currentProfile()
    const { searchParams } = new URL(req.url)

    const cursor = searchParams.get('cursor')

    const channelId = searchParams.get('channelId')

    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!channelId) {
      return new NextResponse('Channel ID missing', { status: 400 })
    }

    let messages: Message[] = []

    if (cursor) {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createAt: 'desc',
        },
      })
    } else {
      messages = await db.message.findMany({
        take: MESSAGES_BATCH,
        where: {
          channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createAt: 'desc',
        },
      })
    }
    console.log(messages)

    let nextCursor = null

    if (messages.length === MESSAGES_BATCH) {
      nextCursor = messages[MESSAGES_BATCH - 1].id
    }

    console.log(nextCursor)
    return NextResponse.json({
      items: messages,
      nextCursor,
    })
  } catch (error) {
    console.log('[MESSAGES_GET]', error)
    return new NextResponse('Internel Error', { status: 500 })
  }
}