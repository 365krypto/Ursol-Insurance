# URSOL - Blockchain Life Insurance Platform

## Overview

URSOL is a decentralized life insurance platform built on blockchain technology that combines DeFi mechanisms with NFT-based policy certificates. The platform offers tiered insurance policies as NFTs, dual staking systems, borrowing capabilities using policies as collateral, and parametric claims processing through World ID verification and oracle feeds.

The application uses a full-stack TypeScript architecture with React frontend, Express.js backend, and PostgreSQL database managed through Drizzle ORM. It features a modern UI built with shadcn/ui components and Tailwind CSS, providing users with comprehensive insurance management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based frontend using functional components and hooks
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system variables
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Storage Pattern**: Repository pattern with in-memory storage fallback for development
- **API Design**: RESTful endpoints for all major entities (users, policies, staking, loans, claims)
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Database Design
- **Users**: Core user profiles with URSOL token balances and World ID verification status
- **Policies**: NFT-based insurance policies with tiered coverage (basic, premium, premium_urn)
- **Staking Positions**: Dual staking system supporting insurance pool and rewards staking
- **Loans**: Collateralized lending using NFT policies as collateral
- **Beneficiaries**: Encrypted off-chain storage for sensitive beneficiary information
- **Claims**: Parametric claims processing with automated verification
- **Activities**: Activity logging for user actions and system events

### Key Features Architecture
- **NFT Policy System**: Three-tier policy structure with increasing benefits and token burn mechanisms
- **Dual Staking**: Insurance pool staking (locked, yield-bearing) and rewards staking (flexible, governance)
- **Collateralized Lending**: Use policy NFTs as collateral for URSOL token loans
- **Parametric Claims**: Automated death verification through World ID and oracle integration
- **Encrypted Beneficiary Data**: Client-side encryption for sensitive will and beneficiary information

### Development Environment
- **Development Server**: Hot-reload development with Vite and Express integration
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation

## External Dependencies

### Core Infrastructure
- **@neondatabase/serverless**: Neon PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database migration and schema management tools

### Frontend Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight routing solution
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **date-fns**: Date manipulation and formatting

### Development Tools
- **vite**: Modern build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development plugins

### Blockchain Integration (Mocked)
- Mock blockchain utilities for token burning and NFT minting
- World ID verification system (mocked for development)
- Oracle feed integration for parametric claims (mocked)

### Authentication & Security
- Session-based authentication with connect-pg-simple
- Client-side encryption for sensitive beneficiary data
- World ID verification for claims processing