import { useState, type ChangeEvent, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type Student = {
  id: number
  email: string
  name: string
  cpf: string
  course: string
  coursePeriod: string
}

type FormData = Omit<Student, "id">

export function SignupForm({ className }: { className?: string }) {
  const [students, setStudents] = useState<Student[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    cpf: "",
    course: "",
    coursePeriod: "",
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = event.target

    if (id === "course-period") {
      setFormData((prev) => ({ ...prev, coursePeriod: value }))
      return
    }

    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (editingId !== null) {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingId ? { ...student, ...formData } : student
        )
      )
      setEditingId(null)
    } else {
      const newStudent: Student = {
        id: Date.now(),
        ...formData,
      }
      setStudents((prev) => [...prev, newStudent])
    }

    setFormData({
      email: "",
      name: "",
      cpf: "",
      course: "",
      coursePeriod: "",
    })
  }

  const handleEdit = (student: Student) => {
    setEditingId(student.id)
    setFormData({
      email: student.email,
      name: student.name,
      cpf: student.cpf,
      course: student.course,
      coursePeriod: student.coursePeriod,
    })
  }

  const handleDelete = (id: number) => {
    setStudents((prev) => prev.filter((student) => student.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setFormData({
        email: "",
        name: "",
        cpf: "",
        course: "",
        coursePeriod: "",
      })
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{editingId ? "Editar Aluno" : "Criar Aluno"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="w-full" onSubmit={handleSubmit}>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
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
              <FieldLabel htmlFor="name">Nome Completo</FieldLabel>
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
              <FieldLabel htmlFor="cpf">CPF</FieldLabel>
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
              <FieldLabel htmlFor="course">Curso</FieldLabel>
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
              <FieldLabel htmlFor="course-period">Período/Turno</FieldLabel>
              <select
                id="course-period"
                name="course-period"
                className="h-9 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={formData.coursePeriod}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um período</option>
                <option value="matutino">Matutino</option>
                <option value="vespertino">Vespertino</option>
                <option value="noturno">Noturno</option>
                <option value="integral">Integral</option>
              </select>
            </Field>

            <Field className="w-full">
              <Button type="submit" className="w-full">
                {editingId ? "Salvar Alterações" : "Criar Aluno"}
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <div className="mt-6 rounded-xl border border-border/60 bg-muted/20 p-4">
          <h3 className="mb-3 text-sm font-semibold">Alunos cadastrados</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left">
                  <th className="py-2 pr-4 font-medium">Nome</th>
                  <th className="py-2 pr-4 font-medium">Curso</th>
                  <th className="py-2 pr-4 font-medium">CPF</th>
                  <th className="py-2 pr-4 font-medium">Turno</th>
                  <th className="py-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      Nenhum aluno cadastrado.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-b border-border/40">
                      <td className="py-2 pr-4">{student.name}</td>
                      <td className="py-2 pr-4">{student.course}</td>
                      <td className="py-2 pr-4">{student.cpf}</td>
                      <td className="py-2 pr-4">{student.coursePeriod}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(student)}>
                            Editar
                          </Button>
                          <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(student.id)}>
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
  )
}
