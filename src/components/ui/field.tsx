"use client";

import { createContext, use, useCallback, useEffect, useId, useMemo, useState } from "react";
import * as Label from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface FieldContextValue {
  controlId: string;
  labelId: string;
  describedBy: string | undefined;
  invalid: boolean | undefined;
  registerMessage: (id: string) => () => void;
}

const FieldContext = createContext<FieldContextValue | null>(null);

function useFieldContext() {
  const ctx = use(FieldContext);
  if (!ctx) {
    throw new Error("Field components must be used within a <Field />");
  }
  return ctx;
}

interface FieldProps extends React.ComponentPropsWithRef<"div"> {
  invalid?: boolean;
}

function FieldRoot({ invalid, className, children, ...props }: FieldProps) {
  const controlId = useId();
  const labelId = useId();
  const [messageIds, setMessageIds] = useState<string[]>([]);

  const registerMessage = useCallback((id: string) => {
    setMessageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    return () => {
      setMessageIds((prev) => prev.filter((existing) => existing !== id));
    };
  }, []);

  const describedBy = messageIds.length > 0 ? messageIds.join(" ") : undefined;

  const ctx = useMemo<FieldContextValue>(
    () => ({ controlId, labelId, describedBy, invalid, registerMessage }),
    [controlId, labelId, describedBy, invalid, registerMessage],
  );

  return (
    <FieldContext value={ctx}>
      <div
        className={cn("flex flex-col gap-1.5", className)}
        data-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </div>
    </FieldContext>
  );
}

function FieldLabel({ className, ...props }: React.ComponentPropsWithRef<"label">) {
  const { controlId, labelId } = useFieldContext();
  return (
    <Label.Root
      htmlFor={controlId}
      id={labelId}
      className={cn("text-base font-medium text-foreground", className)}
      {...props}
    />
  );
}

function FieldControl({ children }: { children: React.ReactNode }) {
  const { controlId, labelId, describedBy, invalid } = useFieldContext();
  return (
    <Slot
      id={controlId}
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
    >
      {children}
    </Slot>
  );
}

function FieldDescription({
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<"p">) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const { registerMessage } = useFieldContext();
  const hasContent = !!children;

  useEffect(() => {
    if (!hasContent) return;
    return registerMessage(id);
  }, [id, hasContent, registerMessage]);

  if (!hasContent) return null;

  return (
    <p id={id} className={cn("text-sm text-foreground-secondary", className)} {...props}>
      {children}
    </p>
  );
}

function FieldError({ className, children, ...props }: React.ComponentPropsWithRef<"p">) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const { registerMessage } = useFieldContext();
  const hasContent = !!children;

  useEffect(() => {
    if (!hasContent) return;
    return registerMessage(id);
  }, [id, hasContent, registerMessage]);

  if (!hasContent) return null;

  return (
    <p id={id} role="alert" className={cn("text-sm text-error", className)} {...props}>
      {children}
    </p>
  );
}

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
});
