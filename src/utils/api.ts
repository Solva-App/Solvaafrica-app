export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// ========================
// SEASONS
// ========================
export async function fetchSeasons() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/hunt/seasons`);
    if (!response.ok) throw new Error('Failed to fetch seasons');
    return await response.json();
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return null;
  }
}

export async function fetchSeasonDetails(seasonId: number | string) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/hunt/seasons/${seasonId}`);
    if (!response.ok) throw new Error('Failed to fetch season details');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching season ${seasonId}:`, error);
    return null;
  }
}

export async function fetchSeasonStages(seasonId: number | string) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/hunt/seasons/${seasonId}/stages`);
    if (!response.ok) throw new Error('Failed to fetch season stages');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching stages for season ${seasonId}:`, error);
    return null;
  }
}

export async function fetchSeasonLeaderboard(seasonId: number | string) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/hunt/seasons/${seasonId}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching leaderboard for season ${seasonId}:`, error);
    return null;
  }
}

export async function fetchSeasonFaculties() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/hunt/faculties`);
    if (!response.ok) throw new Error('Failed to fetch faculties');
    return await response.json();
  } catch (error) {
    console.error('Error fetching faculties:', error);
    return null;
  }
}

// ========================
// FACULTY
// ========================
export async function registerFaculty(data: any) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/hunt/faculty/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to register faculty');
    return await response.json();
  } catch (error) {
    console.error('Error registering faculty:', error);
    return null;
  }
}

export async function activateFaculty(facultyId: number | string, data: any) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/hunt/faculty/${facultyId}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to activate faculty');
    return await response.json();
  } catch (error) {
    console.error(`Error activating faculty ${facultyId}:`, error);
    return null;
  }
}

export async function joinFaculty(facultyId: number | string, data: any) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/hunt/faculty/${facultyId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to join faculty');
    return await response.json();
  } catch (error) {
    console.error(`Error joining faculty ${facultyId}:`, error);
    return null;
  }
}

// ========================
// STAGES
// ========================
export async function fetchStageDetails(stageId: number | string) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/hunt/stages/${stageId}`);
    if (!response.ok) throw new Error('Failed to fetch stage details');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching stage ${stageId}:`, error);
    return null;
  }
}

export async function submitStageAnswer(stageId: number | string, data: { challenge_id: number; answer_provided: string; reasoning?: string }) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/hunt/stages/${stageId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to submit stage answer');
    return await response.json();
  } catch (error) {
    console.error(`Error submitting stage answer for stage ${stageId}:`, error);
    return null;
  }
}
