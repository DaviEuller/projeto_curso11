import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"

import { useRealtime } from "@/hooks/use-realtime"
import { alunosApi, type Aluno, type AlunoInput } from "@/lib/api"

export function SignupForm({ className }: { className?: string }) {
  // alunos e notificações chegam em tempo real via WebSocket
  const { alunos, notification, connected } = useRealtime() as {
    alunos: Aluno[]
    notification: { message: string; level: "success" | "info" | "error" } | null
    connected: boolean
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertVariant, setAlertVariant] = useState<"default" | "destructive">(
    "default"
  )

  const [formData, setFormData] = useState<AlunoInput>({
    email: "",
    name: "",
    cpf: "",
    course: "",
    coursePeriod: "",
  })

  // Sempre que o backend faz broadcast de uma notificação (cadastro,
  // edição ou exclusão de aluno/vaga), ela aparece aqui automaticamente —
  // inclusive se a ação tiver sido feita em outra aba/dispositivo.
  useEffect(() => {
    if (!notification) return

    setAlertMessage(notification.message)
    setAlertVariant(notification.level === "error" ? "destructive" : "default")
    setShowAlert(true)

    const timer = setTimeout(() => setShowAlert(false), 3000)

    return () => clearTimeout(timer)
  }, [notification])

  const showLocalError = (message: string) => {
    setAlertMessage(message)
    setAlertVariant("destructive")
    setShowAlert(true)

    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = event.target

    if (id === "course-period") {
      setFormData((prev) => ({
        ...prev,
        coursePeriod: value,
      }))

      return
    }

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      cpf: "",
      course: "",
      coursePeriod: "",
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      if (editingId !== null) {
        await alunosApi.update(editingId, formData)
        setEditingId(null)
      } else {
        await alunosApi.create(formData)
      }

      // A notificação de sucesso e a atualização da tabela chegam via
      // WebSocket assim que o backend confirma a operação.
      resetForm()
    } catch (error) {
      showLocalError(
        error instanceof Error ? error.message : "Erro ao salvar aluno."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (aluno: Aluno) => {
    setEditingId(aluno.id)

    setFormData({
      email: aluno.email,
      name: aluno.name,
      cpf: aluno.cpf,
      course: aluno.course,
      coursePeriod: aluno.coursePeriod,
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await alunosApi.remove(id)

      if (editingId === id) {
        setEditingId(null)
        resetForm()
      }
    } catch (error) {
      showLocalError(
        error instanceof Error ? error.message : "Erro ao excluir aluno."
      )
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {showAlert && (
        <Alert
          variant={alertVariant}
          className="fixed top-4 right-4 z-50 w-auto max-w-sm shadow-lg"
        >
          <AlertTitle>
            {alertVariant === "destructive" ? "Erro" : "Sucesso"}
          </AlertTitle>

          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {editingId !== null
              ? "Editar Aluno"
              : "Criar Aluno"}
          </CardTitle>

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
          <form
            className="w-full"
            onSubmit={handleSubmit}
          >
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="email">
                  Email
                </FieldLabel>

                <Input
                  id="email"
                  type="email"
                  placeholder="m@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="name">
                  Nome Completo
                </FieldLabel>

                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="cpf">
                  CPF
                </FieldLabel>

                <Input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="course">
                  Curso
                </FieldLabel>

                <Input
                  id="course"
                  type="text"
                  placeholder="Ex: Engenharia de Software"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="course-period">
                  Período/Turno
                </FieldLabel>

                <select
                  id="course-period"
                  name="course-period"
                  className="h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  value={formData.coursePeriod}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Selecione um período
                  </option>

                  <option value="matutino">
                    Matutino
                  </option>

                  <option value="vespertino">
                    Vespertino
                  </option>

                  <option value="noturno">
                    Noturno
                  </option>

                  <option value="integral">
                    Integral
                  </option>
                </select>
              </Field>

              <Field className="w-full">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting
                    ? "Salvando..."
                    : editingId !== null
                      ? "Salvar Alterações"
                      : "Criar Aluno"}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          <div className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-4">
            <h3 className="mb-3 text-sm font-semibold">
              Alunos cadastrados
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left">
                    <th className="py-2 pr-4 font-medium">
                      Nome
                    </th>

                    <th className="py-2 pr-4 font-medium">
                      Curso
                    </th>

                    <th className="py-2 pr-4 font-medium">
                      CPF
                    </th>

                    <th className="py-2 pr-4 font-medium">
                      Turno
                    </th>

                    <th className="py-2 font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {alunos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-muted-foreground"
                      >
                        Nenhum aluno cadastrado.
                      </td>
                    </tr>
                  ) : (
                    alunos.map((aluno: Aluno) => (
                      <tr
                        key={aluno.id}
                        className="border-b border-border/40"
                      >
                        <td className="py-2 pr-4">
                          {aluno.name}
                        </td>

                        <td className="py-2 pr-4">
                          {aluno.course}
                        </td>

                        <td className="py-2 pr-4">
                          {aluno.cpf}
                        </td>

                        <td className="py-2 pr-4">
                          {aluno.coursePeriod}
                        </td>

                        <td className="py-2">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEdit(aluno)
                              }
                            >
                              Editar
                            </Button>

                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDelete(aluno.id)
                              }
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
