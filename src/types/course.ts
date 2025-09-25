// Course related types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  videoUrl: string; // YouTube URL or video file URL
  duration: number; // in minutes
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CoursePurchase {
  id: string;
  userId: string;
  courseId: string;
  purchaseDate: string;
  price: number;
  paymentMethod: 'card' | 'pix';
  paymentStatus: 'pending' | 'paid' | 'refunded';

  // Relations
  course?: Course;
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  watchedMinutes: number;
  totalMinutes: number;
  completed: boolean;
  lastWatchedAt: string;

  // Relations
  course?: Course;
}

// For course video player
export interface VideoProgress {
  courseId: string;
  currentTime: number;
  duration: number;
  watchedPercentage: number;
}
