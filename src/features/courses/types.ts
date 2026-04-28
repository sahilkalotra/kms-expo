export type Instructor = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Course = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  instructor: Instructor;
};

