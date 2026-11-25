import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

export interface ToastState {
  items: Toast[];
}

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

const initialState: ToastState = { items: [] };

const toastSlice = createSlice({
  name: 'toasts',
  initialState,
  reducers: {
    addToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.items = [...state.items, action.payload].slice(-4);
      },
      prepare(input: ToastInput) {
        return {
          payload: {
            id: nanoid(),
            title: input.title,
            ...(input.description !== undefined ? { description: input.description } : {}),
            variant: input.variant ?? 'info',
            duration: input.duration ?? 4500,
          } satisfies Toast,
        };
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.items = state.items.filter((toast) => toast.id !== action.payload);
    },
    clearToasts(state) {
      state.items = [];
    },
  },
});

export const { addToast, dismissToast, clearToasts } = toastSlice.actions;
export const toastReducer = toastSlice.reducer;
