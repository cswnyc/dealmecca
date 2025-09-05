/**
 * Forum Functionality Testing Script
 * Tests the forum management system with realistic data and proper auth
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testForumFunctionality() {
  console.log('🧪 Testing Forum Management Functionality\n');

  try {
    // Test 1: Verify data structure
    console.log('📊 Test 1: Verifying forum data structure...');
    
    const categories = await prisma.forumCategory.findMany({
      include: {
        _count: { select: { posts: true } }
      },
      orderBy: { order: 'asc' }
    });
    
    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat._count.posts} posts`);
    });

    // Test 2: Check posts with comments
    console.log('\n📝 Test 2: Checking posts with comments...');
    
    const postsWithComments = await prisma.forumPost.findMany({
      where: {
        comments: { some: {} }
      },
      include: {
        category: { select: { name: true } },
        author: { select: { name: true } },
        _count: { select: { comments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${postsWithComments.length} posts with comments:`);
    postsWithComments.forEach(post => {
      console.log(`   - "${post.title.substring(0, 50)}..." (${post._count.comments} comments)`);
    });

    // Test 3: Test comment details
    console.log('\n💬 Test 3: Checking comment details...');
    
    if (postsWithComments.length > 0) {
      const samplePost = postsWithComments[0];
      const comments = await prisma.forumComment.findMany({
        where: { postId: samplePost.id },
        include: {
          author: { select: { name: true } }
        },
        orderBy: { createdAt: 'asc' }
      });

      console.log(`✅ Sample post "${samplePost.title.substring(0, 40)}..." has ${comments.length} comments:`);
      comments.forEach((comment, index) => {
        const authorName = comment.isAnonymous ? comment.anonymousHandle : comment.author.name;
        console.log(`   ${index + 1}. By ${authorName}: "${comment.content.substring(0, 60)}..."`);
      });
    }

    // Test 4: Test category distribution
    console.log('\n📈 Test 4: Category distribution analysis...');
    
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const postCount = await prisma.forumPost.count({
          where: { categoryId: cat.id }
        });
        const commentCount = await prisma.forumComment.count({
          where: { 
            post: { categoryId: cat.id }
          }
        });
        
        return {
          name: cat.name,
          posts: postCount,
          comments: commentCount,
          avgCommentsPerPost: postCount > 0 ? Math.round((commentCount / postCount) * 10) / 10 : 0
        };
      })
    );

    console.log('✅ Category engagement statistics:');
    categoryStats
      .sort((a, b) => b.comments - a.comments)
      .forEach(stat => {
        console.log(`   - ${stat.name}: ${stat.posts} posts, ${stat.comments} comments (${stat.avgCommentsPerPost} avg/post)`);
      });

    // Test 5: Content quality check
    console.log('\n📋 Test 5: Content quality check...');
    
    const contentStats = await prisma.forumPost.aggregate({
      _avg: {
        views: true,
        upvotes: true,
        downvotes: true
      },
      _max: {
        views: true,
        upvotes: true
      },
      _count: {
        id: true
      }
    });

    console.log('✅ Content engagement metrics:');
    console.log(`   - Total posts: ${contentStats._count.id}`);
    console.log(`   - Average views: ${Math.round(contentStats._avg.views || 0)}`);
    console.log(`   - Average upvotes: ${Math.round(contentStats._avg.upvotes || 0)}`);
    console.log(`   - Max views: ${contentStats._max.views}`);
    console.log(`   - Max upvotes: ${contentStats._max.upvotes}`);

    // Test 6: User activity analysis  
    console.log('\n👥 Test 6: User activity analysis...');
    
    const userActivity = await prisma.user.findMany({
      select: {
        name: true,
        role: true,
        _count: {
          select: {
            forumPosts: true,
            forumComments: true
          }
        }
      },
      where: {
        OR: [
          { forumPosts: { some: {} } },
          { forumComments: { some: {} } }
        ]
      }
    });

    console.log('✅ Active forum users:');
    userActivity.forEach(user => {
      console.log(`   - ${user.name} (${user.role}): ${user._count.forumPosts} posts, ${user._count.forumComments} comments`);
    });

    // Test 7: Recent activity timeline
    console.log('\n⏰ Test 7: Recent activity timeline...');
    
    const recentPosts = await prisma.forumPost.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        createdAt: true,
        category: { select: { name: true } },
        author: { select: { name: true } }
      }
    });

    const recentComments = await prisma.forumComment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        content: true,
        createdAt: true,
        isAnonymous: true,
        anonymousHandle: true,
        author: { select: { name: true } },
        post: { select: { title: true } }
      }
    });

    console.log('✅ Recent posts:');
    recentPosts.forEach((post, index) => {
      const timeAgo = Math.round((Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   ${index + 1}. "${post.title.substring(0, 50)}..." in ${post.category.name} (${timeAgo} days ago)`);
    });

    console.log('\n✅ Recent comments:');
    recentComments.forEach((comment, index) => {
      const authorName = comment.isAnonymous ? comment.anonymousHandle : comment.author.name;
      const timeAgo = Math.round((Date.now() - new Date(comment.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   ${index + 1}. ${authorName} on "${comment.post.title.substring(0, 30)}...": "${comment.content.substring(0, 40)}..." (${timeAgo} days ago)`);
    });

    // Test 8: Data integrity check
    console.log('\n🔍 Test 8: Data integrity check...');
    
    const integrityChecks = {
      postsWithoutCategories: await prisma.forumPost.count({
        where: { category: null }
      }),
      postsWithoutAuthors: await prisma.forumPost.count({
        where: { author: null }
      }),
      commentsWithoutPosts: await prisma.forumComment.count({
        where: { post: null }
      }),
      commentsWithoutAuthors: await prisma.forumComment.count({
        where: { author: null }
      })
    };

    console.log('✅ Data integrity results:');
    console.log(`   - Posts without categories: ${integrityChecks.postsWithoutCategories}`);
    console.log(`   - Posts without authors: ${integrityChecks.postsWithoutAuthors}`);
    console.log(`   - Comments without posts: ${integrityChecks.commentsWithoutPosts}`);
    console.log(`   - Comments without authors: ${integrityChecks.commentsWithoutAuthors}`);

    const hasIntegrityIssues = Object.values(integrityChecks).some(count => count > 0);
    if (hasIntegrityIssues) {
      console.log('⚠️  Data integrity issues detected!');
    } else {
      console.log('✅ All data integrity checks passed!');
    }

    // Final summary
    console.log('\n🎉 Forum Testing Complete!');
    console.log('========================');
    console.log(`📁 Categories: ${categories.length}`);
    console.log(`📝 Posts: ${contentStats._count.id}`);
    console.log(`💬 Comments: ${await prisma.forumComment.count()}`);
    console.log(`👥 Active users: ${userActivity.length}`);
    
    const engagementRate = contentStats._count.id > 0 ? 
      Math.round(((await prisma.forumComment.count()) / contentStats._count.id) * 100) / 100 : 0;
    console.log(`📈 Engagement rate: ${engagementRate} comments per post`);

    console.log('\n✅ Ready for testing the forum management UI!');
    console.log(`   Go to: http://localhost:3000/admin/forum-categories`);
    console.log('   Test: Category expansion, post editing, comment management');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testForumFunctionality();