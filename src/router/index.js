import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import HomeView from '../views/HomeView.vue'
import PedidoView from '../views/PedidoView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import DashboardView from '../views/DashboardView.vue'
import UsuariosView from '../views/admin/UsuariosView.vue'
import MesasView from '../views/admin/MesasView.vue'
import ProdutosView from '../views/admin/ProdutosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'login', component: LoginView },
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: 'home', name: 'home', component: HomeView },
        { path: 'pedido/:mesaId', name: 'pedido', component: PedidoView },
        { path: 'checkout/:mesaId', name: 'checkout', component: CheckoutView },
        { path: 'dashboard', name: 'dashboard', component: DashboardView },
        { path: 'admin/usuarios', name: 'admin-usuarios', component: UsuariosView },
        { path: 'admin/mesas', name: 'admin-mesas', component: MesasView },
        { path: 'admin/produtos', name: 'admin-produtos', component: ProdutosView },
      ],
    },
  ],
})

export default router
