
# Takoyadon Loyalty Program - Blueprint

## Overview

This document outlines the architecture and implementation of the Takoyadon Loyalty Program application. The application is a React-based web app with a Supabase backend, designed to manage customer loyalty points, rewards, and engagement activities.

## Key Features

*   **Customer Authentication:** Users can sign up, log in, and manage their profiles.
*   **Loyalty Points System:** Customers earn points by participating in various activities, such as sharing on social media.
*   **Reward Redemption:** Users can redeem their accumulated points for exclusive rewards.
*   **Customer Loyalty Dashboard:** A centralized dashboard for customers to view their loyalty points, progress, recent activities, and available rewards.
*   **Customer Referral Program:** A feature that allows customers to refer new users and earn rewards, managed via Firebase Remote Config for phased rollouts.
*   **Admin Dashboard:** A comprehensive dashboard for administrators to manage the loyalty program, including:
    *   Approving or rejecting customer activity submissions.
    *   Managing reward offerings.
    *   Viewing analytics and user data.
    *   Campaign Performance Analytics.
*   **QR Code Integration:** Functionality for QR code scanning and management.
*   **Real-time Notifications:** Users receive real-time notifications for important events, such as reward redemptions and activity approvals.

## Technical Architecture

### Frontend

*   **Framework:** React
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** Lucide React for icons, Material-UI, Recharts
*   **Routing:** React Router
*   **State Management:** React Hooks and Context API (`useAuth`)
*   **Supabase Client:** `@supabase/supabase-js` for interacting with the Supabase backend.

### Backend (Supabase)

*   **Database:** Supabase PostgreSQL for data storage.
*   **Authentication:** Supabase Auth for user management.
*   **Serverless Functions:** Supabase Edge Functions for secure and scalable business logic.
*   **Real-time:** Supabase Realtime for instant updates and notifications.
*   **Storage:** Supabase Storage for hosting images and other assets.

### Core Backend Logic (Edge Functions)

To ensure security and scalability, the application\'s core business logic is encapsulated within two primary Edge Functions:

1.  **`approve-activity`:**
    *   **Purpose:** Securely approves customer activity submissions (e.g., social media shares) and awards loyalty points.
    *   **Trigger:** Called from the admin dashboard.
    *   **Logic:**
        *   Verifies the activity\'s existence and status.
        *   Awards the appropriate number of points to the user.
        *   Updates the activity\'s status to "approved."
        *   Creates a transaction record in the `point_transactions` table.
        *   Sends a real-time notification to the user upon approval.
    *   **Security:** Uses the `service_role_key` to bypass Row Level Security (RLS) policies, allowing for privileged database operations.

2.  **`redeem-reward`:**
    *   **Purpose:** Securely processes reward redemptions for customers.
    *   **Trigger:** Called from the rewards page.
    *   **Logic:**
        *   Verifies that the user has sufficient points to redeem the reward.
        *   Deducts the points from the user\'s account.
        *   Records the redemption in the `point_transactions` table.
        *   Sends a real-time notification to the user confirming the redemption.
    *   **Security:** Executes all database operations as a single, atomic transaction to ensure data consistency.

## Implemented Changes (Current Session)

*   **TSConfig Path Fix:**
    *   Corrected the `tsconfig.json` to include the `supabase` directory in the build, resolving a "Module not found" error.
    *   Added a `~/*` path alias for cleaner imports from the `supabase` directory.
*   **Dashboard Refactoring:**
    *   Created a reusable `StatCard.tsx` component to display key statistics.
    *   Refactored `SuperAdminDashboard.tsx`, `FranchiseAdminDashboard.tsx`, and `BranchStaffDashboard.tsx` to use the new `StatCard` component, reducing code duplication and improving maintainability.
*   **Campaign Performance Analytics:**
    *   Created a Supabase RPC `get_campaign_performance_stats` to aggregate campaign data.
    *   Enhanced the `Analytics.tsx` page with a new section and chart to visualize campaign performance.
    *   Added a link on the Super Admin Dashboard for easy navigation.
*   **Customer Loyalty Dashboard:**
    *   Created the `LoyaltyDashboard.tsx` page with a T-style layout.
    *   The dashboard displays user\'s loyalty points, progress, recent activities, and available rewards.
    *   Added a "Loyalty" link to the main navigation.
*   **Customer Referral Program (In Progress):**
    *   **Plan:**
        1.  Create `src/pages/Referral.tsx` for users to see their referral code and track referrals.
        2.  Create a Supabase migration to add `referral_code` and `referred_by` columns to the `profiles` table.
        3.  Develop a Supabase Edge Function to handle referral logic on new user sign-up.
        4.  Integrate with Firebase Remote Config to control feature visibility.
        5.  Add a conditional link to the navigation.
*   **Refactored Earn Points and Feedback Pages:**
    *   Moved all "Ways to Earn Points" logic and UI (OpportunityCard, ActionModal, state, and handlers) from `src/pages/Feedback.tsx` to `src/pages/EarnPoints.tsx`.
    *   Refactored `src/pages/Feedback.tsx` to be a dedicated feedback submission form, removing all point-earning components and logic.

