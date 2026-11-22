"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn, cva } from "@/lib/utils";

type ToastVariant = "default" | "negative" | "positive";

type ToastItem = {
  id: string;
  title: string;
  variant?: ToastVariant;
};

type ToastInput = {
  title: string;
  variant?: ToastVariant;
  id?: string;
};

type ToastStore = {
  toasts: ToastItem[];
  publish: (input: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastStore | null>(null);

let externalPublish: ((input: ToastInput) => void) | null = null;

export function toast(input: ToastInput) {
  if (!externalPublish) {
    console.warn("Toaster is not mounted; toast was ignored.");
    return;
  }
  externalPublish(input);
}

const toastStyle = cva({
  base: "pointer-events-auto w-full rounded-xl border px-4 py-3 text-sm shadow-lg",
  variants: {
    variant: {
      default: "border-border bg-background text-foreground",
      negative: "border-error/30 bg-error/10 text-error",
      positive: "border-success/30 bg-success/10 text-success",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const publish = useCallback((input: ToastInput) => {
    const id = input.id ?? crypto.randomUUID();
    setToasts((prev) => [...prev, { id, title: input.title, variant: input.variant }]);
  }, []);

  useEffect(() => {
    externalPublish = publish;
    return () => {
      if (externalPublish === publish) externalPublish = null;
    };
  }, [publish]);

  const store = useMemo(
    () => ({ toasts, publish, dismiss }),
    [toasts, publish, dismiss],
  );

  return (
    <ToastContext value={store}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {toasts.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            open
            onOpenChange={(open) => {
              if (!open) dismiss(item.id);
            }}
            className={cn(toastStyle({ variant: item.variant ?? "default" }))}
          >
            <ToastPrimitive.Title className="font-medium">{item.title}</ToastPrimitive.Title>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed right-0 bottom-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext>
  );
}

export function useToastStore() {
  return use(ToastContext);
}
