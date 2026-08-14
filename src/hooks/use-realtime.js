import { useEffect, useRef, useState } from "react"

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:3333/ws"

/**
 * Conecta ao backend via WebSocket e mantém em tempo real:
 * - a lista de vagas (tabela "vagas")
 * - a lista de alunos (tabela "alunos")
 * - a última notificação recebida (cadastro de aluno, vaga, etc.)
 *
 * Reconecta automaticamente caso a conexão caia.
 *
 * @returns {{
 *   connected: boolean,
 *   vagas: Array<object>,
 *   alunos: Array<object>,
 *   notification: {message: string, level: "success"|"info"|"error"} | null
 * }}
 */
export function useRealtime() {
  const [connected, setConnected] = useState(false)
  const [vagas, setVagas] = useState([])
  const [alunos, setAlunos] = useState([])
  const [notification, setNotification] = useState(null)

  const socketRef = useRef(null)

  useEffect(() => {
    let reconnectTimer

    const connect = () => {
      const socket = new WebSocket(WS_URL)
      socketRef.current = socket

      socket.onopen = () => setConnected(true)

      socket.onclose = () => {
        setConnected(false)
        // tenta reconectar em 2s
        reconnectTimer = setTimeout(connect, 2000)
      }

      socket.onerror = () => {
        socket.close()
      }

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case "vagas:list":
            setVagas(message.payload)
            break

          case "vagas:created":
            setVagas((prev) => [message.payload, ...prev])
            break

          case "vagas:updated":
            setVagas((prev) =>
              prev.map((v) =>
                v.id === message.payload.id ? message.payload : v
              )
            )
            break

          case "vagas:deleted":
            setVagas((prev) =>
              prev.filter((v) => v.id !== message.payload.id)
            )
            break

          case "alunos:list":
            setAlunos(message.payload)
            break

          case "alunos:created":
            setAlunos((prev) => [message.payload, ...prev])
            break

          case "alunos:updated":
            setAlunos((prev) =>
              prev.map((a) =>
                a.id === message.payload.id ? message.payload : a
              )
            )
            break

          case "alunos:deleted":
            setAlunos((prev) =>
              prev.filter((a) => a.id !== message.payload.id)
            )
            break

          case "notification":
            setNotification(message.payload)
            break

          default:
            break
        }
      }
    }

    connect()

    return () => {
      clearTimeout(reconnectTimer)
      socketRef.current?.close()
    }
  }, [])

  return { connected, vagas, alunos, notification }
}
