const fs = require('fs');
const path = require('path');

const brandMappings = {
  // Old brand names to new
  'DealMecca': 'DealMecca',
  'DealMecca': 'DealMecca', 
  'dealmecca': 'dealmecca',
  'dealmecca': 'dealmecca',
  'DEALMECCA': 'DEALMECCA',
  'DEALMECCA': 'DEALMECCA',
  
  // URL/domain references
  'dealmeccapro.com': 'dealmecca.com',
  'dealmecca.com': 'dealmecca.com',
  'pro@dealmecca.pro': 'pro@dealmecca.com',
  'dealmecca.pro': 'dealmecca.com',
  
  // Description updates
  'The mecca for media deals': 'The mecca for media deals',
  'Where media deals happen': 'Where media deals happen',
  'The ultimate destination for media deals': 'The ultimate destination for media deals',
  'Connect with media deal makers': 'Connect with media deal makers',
  'The mecca for media deals': 'The mecca for media deals',
  'The ultimate destination for media deals': 'The ultimate destination for media deals',
  
  // Product/service descriptions
  'DealMecca - Professional networking': 'DealMecca - The mecca for media deals',
  'media deals platform': 'media deals platform',
  'ultimate media deals destination': 'ultimate media deals destination'
};

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(brandMappings).forEach(([oldValue, newValue]) => {
      if (content.includes(oldValue)) {
        content = content.replace(new RegExp(escapeRegExp(oldValue), 'g'), newValue);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
      walkDirectory(filePath);
    } else if (stat.isFile() && /\.(js|jsx|ts|tsx|json|md|html|css|scss|txt)$/.test(file)) {
      replaceInFile(filePath);
    }
  });
}

console.log('🚀 Starting DealMecca rebranding...');
console.log('📁 Scanning files for brand references...\n');

walkDirectory('./');

console.log('\n✅ DealMecca rebranding complete!');
console.log('🔍 To verify all changes, run: grep -r "DealMecca" . --exclude-dir=node_modules --exclude-dir=.git'); 