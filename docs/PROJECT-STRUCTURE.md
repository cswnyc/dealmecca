# DealMecca Project Structure

## 📁 Directory Organization

### Root Level
- **Essential config files only**: package.json, tsconfig.json, next.config.mjs, etc.
- Clean and organized for better navigation

### 📚 `/docs/`
All project documentation including:
- Setup guides and instructions
- API documentation 
- Development guides
- Deployment information
- Testing documentation

### 🧪 `/tests/`
- Test files and debug utilities
- API debug routes (moved from production)
- Test user creation scripts
- Development utilities

### 🚀 `/deployment/`
- Deployment scripts and configurations
- Docker files
- Vercel configurations
- Production setup files

### 📊 `/data/`
- Sample data files (CSV)
- Development logs
- Import/export files
- Test data

### 🏗️ `/types/`
- Global TypeScript type definitions
- Shared interfaces and types
- API response types
- Utility types

### 🔧 `/constants/`
- Application-wide constants
- Configuration values
- Enum definitions
- Brand constants

## 🎯 Benefits of New Structure

### ✅ **Improved Organization**
- Clear separation of concerns
- Easier navigation and file discovery
- Reduced root directory clutter

### ✅ **Better Maintainability** 
- Centralized type definitions
- Shared constants prevent duplication
- Clean separation of dev vs production code

### ✅ **Enhanced Developer Experience**
- Logical grouping of related files
- Improved IDE navigation
- Better search and discovery

### ✅ **Production Ready**
- Debug/test routes moved out of production
- Clean deployment structure
- Professional file organization

## 🔄 Migration Notes

### Files Moved:
- **Documentation**: All .md and .txt files → `/docs/`
- **Debug/Test**: All test-* and debug-* files → `/tests/`
- **Deployment**: Docker, Vercel configs → `/deployment/`
- **Data**: CSV files, logs → `/data/`

### New Structure Added:
- **Types**: Global TypeScript definitions
- **Constants**: Application-wide constants
- **Path Aliases**: Updated tsconfig.json for easier imports

### Middleware Cleanup:
- Removed debug/test API routes from middleware
- Cleaned up public route definitions
- Production-ready authentication flow

## 📖 Usage Examples

### Import Types:
```typescript
import { User, Company, ApiResponse } from '@/types'
```

### Import Constants:
```typescript
import { BRAND, SUBSCRIPTION_LIMITS } from '@/constants'
```

### File Paths:
- Documentation: `docs/README.md`
- Types: `types/index.ts` 
- Constants: `constants/index.ts`
- Tests: `tests/api-debug-routes/`

This structure provides a solid foundation for scaling the DealMecca platform while maintaining clean, organized, and professional code architecture.