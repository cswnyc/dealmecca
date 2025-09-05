const { PrismaClient } = require('@prisma/client');

async function testEnhancedForumDisplay() {
  try {
    const prisma = new PrismaClient();
    
    console.log('🚀 Testing Enhanced Forum Display...');
    
    // Get Nike company ID
    const nikeCompany = await prisma.company.findFirst({
      where: { name: 'Nike' }
    });
    
    // Get GroupM company ID
    const groupmCompany = await prisma.company.findFirst({
      where: { name: 'GroupM' }
    });
    
    // Get MediaCom company ID
    const mediacomCompany = await prisma.company.findFirst({
      where: { name: 'MediaCom' }
    });
    
    if (!nikeCompany || !groupmCompany || !mediacomCompany) {
      console.error('❌ Required companies not found');
      return;
    }
    
    console.log('✅ Found companies:', {
      nike: nikeCompany.id,
      groupm: groupmCompany.id,
      mediacom: mediacomCompany.id
    });
    
    // Update admin user to be associated with Nike
    const adminUser = await prisma.user.update({
      where: { email: 'admin@dealmecca.pro' },
      data: { companyId: nikeCompany.id }
    });
    
    console.log('✅ Updated admin user to be associated with Nike');
    
    // Get some forum posts
    const posts = await prisma.forumPost.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('✅ Found', posts.length, 'forum posts');
    
    // Enhance the first post with company mentions and tags
    if (posts[0]) {
      // Add company mentions (check for existing first)
      const existingMentions = await prisma.companyMention.findMany({
        where: { postId: posts[0].id }
      });
      
      if (existingMentions.length === 0) {
        await prisma.companyMention.create({
          data: {
            postId: posts[0].id,
            companyId: groupmCompany.id,
            mentionedBy: adminUser.id
          }
        });
        
        await prisma.companyMention.create({
          data: {
            postId: posts[0].id,
            companyId: mediacomCompany.id,
            mentionedBy: adminUser.id
          }
        });
      }
      
      // Update post with enhanced tags
      await prisma.forumPost.update({
        where: { id: posts[0].id },
        data: {
          tags: JSON.stringify(['Q4-2024', 'Marketing', 'Enterprise', 'Campaign']),
          title: 'Nike @ GroupM Partnership Success Story',
          content: 'Amazing collaboration between Nike and GroupM on the latest campaign. MediaCom handled the media buying flawlessly!'
        }
      });
      
      console.log('✅ Enhanced first post with Nike @ GroupM partnership data');
    }
    
    // Enhance the second post
    if (posts[1]) {
      // Add different company mentions
      await prisma.companyMention.create({
        data: {
          postId: posts[1].id,
          companyId: groupmCompany.id,
          mentionedBy: adminUser.id
        }
      });
      
      // Update with different tags
      await prisma.forumPost.update({
        where: { id: posts[1].id },
        data: {
          tags: JSON.stringify(['Programmatic', 'Digital', 'ROI']),
          title: 'Digital Campaign Performance Analysis',
          content: 'Great results from our recent digital programmatic campaign. The ROI exceeded expectations!'
        }
      });
      
      console.log('✅ Enhanced second post with digital campaign data');
    }
    
    // Enhance the third post
    if (posts[2]) {
      // Add multiple company mentions (check for existing first)
      const existingMentions3 = await prisma.companyMention.findMany({
        where: { postId: posts[2].id }
      });
      
      if (existingMentions3.length === 0) {
        await prisma.companyMention.create({
          data: {
            postId: posts[2].id,
            companyId: groupmCompany.id,
            mentionedBy: adminUser.id
          }
        });
        
        await prisma.companyMention.create({
          data: {
            postId: posts[2].id,
            companyId: mediacomCompany.id,
            mentionedBy: adminUser.id
          }
        });
      }
      
      // Update with many tags to test expandable functionality
      await prisma.forumPost.update({
        where: { id: posts[2].id },
        data: {
          tags: JSON.stringify(['Social Media', 'Brand Awareness', 'Video', 'TikTok', 'Instagram', 'YouTube', 'Influencer']),
          title: 'Multi-Platform Social Media Strategy',
          content: 'Executing a comprehensive social media strategy across TikTok, Instagram, and YouTube. Working with top influencers for maximum brand awareness.'
        }
      });
      
      console.log('✅ Enhanced third post with social media strategy data (many tags)');
    }
    
    console.log('\n🎉 Enhanced Forum Display Test Complete!');
    console.log('\n📋 What you should now see on http://localhost:3000/forum:');
    console.log('1. Posts showing "Nike @ GroupM" instead of "Admin User"');
    console.log('2. Expandable tags with "+X more" functionality');
    console.log('3. Company mention badges (blue tags)'); 
    console.log('4. Category tags (gray tags)');
    console.log('5. Professional styling with icons');
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEnhancedForumDisplay();