/**
 * Comprehensive Forum API Testing Script
 * Tests all CRUD operations for forum posts and comments
 */

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

class ForumAPITester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        status: 'PASS',
        message: 'Test completed successfully',
        duration
      });
      console.log(`✅ ${testName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      console.log(`❌ ${testName} (${duration}ms): ${error}`);
    }
  }

  private async makeRequest(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'admin-test-user', // Mock admin user
        ...options.headers
      },
      ...options
    });
    return response;
  }

  // Test 1: Get forum posts by category
  async testGetPostsByCategory() {
    await this.runTest('GET /api/forum/posts?categoryId=...', async () => {
      // First, get a category ID
      const categoriesResponse = await this.makeRequest('/api/admin/forum/categories');
      if (!categoriesResponse.ok) throw new Error('Failed to get categories');
      
      const categories = await categoriesResponse.json();
      if (categories.length === 0) throw new Error('No categories found');
      
      const categoryId = categories[0].id;
      
      // Test getting posts for this category
      const response = await this.makeRequest(`/api/forum/posts?categoryId=${categoryId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (!data.posts || !Array.isArray(data.posts)) {
        throw new Error('Invalid response structure');
      }
      
      if (!data.pagination) {
        throw new Error('Missing pagination data');
      }
    });
  }

  // Test 2: Get individual post
  async testGetSinglePost() {
    await this.runTest('GET /api/forum/posts/[id]', async () => {
      // Get a post ID first
      const response = await this.makeRequest('/api/forum/posts?limit=1');
      if (!response.ok) throw new Error('Failed to get posts');
      
      const data = await response.json();
      if (!data.posts || data.posts.length === 0) throw new Error('No posts found');
      
      const postId = data.posts[0].id;
      
      // Test getting individual post
      const postResponse = await this.makeRequest(`/api/forum/posts/${postId}`);
      if (!postResponse.ok) throw new Error(`HTTP ${postResponse.status}`);
      
      const post = await postResponse.json();
      if (!post.id || !post.title || !post.content) {
        throw new Error('Invalid post structure');
      }
    });
  }

  // Test 3: Update post (PATCH)
  async testUpdatePost() {
    await this.runTest('PATCH /api/forum/posts/[id]', async () => {
      // Get a post to update
      const response = await this.makeRequest('/api/forum/posts?limit=1');
      if (!response.ok) throw new Error('Failed to get posts');
      
      const data = await response.json();
      if (!data.posts || data.posts.length === 0) throw new Error('No posts found');
      
      const post = data.posts[0];
      const originalTitle = post.title;
      const updatedTitle = `[UPDATED] ${originalTitle}`;
      
      // Update the post
      const updateResponse = await this.makeRequest(`/api/forum/posts/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: updatedTitle,
          content: post.content + '\n\n[Updated via API test]'
        })
      });
      
      if (!updateResponse.ok) throw new Error(`HTTP ${updateResponse.status}`);
      
      const updatedPost = await updateResponse.json();
      if (updatedPost.title !== updatedTitle) {
        throw new Error('Post title was not updated correctly');
      }
      
      // Restore original title
      await this.makeRequest(`/api/forum/posts/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: originalTitle,
          content: post.content
        })
      });
    });
  }

  // Test 4: Get comments for post
  async testGetPostComments() {
    await this.runTest('GET /api/forum/posts/[id]/comments', async () => {
      // Get a post with comments
      const response = await this.makeRequest('/api/forum/posts');
      if (!response.ok) throw new Error('Failed to get posts');
      
      const data = await response.json();
      const postWithComments = data.posts.find((p: any) => p._count.comments > 0);
      
      if (!postWithComments) throw new Error('No posts with comments found');
      
      // Get comments
      const commentsResponse = await this.makeRequest(`/api/forum/posts/${postWithComments.id}/comments`);
      if (!commentsResponse.ok) throw new Error(`HTTP ${commentsResponse.status}`);
      
      const commentsData = await commentsResponse.json();
      if (!commentsData.comments || !Array.isArray(commentsData.comments)) {
        throw new Error('Invalid comments structure');
      }
      
      if (commentsData.comments.length === 0) {
        throw new Error('Expected comments but got none');
      }
    });
  }

  // Test 5: Create new comment
  async testCreateComment() {
    await this.runTest('POST /api/forum/posts/[id]/comments', async () => {
      // Get a post to comment on
      const response = await this.makeRequest('/api/forum/posts?limit=1');
      if (!response.ok) throw new Error('Failed to get posts');
      
      const data = await response.json();
      if (!data.posts || data.posts.length === 0) throw new Error('No posts found');
      
      const post = data.posts[0];
      
      // Create comment
      const createResponse = await this.makeRequest(`/api/forum/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: 'This is a test comment created via API testing script.',
          isAnonymous: false
        })
      });
      
      if (createResponse.status !== 201) throw new Error(`HTTP ${createResponse.status}`);
      
      const comment = await createResponse.json();
      if (!comment.id || !comment.content) {
        throw new Error('Invalid comment structure');
      }
    });
  }

  // Test 6: Update comment
  async testUpdateComment() {
    await this.runTest('PATCH /api/forum/comments/[id]', async () => {
      // Get a comment to update
      const postsResponse = await this.makeRequest('/api/forum/posts');
      if (!postsResponse.ok) throw new Error('Failed to get posts');
      
      const postsData = await postsResponse.json();
      const postWithComments = postsData.posts.find((p: any) => p._count.comments > 0);
      
      if (!postWithComments) throw new Error('No posts with comments found');
      
      const commentsResponse = await this.makeRequest(`/api/forum/posts/${postWithComments.id}/comments`);
      if (!commentsResponse.ok) throw new Error('Failed to get comments');
      
      const commentsData = await commentsResponse.json();
      if (!commentsData.comments || commentsData.comments.length === 0) {
        throw new Error('No comments found');
      }
      
      const comment = commentsData.comments[0];
      const originalContent = comment.content;
      const updatedContent = `${originalContent} [UPDATED via API test]`;
      
      // Update comment
      const updateResponse = await this.makeRequest(`/api/forum/comments/${comment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content: updatedContent
        })
      });
      
      if (!updateResponse.ok) throw new Error(`HTTP ${updateResponse.status}`);
      
      const updatedComment = await updateResponse.json();
      if (!updatedComment.content.includes('[UPDATED via API test]')) {
        throw new Error('Comment was not updated correctly');
      }
      
      // Restore original content
      await this.makeRequest(`/api/forum/comments/${comment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content: originalContent
        })
      });
    });
  }

  // Test 7: Error handling - Invalid post ID
  async testErrorHandling() {
    await this.runTest('Error Handling - Invalid IDs', async () => {
      // Test invalid post ID
      const invalidPostResponse = await this.makeRequest('/api/forum/posts/invalid-id');
      if (invalidPostResponse.status !== 404) {
        throw new Error(`Expected 404, got ${invalidPostResponse.status}`);
      }
      
      // Test invalid comment ID
      const invalidCommentResponse = await this.makeRequest('/api/forum/comments/invalid-id');
      if (invalidCommentResponse.status !== 404) {
        throw new Error(`Expected 404, got ${invalidCommentResponse.status}`);
      }
    });
  }

  // Test 8: Validation - Empty content
  async testValidation() {
    await this.runTest('Validation - Empty Content', async () => {
      // Get a post to try updating with empty content
      const response = await this.makeRequest('/api/forum/posts?limit=1');
      if (!response.ok) throw new Error('Failed to get posts');
      
      const data = await response.json();
      if (!data.posts || data.posts.length === 0) throw new Error('No posts found');
      
      const post = data.posts[0];
      
      // Try to update with empty title
      const emptyTitleResponse = await this.makeRequest(`/api/forum/posts/${post.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: '',
          content: post.content
        })
      });
      
      if (emptyTitleResponse.status !== 400) {
        throw new Error(`Expected 400 for empty title, got ${emptyTitleResponse.status}`);
      }
    });
  }

  // Main test runner
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Forum API Tests...\n');
    
    const tests = [
      () => this.testGetPostsByCategory(),
      () => this.testGetSinglePost(), 
      () => this.testUpdatePost(),
      () => this.testGetPostComments(),
      () => this.testCreateComment(),
      () => this.testUpdateComment(),
      () => this.testErrorHandling(),
      () => this.testValidation()
    ];

    for (const test of tests) {
      await test();
    }

    this.printSummary();
  }

  private printSummary(): void {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📈 Total: ${this.results.length}`);
    
    const totalTime = this.results.reduce((sum, r) => sum + (r.duration || 0), 0);
    console.log(`⏱️  Total time: ${totalTime}ms`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`- ${r.test}: ${r.message}`);
        });
    }
    
    console.log(`\n🎯 Success rate: ${Math.round((passed / this.results.length) * 100)}%`);
  }
}

// Run the tests
const tester = new ForumAPITester();
tester.runAllTests().catch(console.error);