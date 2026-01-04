import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  transaction_date: string
  category: string
  amount: number
  description: string
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  // Empty state handling
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50">
        <p className="text-zinc-500 font-medium tracking-tight">
          No transactions found. Add your first spending to see it here.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
      <Table>
        <TableHeader className="bg-zinc-900/30">
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 py-4">Date</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 py-4">Category</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 py-4">Description</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 py-4">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TableRow 
              key={t.id} 
              className="border-zinc-800 hover:bg-zinc-900/30 transition-all duration-200"
            >
              <TableCell className="font-semibold text-zinc-300 py-4">
                {new Date(t.transaction_date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                })}
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-400 font-bold text-[10px] tracking-wide px-2 py-0.5">
                  {t.category}
                </Badge>
              </TableCell>
              <TableCell className="text-zinc-500 italic py-4 text-sm">
                {t.description || "—"}
              </TableCell>
              <TableCell className="text-right font-black text-white py-4 text-lg">
                ₹{Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}