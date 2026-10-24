import { TrashIcon } from "@phosphor-icons/react/dist/ssr";
import type { Income } from "@/types";
import { Badge } from "@/foundations/ui/badge/badge";
import { IconButton } from "@/foundations/ui/button/button";
import { Table } from "@/foundations/ui/table/table";
import { formatCurrency } from "@/utils/format";
import { getTagDisplayName } from "@/utils/tags";

interface IncomeTableProps {
  incomes: Income[];
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export function IncomeTable({
  incomes,
  showActions,
  onDelete,
}: IncomeTableProps) {
  const total = incomes.reduce((sum, item) => sum + item.amount, 0);

  if (incomes.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-foreground-secondary">
        No income entries yet.
      </p>
    );
  }

  return (
    <Table.Container>
      <Table className="min-w-xl" density="sm">
        <Table.Caption className="sr-only">Income entries</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head>Entry</Table.Head>
            <Table.Head>Income source</Table.Head>
            <Table.Head align="end">Amount</Table.Head>
            {showActions ? (
              <Table.Head className="w-14">
                <span className="sr-only">Actions</span>
              </Table.Head>
            ) : null}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {incomes.map((income) => (
            <Table.Row key={income.id}>
              <Table.Cell className="font-medium">{income.label}</Table.Cell>
              <Table.Cell>
                <Badge size="sm" variant="success">
                  {getTagDisplayName(income.tag)}
                </Badge>
              </Table.Cell>
              <Table.Cell
                align="end"
                className="font-semibold tabular-nums text-success"
              >
                {formatCurrency(income.amount)}
              </Table.Cell>
              {showActions && onDelete ? (
                <Table.Cell align="end">
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete income ${income.label}`}
                    onClick={() => onDelete(income.id)}
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
            <Table.Cell align="end" className="tabular-nums text-success">
              {formatCurrency(total)}
            </Table.Cell>
            {showActions ? <Table.Cell /> : null}
          </Table.Row>
        </Table.Footer>
      </Table>
    </Table.Container>
  );
}
