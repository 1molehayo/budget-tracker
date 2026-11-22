import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { act, createElement, useState, type ReactElement } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";
import { Dialog } from "./dialog";
import { Drawer } from "./drawer";
import { Field } from "./field";
import { Input } from "./input";
import { toast, Toaster } from "./toast";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
  document.body.style.pointerEvents = "";
});

function DialogExample({
  initialOpen = true,
}: {
  initialOpen?: boolean;
}): ReactElement {
  const [open, setOpen] = useState(initialOpen);
  return createElement(
    Dialog,
    { open, onOpenChange: setOpen },
    createElement(
      Dialog.Content,
      null,
      createElement(Dialog.Title, null, "Edit project"),
      createElement(Dialog.Description, null, "Update the project details."),
      createElement("button", { type: "button" }, "Save changes"),
    ),
  );
}

function DrawerExample({
  initialOpen = true,
}: {
  initialOpen?: boolean;
}): ReactElement {
  const [open, setOpen] = useState(initialOpen);
  return createElement(
    "div",
    null,
    createElement("button", { type: "button", onClick: () => setOpen(true) }, "Open menu"),
    createElement(
      Drawer,
      { open, onOpenChange: setOpen },
      createElement(
        Drawer.Content,
        { side: "left" },
        createElement("a", { href: "/dashboard" }, "Dashboard"),
      ),
    ),
  );
}

describe("Dialog", () => {
  it("exposes dialog semantics and closes on Escape", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(createElement(DialogExample));

    const dialog = await screen.findByRole("dialog");
    assert.equal(dialog.getAttribute("data-state"), "open");
    assert.ok(screen.getByRole("heading", { name: "Edit project" }));
    assert.ok(screen.getByText("Update the project details."));

    await user.keyboard("{Escape}");
    await waitFor(() => {
      assert.equal(screen.queryByRole("dialog"), null);
    });
  });
});

describe("Drawer", () => {
  it("opens as a left dialog panel and closes on Escape", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(createElement(DrawerExample, { initialOpen: false }));

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = await screen.findByRole("dialog");
    assert.ok(screen.getByRole("link", { name: "Dashboard" }));
    assert.ok(dialog.className.includes("left-0"));

    await user.keyboard("{Escape}");
    await waitFor(() => {
      assert.equal(screen.queryByRole("dialog"), null);
    });
  });
});

describe("Checkbox", () => {
  it("toggles checked state through onCheckedChange", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    function Controlled(): ReactElement {
      const [checked, setChecked] = useState(false);
      return createElement(Checkbox, {
        checked,
        onCheckedChange: (value: boolean | "indeterminate") => setChecked(value === true),
        "aria-label": "Select month",
      });
    }

    render(createElement(Controlled));
    const box = screen.getByRole("checkbox", { name: "Select month" });
    assert.equal(box.getAttribute("data-state"), "unchecked");
    await user.click(box);
    assert.equal(box.getAttribute("data-state"), "checked");
  });
});

describe("Field", () => {
  it("associates label, description, and error with the control", async () => {
    render(
      createElement(
        Field,
        { invalid: true },
        createElement(Field.Label, null, "Email address"),
        createElement(Field.Control, null, createElement(Input, { type: "email" })),
        createElement(Field.Description, null, "Use your household email."),
        createElement(Field.Error, null, "Email is required."),
      ),
    );

    const input = await screen.findByLabelText("Email address");
    const description = screen.getByText("Use your household email.");
    const error = screen.getByRole("alert");

    assert.equal(error.textContent, "Email is required.");
    assert.equal(input.getAttribute("aria-invalid"), "true");
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    assert.ok(describedBy.includes(description.id));
    assert.ok(describedBy.includes(error.id));
  });
});

describe("Toast", () => {
  it("publishes a negative toast while Toaster is mounted", async () => {
    render(createElement(Toaster));
    await act(async () => {
      await Promise.resolve();
      toast({ title: "Could not save project", variant: "negative" });
    });
    assert.equal(
      (await screen.findByText("Could not save project")).textContent,
      "Could not save project",
    );
  });
});
