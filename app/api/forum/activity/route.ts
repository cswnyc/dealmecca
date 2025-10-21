import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ActivityItem {
  id: string;
  type: 'POST' | 'COMMENT' | 'UPVOTE' | 'POLL';
  user: {
    id: string;
    name: string;
    avatarSeed: string;
    isVIP: boolean;
  };
  post: {
    id: string;
    title: string;
    category: string;
  };
  timestamp: string;
  metadata?: {
    voteCount?: number;
    commentCount?: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent forum posts
    const recentPosts = await prisma.forumPost.findMany({
      where: {
        status: 'APPROVED' // Only show approved posts
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        title: true,
        categoryId: true,
        authorId: true,
        createdAt: true,
        upvotes: true,
        postType: true,
        _count: {
          select: {
            ForumComment: true
          }
        },
        User: {
          select: {
            id: true,
            name: true,
            anonymousUsername: true,
            avatarSeed: true,
            role: true
          }
        },
        ForumCategory: {
          select: {
            name: true
          }
        }
      }
    });

    // Get recent comments
    const recentComments = await prisma.forumComment.findMany({
      where: {
        isDeleted: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        postId: true,
        authorId: true,
        createdAt: true,
        upvotes: true,
        User: {
          select: {
            id: true,
            name: true,
            anonymousUsername: true,
            avatarSeed: true,
            role: true
          }
        },
        ForumPost: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            ForumCategory: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Get recent upvotes on posts
    const recentUpvotes = await prisma.forumVote.findMany({
      where: {
        type: 'UPVOTE'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.floor(limit / 2), // Fewer upvotes to avoid clutter
      select: {
        id: true,
        userId: true,
        postId: true,
        createdAt: true,
        User: {
          select: {
            id: true,
            name: true,
            anonymousUsername: true,
            avatarSeed: true,
            role: true
          }
        },
        ForumPost: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            upvotes: true,
            _count: {
              select: {
                ForumComment: true
              }
            },
            ForumCategory: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Get recent poll votes
    const recentPollVotes = await prisma.pollVote.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: Math.floor(limit / 3), // Even fewer poll votes
      select: {
        id: true,
        userId: true,
        postId: true,
        createdAt: true,
        User: {
          select: {
            id: true,
            name: true,
            anonymousUsername: true,
            avatarSeed: true,
            role: true
          }
        },
        ForumPost: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            ForumCategory: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Transform data into ActivityItem format
    const activities: ActivityItem[] = [];

    // Add posts
    recentPosts.forEach(post => {
      activities.push({
        id: `post-${post.id}`,
        type: 'POST',
        user: {
          id: post.User.id,
          name: post.User.anonymousUsername || post.User.name || 'Anonymous',
          avatarSeed: post.User.avatarSeed || '',
          isVIP: post.User.role === 'PRO' || post.User.role === 'ADMIN'
        },
        post: {
          id: post.id,
          title: post.title,
          category: post.ForumCategory.name
        },
        timestamp: post.createdAt.toISOString(),
        metadata: {
          voteCount: post.upvotes,
          commentCount: post._count.ForumComment
        }
      });
    });

    // Add comments
    recentComments.forEach(comment => {
      activities.push({
        id: `comment-${comment.id}`,
        type: 'COMMENT',
        user: {
          id: comment.User.id,
          name: comment.User.anonymousUsername || comment.User.name || 'Anonymous',
          avatarSeed: comment.User.avatarSeed || '',
          isVIP: comment.User.role === 'PRO' || comment.User.role === 'ADMIN'
        },
        post: {
          id: comment.ForumPost.id,
          title: comment.ForumPost.title,
          category: comment.ForumPost.ForumCategory.name
        },
        timestamp: comment.createdAt.toISOString(),
        metadata: {
          voteCount: comment.upvotes
        }
      });
    });

    // Add upvotes
    recentUpvotes.forEach(vote => {
      activities.push({
        id: `upvote-${vote.id}`,
        type: 'UPVOTE',
        user: {
          id: vote.User.id,
          name: vote.User.anonymousUsername || vote.User.name || 'Anonymous',
          avatarSeed: vote.User.avatarSeed || '',
          isVIP: vote.User.role === 'PRO' || vote.User.role === 'ADMIN'
        },
        post: {
          id: vote.ForumPost.id,
          title: vote.ForumPost.title,
          category: vote.ForumPost.ForumCategory.name
        },
        timestamp: vote.createdAt.toISOString(),
        metadata: {
          voteCount: vote.ForumPost.upvotes,
          commentCount: vote.ForumPost._count.ForumComment
        }
      });
    });

    // Add poll votes
    recentPollVotes.forEach(vote => {
      activities.push({
        id: `poll-${vote.id}`,
        type: 'POLL',
        user: {
          id: vote.User.id,
          name: vote.User.anonymousUsername || vote.User.name || 'Anonymous',
          avatarSeed: vote.User.avatarSeed || '',
          isVIP: vote.User.role === 'PRO' || vote.User.role === 'ADMIN'
        },
        post: {
          id: vote.ForumPost.id,
          title: vote.ForumPost.title,
          category: vote.ForumPost.ForumCategory.name
        },
        timestamp: vote.createdAt.toISOString()
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Limit to requested number
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({
      activities: limitedActivities,
      total: activities.length
    });

  } catch (error) {
    console.error('Error fetching forum activity:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch forum activity',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
