import { TrashIcon } from "@phosphor-icons/react/dist/ssr";
import type { BudgetLineItem } from "@/types";
import { Badge } from "@/foundations/ui/badge/badge";
import { IconButton } from "@/foundations/ui/button/button";
import { Table } from "@/foundations/ui/table/table";
import { formatCurrency } from "@/utils/format";

interface BudgetLineItemsTableProps {
  lineItems: BudgetLineItem[];
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function BudgetLineItemsTable({
  lineItems,
  showActions,
  onDelete,
}: BudgetLineItemsTableProps) {
  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

  if (lineItems.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-foreground-secondary">
        No budget line items yet.
      </p>
    );
  }

  return (
    <Table.Container>
      <Table className="min-w-lg" density="sm">
        <Table.Caption className="sr-only">Budget line items</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head>Description</Table.Head>
            <Table.Head>Category</Table.Head>
            <Table.Head align="end">Amount</Table.Head>
            {showActions ? (
              <Table.Head className="w-14">
                <span className="sr-only">Actions</span>
              </Table.Head>
            ) : null}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {lineItems.map((lineItem) => (
            <Table.Row key={lineItem.id}>
              <Table.Cell className="font-medium">{lineItem.label}</Table.Cell>
              <Table.Cell>
                {lineItem.category ? (
                  <Badge size="sm" variant="warning">
                    {lineItem.category}
                  </Badge>
                ) : (
                  "—"
                )}
              </Table.Cell>
              <Table.Cell
                align="end"
                className="font-semibold tabular-nums text-error"
              >
                {formatCurrency(lineItem.amount)}
              </Table.Cell>
              {showActions && onDelete ? (
                <Table.Cell align="end">
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete budget item ${lineItem.label}`}
                    onClick={() => onDelete(lineItem.id)}
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
            <Table.Cell colSpan={2}>Total</Table.Cell>
            <Table.Cell align="end" className="tabular-nums text-error">
              {formatCurrency(total)}
            </Table.Cell>
            {showActions ? <Table.Cell /> : null}
          </Table.Row>
        </Table.Footer>
      </Table>
    </Table.Container>
  );
}
