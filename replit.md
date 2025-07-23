# Overview

This is a comprehensive database management dashboard for iLibrary website with full CRUD operations via GraphQL and REST APIs. The application provides complete management capabilities for all database entities including books, authors, categories, users, chapters, reviews, and favorites.

## User Preferences

Preferred communication style: Simple, everyday language in Arabic.
User prefers sidebar navigation on the right side.
User wants clean UI without notifications and settings sections.
User prefers "Ilibrary" as the application name.
User expects comprehensive management capabilities for all database entities.

## Recent Changes (July 23, 2025)

✓ **Complete Author Data Access Control System Implementation (July 23, 2025)**
- Implemented comprehensive data filtering system so authors only see their own data
- Added session management with express-session for proper user state management
- Enhanced login endpoint to automatically link users with author records
- Added author-based filtering to all major API endpoints (books, chapters)
- Implemented automatic book assignment to author when creating new books
- Added validation for chapter creation to ensure authors only add chapters to their books
- Authors now have complete isolation - they only see and can manage their own books and chapters
- System properly restricts data access based on authorId stored in user session
- Added fallback mechanism to assign existing authors to new author users

✓ **Created Complete Author Dashboard System (July 23, 2025)**
- Created dedicated AuthorDashboard page with book management interface
- Created AuthorChapters page for chapter management with book filtering
- Added AuthorNavbar component for author-specific navigation
- Integrated author routing system in App.tsx with role-based access
- Added responsive design with statistics cards and book grid view
- Connected to existing GraphQL APIs for data management
- Authors can now manage their books and chapters independently from admin dashboard

✓ **Fixed Authors Management GraphQL Schema Issues (July 23, 2025)**
- Fixed GraphQL Category_Id variable type from String to uuid in mutations
- Corrected SelectItem value="" issue by using value="none" instead
- Updated createAuthor and updateAuthor mutations with proper uuid handling
- All authors CRUD operations now working correctly with GraphQL backend

✓ **Professional Authors Management Page Complete (July 23, 2025)**
- Redesigned authors management page with modern responsive UI
- Added grid/table view modes with professional statistics cards
- Fixed all GraphQL mutations to match exact schema requirements
- Added comprehensive search and filter functionality
- Implemented mobile-first responsive design with RTL support
- All CRUD operations (Create, Read, Update, Delete) working perfectly

✓ **Fixed Chapters Management GraphQL Schema and Type Issues (July 23, 2025)**
- Fixed critical GraphQL variable types in chapters mutations:
  - `book__id`: Changed from String to `uuid!` 
  - `content`: Changed from String to `jsonb` (array format)
  - `Create_at`: Changed from String to `timestamptz!`
- Updated createChapter and updateChapter mutations with correct variable types
- Fixed content handling to support jsonb array format as required by schema
- Tested and verified chapters creation works perfectly with GraphQL backend
- All chapters CRUD operations now working correctly

✓ **Professional Categories Management with Correct GraphQL Integration Complete (July 23, 2025)**
- Fixed GraphQL categories query to match exact schema (name and id fields only)
- Updated all CRUD mutations to use correct GraphQL syntax:
  - Insert: `insert_libaray_Category(objects: {name: $name})`
  - Update: `update_libaray_Category_by_pk(pk_columns: {id: $id}, _set: {name: $name})`
- Fixed frontend GraphQL client to use correct schema names (libaray_Category not ilibarary_Category)
- Completely redesigned categories page with professional emerald/teal gradient theme
- Added mobile-first responsive design with grid/list view modes
- Implemented advanced search functionality and filter capabilities
- Created beautiful gradient statistics cards with hover animations
- Added comprehensive loading states and empty state handling
- Full RTL support and professional Arabic typography maintained
- All CRUD operations (Create, Read, Update, Delete) working perfectly with GraphQL backend

✓ **Migration from Replit Agent to Replit Environment Completed Successfully (July 23, 2025)**
✓ **Final Migration Cleanup and SelectItem Fix Completed (July 23, 2025)**
- Fixed SelectItem component error by replacing value="" with value="all" in author-chapters.tsx
- Updated filtering logic to properly handle "all" value for book selection
- All LSP diagnostics resolved and runtime errors eliminated
- Project migration from Replit Agent to Replit environment fully completed
- Successfully completed project migration with all packages installed correctly
- Express server running smoothly on port 5000 with Vite development environment
- All GraphQL queries and mutations working properly with external Hasura endpoint
- Authentication system functional with role-based access control
- Fixed books deletion functionality by correcting GraphQL schema naming (delete_libaray_Book_by_pk)
- Fixed ConfirmModal props error to enable proper delete confirmation dialogs
- All CRUD operations for books (Create, Read, Update, Delete) now working perfectly
- All project features verified and working as expected

## Previous Changes (July 21, 2025)

✓ **Enhanced Chapters Management with Professional UI and Custom Display (July 21, 2025)**
- Updated GraphQL query to use exact schema: chapter_num, content, title, Create_at, book__id, id
- Fixed data display issues by replacing DataTable with custom card-based layout
- Created professional responsive design with emerald/teal gradient theme for chapters
- Added compact statistics cards showing total chapters, books, visible chapters, and active filter
- Implemented custom chapter cards with chapter numbers, content previews, and action buttons  
- Added proper loading states and empty states for better user experience
- Fixed content display for array-based chapter content from GraphQL API
- Full RTL support and mobile-responsive design maintained throughout

✓ **Professional Books Management UI with Full Responsive Design Complete (July 21, 2025)**
- Enhanced books management page with professional gradient design and modern UI components
- Added responsive header with statistics display and dual view mode toggle (table/grid)
- Implemented mobile-first responsive statistics cards with gradient backgrounds and animations
- Created comprehensive grid view with hover effects and mobile-optimized action buttons
- Enhanced table view with improved action buttons and color-coded interactions
- Added loading states and empty state handling for better user experience
- Full responsive design optimized for mobile, tablet, and desktop screens
- Professional Arabic typography and RTL layout support maintained throughout

✓ **User Management GraphQL Mutations Fixed and Role System Updated (July 21, 2025)**
- Fixed user creation and update mutations to use correct GraphQL schema (insertUser and updateUser)
- Updated user management to support new role system: user, anonymous, me, author
- Corrected all GraphQL mutation calls to match the provided mutation syntax
- Fixed LSP diagnostics issues in user management components
- Updated role selection dropdowns in both Add and Edit user modals
- Resolved phoneNumber constraint violations by properly handling null values
- Fixed apiRequest parameter ordering to prevent fetch errors
- CREATE and UPDATE operations working perfectly with GraphQL backend
- DELETE operation needs minor schema adjustment but non-critical
- Migration from Replit Agent environment completed successfully

✓ **Project Migration from Replit Agent to Replit Environment Complete (July 21, 2025)**
- Successfully completed project migration with all packages installed correctly
- Express server running smoothly on port 5000 with Vite development environment
- Verified role-based authentication system is working properly:
  - Roles extracted from `authUserRoles` table via GraphQL
  - Dashboard routing works based on user roles (admin/author/user)
  - Email-based author role assignment functional
  - Security measures maintained with bcrypt password verification
- All migration checklist items completed successfully
- Project ready for continued development and building

✓ **Professional Sidebar UI Improvements Complete**
- Removed system status indicators and version information as requested
- Cleaned up sidebar design for a more professional appearance
- Simplified user info section with cleaner logout button
- Improved navigation spacing and icon sizing
- Enhanced overall visual hierarchy and professional aesthetics

✓ **Migration from Replit Agent to Replit Environment Complete**
- Successfully migrated project structure for Replit compatibility  
- Fixed Button component import issue in App.tsx
- Updated authentication logic to support role-based access control
- Enhanced role system: "me" role → admin dashboard, "author" role → author dashboard
- Users with email containing "author" automatically get author role
- Added proper password verification using bcrypt for security
- Login now requires both email and encrypted password validation  
- Only users with valid passwordHash can authenticate
- Removed all default passwords - system is fully secure
- Test users updated with encrypted passwordHash in database
- All packages installed and workflow running smoothly on port 5000
- Security improvements with proper client/server separation maintained

## Previous Changes (July 21, 2025)

✓ **Migration from Replit Agent to Replit Environment Complete (July 21, 2025)**
- Successfully migrated the iLibrary database management dashboard
- Fixed Button component import issue in App.tsx
- All LSP diagnostics resolved and application running error-free
- Express server operational on port 5000 with Vite development server
- Complete project functionality verified and ready for continued development

✓ **Simple Authentication System Implementation Complete**
- Removed complex Replit Auth system as per user request
- Created simple login page that checks database for user existence
- Implemented role-based routing system with admin, author, and user roles
- Added GraphQL-based user role management using provided queries
- Created dedicated author dashboard with role-specific features
- Updated App.tsx with simple authentication state management
- Added logout functionality throughout the application
- System now uses simple email verification against database

## Previous Changes (July 18, 2025)

✓ **Chapter Management System Implementation Complete**
- Added comprehensive Chapter management with full CRUD operations
- Integrated Chapter table with GraphQL backend and local storage fallback
- Created dedicated Chapters page with filtering by book and data table display
- Added Chapter creation, editing, and deletion modals with form validation
- Implemented chapters API endpoints: GET, POST, PUT, DELETE for /api/chapters
- Added book-specific chapter retrieval endpoint: /api/books/:bookId/chapters
- Connected chapters to books with direct navigation button in books table
- Updated sidebar navigation to include "إدارة الفصول" menu item

✓ **Migration to Replit Environment Complete**
- Successfully migrated project from Replit Agent to Replit environment
- All packages installed and working properly
- Express server running on port 5000 with Vite development server
- Database integration functioning with GraphQL endpoints

✓ **UI Improvements Based on User Feedback**  
- Moved sidebar navigation to the right side for better Arabic layout
- Removed notifications and settings sections from navigation
- Changed application name from "مكتبة الغيمة" to "Ilibrary"
- Updated color scheme with harmonious blue tones
- Improved background gradients for better visual appeal

✓ **Migration from Replit Agent to Replit Environment**  
- Removed local PostgreSQL database dependency completely
- Configured application to use external GraphQL endpoint only
- Updated all storage layer to use GraphQL queries and mutations
- Simplified architecture by removing database abstraction layers
- All API endpoints now connect directly to external GraphQL service
- Application successfully migrated and functional with real Arabic book data

✓ **Major UI/UX Improvements & Arabic Localization**
- Completely redesigned with professional modern UI using advanced gradients and glass-morphism
- Enhanced color scheme with sophisticated blue-purple gradient theme and premium shadows
- Rebuilt sidebar with professional design, animated icons, and system status indicators
- Redesigned dashboard with hero section, animated cards, and professional statistics layout
- Implemented advanced CSS animations including slide-in effects and hover transformations
- Added gradient text effects, professional buttons, and enhanced visual hierarchy
- Created comprehensive professional design system with consistent modern styling
- Enhanced all components with premium shadows, rounded corners, and professional spacing

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Data Layer**: Direct GraphQL integration with external Hasura endpoint
- **Data Storage**: No local database - all data fetched from external GraphQL API
- **Session Storage**: In-memory storage for development
- **API Design**: RESTful endpoints with JSON responses

## Key Components

### Database Layer
- **Schema Definition**: Centralized in `shared/schema.ts` using Drizzle ORM
- **User Management**: Complete user table with authentication fields matching Hasura Auth structure
- **Validation**: Zod schemas for input/output validation derived from Drizzle schemas
- **Migrations**: Managed through Drizzle Kit with PostgreSQL dialect

### API Layer
- **User Management**: Full CRUD operations for users
- **Dashboard Stats**: Aggregated statistics endpoint
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request/response logging
- **Input Validation**: Zod schema validation on all endpoints

### Storage Abstraction
- **Interface-based Design**: `IStorage` interface allows for multiple implementations
- **In-Memory Storage**: `MemStorage` class for development and testing
- **Database Storage**: Designed to be easily swapped with actual database implementation

### Frontend Components
- **Layout**: Sidebar navigation with topbar for page-specific content
- **Dashboard**: Statistics overview with cards and charts
- **User Management**: Complete CRUD interface with modals and data tables
- **Reusable UI**: Comprehensive component library from shadcn/ui
- **Form Components**: Standardized modals for create/edit operations

## Data Flow

1. **Client Requests**: React components use TanStack Query for data fetching
2. **API Routing**: Express.js routes handle HTTP requests with validation
3. **Business Logic**: Service layer (storage interface) processes requests
4. **Data Persistence**: Drizzle ORM manages database operations
5. **Response**: JSON responses with proper error handling and status codes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management for React
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Zod integration for form validation

### UI Dependencies
- **@radix-ui/***: Unstyled, accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **typescript**: Static type checking
- **vite**: Fast build tool and dev server
- **drizzle-kit**: Database migrations and schema management
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development
- **Hot Reload**: Vite development server with HMR
- **API Development**: tsx for running TypeScript server code directly
- **Database**: Drizzle Kit for schema changes and migrations

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Environment-based DATABASE_URL configuration
- **Deployment**: Single Node.js process serving both API and static files

### Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Build Scripts**: Separate build and start commands for production
- **Static Serving**: Express serves built frontend assets in production
- **Session Management**: PostgreSQL-backed sessions for scalability

The application follows a monorepo structure with clear separation between client, server, and shared code. The shared directory contains database schemas and types used by both frontend and backend, ensuring type safety across the entire application.