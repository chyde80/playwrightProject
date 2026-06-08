import { TEST_USERS } from './testData';

export type TestUserKey = keyof typeof TEST_USERS;

const rawKey = process.env.TEST_USER || 'standard_user';
const normalizedKey = rawKey.toUpperCase();

const keyMap: Record<string, TestUserKey> = {
  STANDARD_USER: 'STANDARD_USER',
  STANDARD: 'STANDARD_USER',
  PROBLEM_USER: 'PROBLEM_USER',
  PROBLEM: 'PROBLEM_USER',
  LOCKED_OUT_USER: 'LOCKED_USER',
  LOCKED: 'LOCKED_USER',
  PERFORMANCE_GLITCH_USER: 'PERFORMANCE_GLITCH_USER',
  PERFORMANCE: 'PERFORMANCE_GLITCH_USER',
};

const resolvedKey: TestUserKey = keyMap[normalizedKey] ?? 'STANDARD_USER';

export const CURRENT_USER_KEY = resolvedKey;
export const CURRENT_USER = TEST_USERS[resolvedKey];

export const isProblemUser = resolvedKey === 'PROBLEM_USER';
export const isLockedOutUser = resolvedKey === 'LOCKED_USER';
export const isPerformanceUser = resolvedKey === 'PERFORMANCE_GLITCH_USER';
