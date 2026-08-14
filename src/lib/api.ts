const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api"

export type Aluno = {
  id: string
  email: string
  name: string
  cpf: string
  course: string
  coursePeriod: string
  createdAt: string
}

export type AlunoInput = Omit<Aluno, "id" | "createdAt">

export type Vaga = {
  id: string
  titulo: string
  empresa: string
  local: string
  tipo: "clt" | "pj" | "estagio" | "freelancer"
  turno: "matutino" | "vespertino" | "noturno" | "integral"
  salario: number | null
  descricao: string
  createdAt: string
}

export type VagaInput = Omit<Vaga, "id" | "createdAt">

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? `Erro ${res.status} ao chamar ${path}`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const alunosApi = {
  list: () => request<Aluno[]>("/alunos"),
  create: (input: AlunoInput) =>
    request<Aluno>("/alunos", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: string, input: Partial<AlunoInput>) =>
    request<Aluno>(`/alunos/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    request<void>(`/alunos/${id}`, { method: "DELETE" }),
}

export const vagasApi = {
  list: () => request<Vaga[]>("/vagas"),
  create: (input: VagaInput) =>
    request<Vaga>("/vagas", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: string, input: Partial<VagaInput>) =>
    request<Vaga>(`/vagas/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  remove: (id: string) =>
    request<void>(`/vagas/${id}`, { method: "DELETE" }),
}
