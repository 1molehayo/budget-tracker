import { TrashIcon } from "@phosphor-icons/react/dist/ssr";
import type { Saving } from "@/types";
import { Badge } from "@/foundations/ui/badge/badge";
import { IconButton } from "@/foundations/ui/button/button";
import { Table } from "@/foundations/ui/table/table";
import { formatCurrency } from "@/utils/format";
import { getTagDisplayName } from "@/utils/tags";
import {
  increasesUsableGeneralPool,
  isExcludedFromUsableGeneralPool,
  summarizeSavings,
} from "@/utils/calculations";

interface SavingsTableProps {
  savings: Saving[];
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

function destinationLabel(saving: Saving) {
  if (saving.destinationType === "PROJECT") {
    return saving.project?.title || "Linked project";
  }
  return getTagDisplayName(saving.tag);
}

function poolEffect(saving: Saving) {
  if (saving.destinationType === "PROJECT") return "Project-linked only";
  if (isExcludedFromUsableGeneralPool(saving)) return "Excluded from pool";
  if (increasesUsableGeneralPool(saving)) return "Adds to usable pool";
  return "No pool effect";
}

export function SavingsTable({
  savings,
  showActions,
  onDelete,
}: SavingsTableProps) {
  const summary = summarizeSavings(savings);

  if (savings.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-foreground-secondary">
        No savings entries yet.
      </p>
    );
  }

  return (
    <Table.Container>
      <Table className="min-w-176" density="sm">
        <Table.Caption className="sr-only">Savings entries</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head>Label</Table.Head>
            <Table.Head>Destination</Table.Head>
            <Table.Head>Tag or project</Table.Head>
            <Table.Head>Pool effect</Table.Head>
            <Table.Head align="end">Amount</Table.Head>
            {showActions ? (
              <Table.Head className="w-14">
                <span className="sr-only">Actions</span>
              </Table.Head>
            ) : null}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {savings.map((saving) => (
            <Table.Row key={saving.id}>
              <Table.Cell className="font-medium">{saving.label}</Table.Cell>
              <Table.Cell>
                <Badge
                  size="sm"
                  className={
                    saving.destinationType === "PROJECT"
                      ? "bg-accent/10 text-accent ring-accent/20"
                      : "bg-teal/10 text-teal ring-teal/20"
                  }
                >
                  {saving.destinationType === "PROJECT" ? "Project" : "General"}
                </Badge>
              </Table.Cell>
              <Table.Cell>{destinationLabel(saving)}</Table.Cell>
              <Table.Cell className="text-foreground-secondary">
                {poolEffect(saving)}
              </Table.Cell>
              <Table.Cell align="end" className="font-semibold tabular-nums">
                {formatCurrency(saving.amount)}
              </Table.Cell>
              {showActions && onDelete ? (
                <Table.Cell align="end">
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete saving ${saving.label}`}
                    onClick={() => onDelete(saving.id)}
                  >
                    <TrashIcon className="size-4" />
                  </IconButton>
                </Table.Cell>
              ) : null}
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell colSpan={4}>
              <p>Total entered {formatCurrency(summary.totalEntered)}</p>
              <p className="mt-1 text-xs font-normal text-foreground-secondary">
                Usable pool {formatCurrency(summary.usableGeneralPool)} ·
                Excluded AJO {formatCurrency(summary.excludedGeneralTotal)} ·
                Project-linked {formatCurrency(summary.projectLinkedTotal)}
              </p>
            </Table.Cell>
            <Table.Cell align="end" className="tabular-nums">
              {formatCurrency(summary.totalEntered)}
            </Table.Cell>
            {showActions ? <Table.Cell /> : null}
          </Table.Row>
        </Table.Footer>
      </Table>
    </Table.Container>
  );
}
