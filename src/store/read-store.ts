import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReadStore {
  readPosts: Record<string, boolean>; // 객체 형태로 저장하여 O(1) 탐색 가능
  markAsRead: (boardId: string) => void;
  isRead: (boardId: string) => boolean;
}

export const useReadStore = create<ReadStore>()(
  persist(
    (set, get) => ({
      readPosts: {}, // JSON 객체 저장
      markAsRead: (boardId) => {
        const key = `${boardId}`; // 유니크한 키 생성
        set((state) => ({
          readPosts: { ...state.readPosts, [key]: true }, // 새로운 키 추가
        }));
      },
      isRead: (boardId) => {
        const key = `${boardId}`;
        return !!get().readPosts[key]; // 존재하면 true 반환
      },
    }),
    {
      name: 'read-storage', // localStorage 키 설정
    }
  )
);
