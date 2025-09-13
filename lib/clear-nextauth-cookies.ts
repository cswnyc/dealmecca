// Utility to clear NextAuth cookies that interfere with Firebase auth

export function clearNextAuthCookies() {
  if (typeof window === 'undefined') return;
  
  const nextAuthCookies = [
    'next-auth.callback-url',
    'next-auth.csrf-token', 
    'next-auth.session-token',
    'authjs.csrf-token',
    'authjs.callback-url',
    'authjs.session-token'
  ];
  
  console.log('🧹 Clearing NextAuth cookies...');
  
  nextAuthCookies.forEach(cookieName => {
    // Clear for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    
    console.log(`🗑️ Cleared cookie: ${cookieName}`);
  });
  
  console.log('✅ NextAuth cookies cleared!');
}
