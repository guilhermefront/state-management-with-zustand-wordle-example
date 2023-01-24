import { create } from "zustand";

export type ToastParams = {
  message: string;
  timeout?: number | "infinity";
};

interface ToastStore {
  show: boolean;
  toast: ({ message }: ToastParams) => void;
  message: string;
}

export const useToastStore = create<ToastStore>((set) => ({
  show: false,
  message: "",
  toast: ({ message, timeout = 3000 }: ToastParams) => {
    set({ show: true, message });
    if (timeout !== "infinity") {
      setTimeout(() => {
        set({ show: false });
      }, timeout);
    }
  },
}));

export const Toast = () => {
  const { show, message } = useToastStore();
  return (
    <>
      {show && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            color: "white",
            background: "#575757",
            padding: "10px 12px",
            fontWeight: "semibold",
            borderRadius: 4,
          }}
        >
          {message}
        </div>
      )}
    </>
  );
};
