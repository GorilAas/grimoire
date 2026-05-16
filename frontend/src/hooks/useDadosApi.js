import { useState, useEffect, useCallback, useRef } from 'react'

export function useDadosApi(buscarFn, dependencias = [], habilitado = true) {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(Boolean(habilitado))
  const [erro, setErro] = useState(null)
  const buscarFnRef = useRef(buscarFn)

  buscarFnRef.current = buscarFn

  const buscar = useCallback(async () => {
    if (!habilitado) {
      setCarregando(false)
      return
    }
    setCarregando(true)
    setErro(null)
    try {
      const resposta = await buscarFnRef.current()
      setDados(resposta.data)
    } catch (err) {
      setErro(err)
    } finally {
      setCarregando(false)
    }
  }, [habilitado, ...dependencias])

  useEffect(() => {
    buscar()
  }, [buscar])

  return { dados, carregando, erro, recarregar: buscar }
}
