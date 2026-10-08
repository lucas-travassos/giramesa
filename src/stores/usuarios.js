import { defineStore } from 'pinia'
import api from '../services/api'
import { mensagemErro } from '../utils/erro'

// usuario_id vira id: o CrudManager generico trabalha com "id"
const normalizar = (u) => ({
  id: u.usuario_id,
  nome: u.nome,
  email: u.email,
  nivel_acesso: u.nivel_acesso,
  status: u.status,
})

export const useUsuariosStore = defineStore('usuarios', {
  state: () => ({
    usuarios: [],
    carregando: false,
    erro: '',
  }),
  actions: {
    async carregar() {
      this.carregando = true
      this.erro = ''
      try {
        const { data } = await api.get('/usuarios')
        this.usuarios = data.map(normalizar)
      } catch (e) {
        this.erro = mensagemErro(e, 'Não foi possível carregar os usuários.')
      } finally {
        this.carregando = false
      }
    },

    // Lanca erro se a API recusar: o CrudManager mostra a mensagem no modal
    async salvar(dados) {
      const corpo = {
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        nivel_acesso: dados.nivel_acesso,
        status: dados.status,
      }
      if (dados.senha) corpo.senha = dados.senha // em branco na edicao = manter a atual

      if (dados.id) await api.put(`/usuarios/${dados.id}`, corpo)
      else await api.post('/usuarios', corpo)
      await this.carregar()
    },

    async inativar(id) {
      await api.delete(`/usuarios/${id}`)
      await this.carregar()
    },
  },
})
