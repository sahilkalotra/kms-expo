import { apiClient } from '@/src/core/api/singleton';
import type { ApiResult } from '@/src/core/api/types';
import type { Course, Instructor } from '@/src/features/courses/types';
import { storageGet, storageSet } from '@/src/core/storage/appStorage';
import { COURSE_KEYS } from '@/src/features/courses/storageKeys';

type FreeApiListEnvelope<T> = {
  data?: {
    data?: T[];
    nextPage?: unknown;
  };
};

type RandomUserDto = {
  id?: string | number;
  name?: { first?: string; last?: string } | string;
  picture?: { thumbnail?: string; large?: string } | string;
};

type RandomProductDto = {
  id?: string | number;
  title?: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  price?: number;
};

function normalizeName(name: RandomUserDto['name']): string {
  if (!name) return 'Unknown instructor';
  if (typeof name === 'string') return name;
  const first = name.first?.trim() ?? '';
  const last = name.last?.trim() ?? '';
  const full = `${first} ${last}`.trim();
  return full.length > 0 ? full : 'Unknown instructor';
}

function normalizeAvatar(picture: RandomUserDto['picture']): string | undefined {
  if (!picture) return undefined;
  if (typeof picture === 'string') return picture;
  return picture.thumbnail ?? picture.large;
}

type CoursesPagePayload = { items: Course[]; page: number; hasNextPage: boolean };
type CacheEnvelope<T> = { savedAt: number; value: T };

function listPageCacheKey(page: number, limit: number) {
  return `${COURSE_KEYS.cache.listPagePrefix}${page}.limit.${limit}`;
}

function byIdCacheKey(courseId: string) {
  return `${COURSE_KEYS.cache.byIdPrefix}${courseId}`;
}

export async function fetchCourses(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResult<CoursesPagePayload>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  const [productsRes, usersRes] = await Promise.all([
    apiClient.request<FreeApiListEnvelope<RandomProductDto>>({
      path: '/api/v1/public/randomproducts',
      method: 'GET',
      query: { page, limit },
    }),
    apiClient.request<FreeApiListEnvelope<RandomUserDto>>({
      path: '/api/v1/public/randomusers',
      method: 'GET',
      query: { page, limit },
    }),
  ]);

  if (!productsRes.ok || !usersRes.ok) {
    const cached = await storageGet<CacheEnvelope<CoursesPagePayload>>(listPageCacheKey(page, limit));
    if (cached?.value) {
      return { ok: true, status: 200, headers: {}, data: cached.value };
    }
    return (!productsRes.ok ? productsRes : usersRes) as any;
  }

  const productsEnvelope = (productsRes.data as any)?.data ?? {};
  const usersEnvelope = (usersRes.data as any)?.data ?? {};

  const products: RandomProductDto[] = productsEnvelope.data ?? [];
  const users: RandomUserDto[] = usersEnvelope.data ?? [];

  const instructors: Instructor[] =
    users.length > 0
      ? users.map((u, idx) => ({
          id: String(u.id ?? idx),
          name: normalizeName(u.name),
          avatarUrl: normalizeAvatar(u.picture),
        }))
      : [{ id: '0', name: 'Unknown instructor' }];

  const courses: Course[] = products.map((p, idx) => {
    const instructor = instructors[idx % instructors.length]!;
    const id = String(p.id ?? idx);
    return {
      id,
      title: p.title ?? `Course ${id}`,
      description: p.description,
      thumbnailUrl: p.thumbnail ?? p.images?.[0],
      price: p.price,
      instructor,
    };
  });

  const hasNextPage = Boolean(productsEnvelope.nextPage) && Boolean(usersEnvelope.nextPage);
  const payload: CoursesPagePayload = { items: courses, page, hasNextPage };
  storageSet<CacheEnvelope<CoursesPagePayload>>(listPageCacheKey(page, limit), { savedAt: Date.now(), value: payload }).catch(() => {
    // best effort cache
  });
  return { ok: true, status: 200, headers: productsRes.headers, data: payload };
}

export async function fetchCourseById(courseId: string): Promise<ApiResult<Course>> {
  const res = await apiClient.request<any>({
    path: `/api/v1/public/randomproducts/${encodeURIComponent(courseId)}`,
    method: 'GET',
  });
  if (!res.ok) {
    const cached = await storageGet<CacheEnvelope<Course>>(byIdCacheKey(courseId));
    if (cached?.value) {
      return { ok: true, status: 200, headers: {}, data: cached.value };
    }
    return res as any;
  }

  const p = (res.data as any)?.data ?? (res.data as any) ?? {};
  const id = String(p.id ?? courseId);
  const course: Course = {
    id,
    title: p.title ?? `Course ${id}`,
    description: p.description,
    thumbnailUrl: p.thumbnail ?? p.images?.[0],
    price: p.price,
    instructor: { id: '0', name: 'Unknown instructor' },
  };
  storageSet<CacheEnvelope<Course>>(byIdCacheKey(courseId), { savedAt: Date.now(), value: course }).catch(() => {
    // best effort cache
  });
  return { ok: true, status: 200, headers: res.headers, data: course };
}

