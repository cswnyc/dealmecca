import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testBookmarksQuery() {
  try {
    const userId = "DysEp8gCwAYEhRBJvppGx929P2v2"; // User from database check

    console.log('Testing bookmarks query...\n');

    const bookmarks = await prisma.forumBookmark.findMany({
      where: {
        userId: userId
      },
      include: {
        ForumPost: {
          include: {
            User: {
              include: {
                company: true
              }
            },
            ForumCategory: true,
            CompanyMention: {
              include: {
                company: true
              }
            },
            ContactMention: {
              include: {
                contact: true
              }
            },
            TopicMention: {
              include: {
                Topic: {
                  include: {
                    TopicCompany: {
                      include: {
                        company: {
                          select: {
                            id: true,
                            name: true,
                            logoUrl: true,
                            verified: true,
                            companyType: true,
                            industry: true,
                            city: true,
                            state: true,
                          }
                        }
                      }
                    },
                    TopicContact: {
                      include: {
                        contact: {
                          select: {
                            id: true,
                            fullName: true,
                            title: true,
                            company: {
                              select: {
                                id: true,
                                name: true,
                                logoUrl: true,
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            _count: {
              select: {
                ForumComment: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Query successful! Found ${bookmarks.length} bookmarks\n`);

    if (bookmarks.length > 0) {
      console.log('First bookmark:', JSON.stringify(bookmarks[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Query failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBookmarksQuery();
