import { currentProfilePages } from '@/lib/current-profile-pages'
import { db } from '@/lib/db'
import { NextApiResponseServerIo } from '@/types'
import { MemberRole } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (req.method !== 'DELETE' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const profile = await currentProfilePages(req)

    const { conversationId, directMessageId } = req.query

    const { content } = req.body

    if (!profile) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID missing' })
    }
    if (!directMessageId) {
      return res.status(400).json({ error: 'DirectMessageId ID missing' })
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!conversation) {
      return res.status(400).json({
        errror: 'Conversation not found',
      })
    }

    // 自己
    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo

    if (!member) {
      return res.status(400).json({
        errror: 'Member not found',
      })
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!directMessage || directMessage.deleted) {
      return res.status(400).json({
        errror: 'Message not found',
      })
    }

    const isMessageOwner = directMessage.memberId === member.id

    const isAdmin = member.role === MemberRole.ADMIN
    const isModerator = member.role === MemberRole.MODERATOR
    const canModify = isAdmin || isModerator || isMessageOwner

    if (!canModify) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    if (req.method === 'DELETE') {
      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          fileUrl: null,
          content: 'This message has been deleted.',
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      })
    }

    if (req.method === 'PATCH') {
      if (!isMessageOwner) {
        return res.status(403).json({
          error: 'Unauthorized',
        })
      }
      directMessage = await db.directMessage.update({
        where: {
          id: directMessageId as string,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      })
    }

    const updateKey = `chat:${conversationId}:messages:update`

    res?.socket?.server?.io?.emit(updateKey, directMessage)

    return res.status(200).json(directMessage)
  } catch (error) {
    console.log('[DIRECT_MESSAGE_ID]', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
