/**
 * Instructor API utilities for fetching exam responses and artifacts
 */

export interface VerificationArtifact {
  id: number;
  attemptId: number;
  type: "face" | "room" | "id";
  url: string;
  meta?: any;
  createdAt: string;
}

export interface StudentAttempt {
  id: number;
  examId: number;
  studentId: string;
  studentName?: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  proctoringSummary?: any;
  artifacts: VerificationArtifact[];
}

/**
 * Fetch all attempts for a specific exam with their verification artifacts
 */
export async function fetchExamAttempts(
  examId: number
): Promise<StudentAttempt[]> {
  try {
    const response = await fetch(
      `/api/instructor/exams/${examId}/attempts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch exam attempts");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching exam attempts:", error);
    throw error;
  }
}

/**
 * Fetch a specific attempt with all its artifacts
 */
export async function fetchAttemptDetails(
  attemptId: number
): Promise<StudentAttempt> {
  try {
    const response = await fetch(
      `/api/instructor/attempts/${attemptId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch attempt details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching attempt details:", error);
    throw error;
  }
}

/**
 * Fetch verification artifacts for an attempt
 */
export async function fetchAttemptArtifacts(
  attemptId: number
): Promise<VerificationArtifact[]> {
  try {
    const response = await fetch(
      `/api/instructor/attempts/${attemptId}/artifacts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch artifacts");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching artifacts:", error);
    throw error;
  }
}

/**
 * Flag an attempt for review
 */
export async function flagAttempt(
  attemptId: number,
  reason: string
): Promise<void> {
  try {
    const response = await fetch(
      `/api/instructor/attempts/${attemptId}/flag`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to flag attempt");
    }
  } catch (error) {
    console.error("Error flagging attempt:", error);
    throw error;
  }
}
