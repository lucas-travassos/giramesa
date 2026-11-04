<template>
  <div class="container py-4 pedido-tela">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">Pedido — Mesa {{ mesa?.numero }}</h1>
      <button class="btn btn-outline-secondary btn-sm" @click="$router.push('/home')">
        <i aria-hidden="true" class="bi bi-arrow-left me-1"></i>Voltar
      </button>
    </div>

    <EstadoConteudo :carregando="carregando" :erro="erroCarga" @recarregar="carregarTela">
      <div class="row g-4">
        <!-- Coluna produtos -->
        <div class="col-lg-7">
          <p v-if="!produtosStore.categorias.length" class="text-muted">
            Nenhum produto disponível.
          </p>

          <ul
            v-else
            class="nav nav-pills categorias-pedido mb-3"
            aria-label="Categorias de produtos"
          >
            <li v-for="cat in produtosStore.categorias" :key="cat" class="nav-item">
              <button
                class="nav-link"
                :class="{ active: categoriaAtiva === cat }"
                :aria-pressed="categoriaAtiva === cat"
                @click="categoriaAtiva = cat"
              >
                {{ cat }}
              </button>
            </li>
          </ul>

          <div class="row g-2">
            <div
              v-for="produto in produtosStore.produtosPorCategoria(categoriaAtiva)"
              :key="produto.id"
              class="col-12 col-md-6"
            >
              <ProdutoCard :ocupado="enviando" :produto="produto" @adicionar="adicionarProduto" />
            </div>
          </div>
        </div>

        <!-- Coluna pedido -->
        <div class="col-lg-5">
          <aside
            class="carrinho-pedido"
            :class="{ aberto: carrinhoAberto }"
            aria-label="Carrinho da mesa"
          >
            <button
              ref="resumoCarrinho"
              class="btn resumo-carrinho d-lg-none w-100 text-start"
              :aria-expanded="carrinhoAberto"
              aria-controls="detalhes-carrinho"
              @click="carrinhoAberto = !carrinhoAberto"
            >
              <span
                ><i aria-hidden="true" class="bi bi-basket me-2"></i
                >{{ quantidadeNova }} novos itens · R$ {{ totalNovo.toFixed(2) }}</span
              >
              <span class="small"
                >{{ carrinhoAberto ? 'Recolher' : 'Revisar pedido' }}
                <i
                  aria-hidden="true"
                  class="bi"
                  :class="carrinhoAberto ? 'bi-chevron-down' : 'bi-chevron-up'"
                ></i
              ></span>
            </button>
            <div id="detalhes-carrinho" class="detalhes-carrinho" :aria-busy="enviando">
              <div class="card shadow-sm">
                <div class="card-body">
                  <!-- Ja enviado (somente leitura) -->
                  <template v-if="consumidos.length">
                    <h5 class="card-title">Já consumido</h5>
                    <div
                      v-for="item in consumidos"
                      :key="item.id"
                      class="d-flex justify-content-between small py-1 border-bottom"
                    >
                      <span>{{ item.quantidade }}x {{ item.nome }}</span>
                      <span>R$ {{ (item.quantidade * item.preco).toFixed(2) }}</span>
                    </div>
                    <div class="d-flex justify-content-between small fw-semibold mt-2 mb-4">
                      <span>Subtotal consumido</span>
                      <span>R$ {{ totalConsumido.toFixed(2) }}</span>
                    </div>
                  </template>

                  <!-- Carrinho (ainda nao enviado) -->
                  <h5 class="card-title">Novos itens</h5>

                  <div v-if="itens.length === 0" class="text-muted small py-3 text-center">
                    Nenhum item adicionado ainda.
                  </div>

                  <ItemPedido
                    v-for="item in itens"
                    :key="item.produtoId"
                    :item="item"
                    :ocupado="enviando"
                    @adicionar-unidade="
                      pedidosStore.adicionarProduto(mesaId, buscarProduto(item.produtoId))
                    "
                    @remover-unidade="pedidosStore.removerUnidade(mesaId, item.produtoId)"
                    @remover-produto="pedidosStore.removerProduto(mesaId, item.produtoId)"
                  />

                  <div
                    v-if="consumidos.length"
                    class="d-flex justify-content-between small text-muted mt-3"
                  >
                    <span>Novos itens</span>
                    <span>R$ {{ totalNovo.toFixed(2) }}</span>
                  </div>
                  <div class="d-flex justify-content-between mt-2 fw-bold fs-5">
                    <span>Total da mesa</span>
                    <span>R$ {{ (totalConsumido + totalNovo).toFixed(2) }}</span>
                  </div>

                  <div
                    v-if="erroEnvio"
                    class="alert alert-danger py-2 small mt-3 mb-0"
                    role="alert"
                  >
                    {{ erroEnvio }}
                  </div>

                  <button
                    class="btn btn-success w-100 mt-3"
                    :disabled="itens.length === 0 || enviando"
                    @click="enviarPedido"
                  >
                    <span v-if="enviando" class="spinner-border spinner-border-sm me-2"></span>
                    <i aria-hidden="true" v-else class="bi bi-send-check me-1"></i>
                    {{ enviando ? 'Enviando...' : 'Enviar pedido' }}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </EstadoConteudo>
  </div>
</template>

<script setup>
import EstadoConteudo from '../components/EstadoConteudo.vue'
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMesasStore } from '../stores/mesas'
import { useProdutosStore } from '../stores/produtos'
import { usePedidosStore } from '../stores/pedidos'
import ProdutoCard from '../components/pedido/ProdutoCard.vue'
import ItemPedido from '../components/pedido/ItemPedido.vue'

const route = useRoute()
const router = useRouter()

const mesasStore = useMesasStore()
const produtosStore = useProdutosStore()
const pedidosStore = usePedidosStore()

const mesaId = Number(route.params.mesaId)
const mesa = computed(() => mesasStore.getMesaById(mesaId))

const categoriaAtiva = ref('')
const carrinhoAberto = ref(false)
const resumoCarrinho = ref(null)
const quantidadeNova = computed(() => itens.value.reduce((soma, item) => soma + item.quantidade, 0))
const consumidos = ref([])
const carregando = ref(true)
const erroCarga = ref('')
const enviando = ref(false)
const erroEnvio = ref('')

const itens = computed(() => pedidosStore.itensDaMesa(mesaId))
const totalNovo = computed(() => pedidosStore.totalDaMesa(mesaId))
const totalConsumido = computed(() =>
  consumidos.value.reduce((soma, i) => soma + i.quantidade * i.preco, 0),
)

function buscarProduto(produtoId) {
  return produtosStore.produtos.find((p) => p.id === produtoId)
}

function adicionarProduto(produto) {
  pedidosStore.adicionarProduto(mesaId, produto)
}

// itens ja gravados no banco para o pedido aberto desta mesa (se existir)
async function carregarConsumo() {
  const pedido = await pedidosStore.buscarPedidoAberto(mesaId)
  consumidos.value = (pedido?.ItemPedidos ?? [])
    .map((i) => ({
      id: i.item_id,
      nome: i.nome_produto ?? i.Produto?.nome ?? 'Produto',
      quantidade: i.quantidade,
      preco: parseFloat(i.preco_unitario),
    }))
    .sort((a, b) => a.id - b.id)
}

async function carregarTela() {
  carregando.value = true
  erroCarga.value = ''

  await Promise.all([produtosStore.carregar(), mesasStore.carregar()])
  if (produtosStore.erro || mesasStore.erro) {
    erroCarga.value = produtosStore.erro || mesasStore.erro
    carregando.value = false
    return
  }

  if (!mesa.value || ['caixa', 'inativa'].includes(mesa.value.status)) {
    router.replace('/home')
    return
  }

  try {
    await carregarConsumo()
  } catch (e) {
    erroCarga.value = e.response?.data?.erro ?? 'Não foi possível carregar o consumo da mesa.'
    carregando.value = false
    return
  }

  if (!categoriaAtiva.value) categoriaAtiva.value = produtosStore.categorias[0] ?? ''
  carregando.value = false
}

async function enviarPedido() {
  if (enviando.value || !itens.value.length) return
  enviando.value = true
  erroEnvio.value = ''
  try {
    await pedidosStore.enviarPedido(mesaId)
    router.push('/home')
  } catch (e) {
    carrinhoAberto.value = true
    await nextTick()
    resumoCarrinho.value?.focus()
    erroEnvio.value = e.response?.data?.erro ?? 'Não foi possível enviar o pedido. Tente novamente.'
    try {
      await carregarConsumo() // reflete o que ja foi gravado antes da falha
    } catch {
      // mantem o que ja esta na tela
    }
  } finally {
    enviando.value = false
  }
}

onMounted(carregarTela)
</script>
