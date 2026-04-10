import { create } from "zustand"
interface LoaderState {
  isOpen: boolean
  setIsOpen: (data: boolean) => void
}

const useLoaderState = create<LoaderState>((set) => ({
  isOpen: false,
  setIsOpen: (data: boolean) => set(() => ({ isOpen: data })),
}))

export default useLoaderState
