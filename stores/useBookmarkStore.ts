import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PNode } from "@/services/nodeService";

interface BookmarkStore {
  bookmarks: PNode[];
  toggleBookmark: (node: PNode) => void;
  isBookmarked: (pubkey: string) => boolean;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      toggleBookmark: (node: PNode) => {
        const { bookmarks } = get();
        const isBookmarked = bookmarks.some((b) => b.pubkey === node.pubkey);
        
        if (isBookmarked) {
          set({
            bookmarks: bookmarks.filter((b) => b.pubkey !== node.pubkey),
          });
        } else {
          set({
            bookmarks: [...bookmarks, node],
          });
        }
      },
      isBookmarked: (pubkey: string) => {
        return get().bookmarks.some((b) => b.pubkey === pubkey);
      },
    }),
    {
      name: "xandeum-bookmarks",
    }
  )
);

