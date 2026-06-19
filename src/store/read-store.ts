import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ReadPostValue = string | boolean;

type ReadEntry = {
  boardId: string;
  readAt: string;
};

interface ReadStore {
  readPosts: Record<string, ReadPostValue>; // 객체 형태로 저장하여 O(1) 탐색 가능
  markAsRead: (boardId: string) => void;
  isRead: (boardId: string) => boolean;
  getReadEntries: () => ReadEntry[];
  clearReadHistory: () => void;
}

function readValueToDate(value: ReadPostValue) {
  return typeof value === 'string' ? value : '';
}

export const useReadStore = create<ReadStore>()(
  persist(
    (set, get) => ({
      readPosts: {}, // JSON 객체 저장
      markAsRead: (boardId) => {
        const key = `${boardId}`; // 유니크한 키 생성
        set((state) => ({
          readPosts: { ...state.readPosts, [key]: new Date().toISOString() }, // 새로운 키 추가
        }));
      },
      isRead: (boardId) => {
        const key = `${boardId}`;
        return !!get().readPosts[key]; // 존재하면 true 반환
      },
      getReadEntries: () =>
        Object.entries(get().readPosts)
          .filter(([, value]) => Boolean(value))
          .map(([boardId, value]) => ({
            boardId,
            readAt: readValueToDate(value),
          }))
          .sort((a, b) => (b.readAt || '').localeCompare(a.readAt || '')),
      clearReadHistory: () => set({ readPosts: {} }),
    }),
    {
      name: 'read-storage', // localStorage 키 설정
    }
  )
);
