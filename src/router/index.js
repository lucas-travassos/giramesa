import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import HomeView from '../views/HomeView.vue'
import PedidoView from '../views/PedidoView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import DashboardView from '../views/DashboardView.vue'
import UsuariosView from '../views/admin/UsuariosView.vue'
import MesasView from '../views/admin/MesasView.vue'
import ProdutosView from '../views/admin/ProdutosView.vue'

const TODOS = ['garcom', 'caixa', 'administrador']
const CAIXA = ['caixa', 'administrador']
const ADMIN = ['administrador']

// meta.perfis = quem pode acessar | meta.menu = rotulo no menu (se existir)
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: 'home', name: 'home', component: HomeView, meta: { perfis: TODOS, menu: 'Salão', ordem: 1 } },
        { path: 'pedido/:mesaId', name: 'pedido', component: PedidoView, meta: { perfis: TODOS } },
        { path: 'checkout/:mesaId', name: 'checkout', component: CheckoutView, meta: { perfis: CAIXA } },
        { path: 'dashboard', name: 'dashboard', component: DashboardView, meta: { perfis: ADMIN, menu: 'Dashboard', ordem: 2 } },
        { path: 'admin/mesas', name: 'admin-mesas', component: MesasView, meta: { perfis: ADMIN, menu: 'Mesas', ordem: 3 } },
        { path: 'admin/produtos', name: 'admin-produtos', component: ProdutosView, meta: { perfis: ADMIN, menu: 'Produtos', ordem: 4 } },
        { path: 'admin/usuarios', name: 'admin-usuarios', component: UsuariosView, meta: { perfis: ADMIN, menu: 'Usuários', ordem: 5 } },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.name === 'login') return auth.estaLogado ? { name: 'home' } : true
  if (!auth.estaLogado) return { name: 'login' }

  const perfis = to.meta.perfis
  if (perfis && !perfis.includes(auth.perfil)) return { name: 'home' }
})

export default router
