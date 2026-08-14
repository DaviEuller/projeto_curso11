import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useRealtime } from "@/hooks/use-realtime"
import type { Vaga } from "@/lib/api"

const tipoLabel: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  estagio: "Estágio",
  freelancer: "Freelancer",
}

const turnoLabel: Record<string, string> = {
  matutino: "Matutino",
  vespertino: "Vespertino",
  noturno: "Noturno",
  integral: "Integral",
}

function formatSalario(salario: number | null) {
  if (salario === null || salario === undefined) return "A combinar"

  return salario.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function VagasPage() {
  // A lista chega via WebSocket e se atualiza sozinha sempre que
  // alguém cria, edita ou remove uma vaga — sem precisar dar refresh.
  const { vagas, connected } = useRealtime() as {
    vagas: Vaga[]
    connected: boolean
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vagas disponíveis</CardTitle>

          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            {connected ? "Tempo real conectado" : "Reconectando..."}
          </span>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left">
                  <th className="py-2 pr-4 font-medium">Vaga</th>
                  <th className="py-2 pr-4 font-medium">Empresa</th>
                  <th className="py-2 pr-4 font-medium">Local</th>
                  <th className="py-2 pr-4 font-medium">Tipo</th>
                  <th className="py-2 pr-4 font-medium">Turno</th>
                  <th className="py-2 font-medium">Salário</th>
                </tr>
              </thead>

              <tbody>
                {vagas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 text-center text-muted-foreground"
                    >
                      Nenhuma vaga disponível no momento.
                    </td>
                  </tr>
                ) : (
                  vagas.map((vaga: Vaga) => (
                    <tr
                      key={vaga.id}
                      className="border-b border-border/40"
                    >
                      <td className="py-2 pr-4">{vaga.titulo}</td>
                      <td className="py-2 pr-4">{vaga.empresa}</td>
                      <td className="py-2 pr-4">{vaga.local}</td>
                      <td className="py-2 pr-4">
                        {tipoLabel[vaga.tipo] ?? vaga.tipo}
                      </td>
                      <td className="py-2 pr-4">
                        {turnoLabel[vaga.turno] ?? vaga.turno}
                      </td>
                      <td className="py-2">
                        {formatSalario(vaga.salario)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
