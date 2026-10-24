"use client";

import { useState } from "react";
import { Button } from "@/foundations/ui/button/button";
import { Field } from "@/foundations/ui/field/field";
import { Input } from "@/foundations/ui/input/input";
import { Select } from "@/foundations/ui/select/select";
import { createMonth } from "@/app/actions/months";
import { readActionError } from "@/lib/read-action-error";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CreateMonthForm() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const [error, setError] = useState("");

  function submit(formData: FormData) {
    setError("");
    return createMonth(formData).then((result) => {
      const error = readActionError(result);
      if (error) setError(error);
    });
  }

  return (
    <form action={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Field>
        <Field.Label>Label</Field.Label>
        <Field.Control>
          <Input name="label" defaultValue={`${MONTHS[now.getMonth()]} ${now.getFullYear()}`} required />
        </Field.Control>
      </Field>
      <Field>
        <Field.Label>Month</Field.Label>
        <Field.Control>
          <Select name="month" defaultValue={String(now.getMonth() + 1)}>
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </Select>
        </Field.Control>
      </Field>
      <Field>
        <Field.Label>Year</Field.Label>
        <Field.Control>
          <Input name="year" type="number" defaultValue={String(currentYear)} max={currentYear} required />
        </Field.Control>
              <Field.Description>Only the current month or earlier can be created.</Field.Description>
              {error ? <Field.Error>{error}</Field.Error> : null}
            </Field>
            <div className="md:self-end">
        <Button type="submit" className="w-full">
          Create
        </Button>
      </div>
    </form>
  );
}
