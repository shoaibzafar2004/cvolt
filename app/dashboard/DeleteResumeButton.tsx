"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteExpiredPurchase } from "./actions";

export default function DeleteResumeButton({
  paymentId,
  resumeName,
}: {
  paymentId: string;
  resumeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteExpiredPurchase(paymentId);
      if (result.ok) setOpen(false);
      else setError(result.error);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-destructive/30 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </button>

      <Dialog open={open} onOpenChange={(v) => !pending && setOpen(v)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{resumeName}”?</DialogTitle>
            <DialogDescription>
              This expired resume and its PDF will be permanently removed from
              your dashboard. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" disabled={pending} />}
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
            >
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
