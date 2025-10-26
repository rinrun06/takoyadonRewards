// src/Services/activityService.ts

// --- Type Definition ---
export interface PointActivity {
  id: string;
  userId: string;
  description: string;
  points: number;
  date: string;
  type: 'earn' | 'redeem';
}

// --- In-memory "database" ---
// This will act as our single source of truth for the session.
const allActivities: PointActivity[] = [
    // Pre-populate with some data for demonstration
    { id: 'h1', userId: 'mock-user-123', description: "Initial Bonus", points: 100, date: "2023-10-20", type: 'earn' },
];

// --- Mock API Service ---
export const activityService = {
  /**
   * Fetches all activities for a specific user.
   * In a real app, this would be an API call: `fetch('/api/user/${userId}/activity')`
   */
  getActivitiesForUser: async (userId: string): Promise<PointActivity[]> => {
    console.log(`Fetching activities for user: ${userId}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const userActivities = allActivities.filter(act => act.userId === userId);
    return userActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  /**
   * Adds a new activity to the user's history.
   * In a real app, this would be a POST request: `fetch('/api/activity', { method: 'POST', ... })`
   */
  addActivity: async (activityData: Omit<PointActivity, 'id' | 'date'>): Promise<PointActivity> => {
    console.log(`Adding new activity:`, activityData);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newActivity: PointActivity = {
      ...activityData,
      id: `act-${Date.now()}`,
      date: new Date().toISOString().split('T')[0], // Get date in YYYY-MM-DD format
    };
    
    // Add to our in-memory database
    allActivities.push(newActivity);
    
    return newActivity;
  }
};
