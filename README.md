# 💰 platita - administrador Financiero Personal

## 🎯 ¿Por qué existe este proyecto?

**Platita** nació de una necesidad personal: quería tener control total sobre mis finanzas de una manera simple, visual y efectiva. Después de probar varias aplicaciones de finanzas personales, me di cuenta de que ninguna se adaptaba perfectamente a mis necesidades específicas.

Este proyecto es mi solución personal para:
- 📊 **Visualizar mi situación financiera** de un vistazo
- 💸 **Controlar mis gastos** de manera categorizada y organizada
- 💰 **Seguir mis ahorros** y ver el progreso hacia mis metas
- 🎯 **Planificar compras futuras** con una lista de deseos inteligente
- 📈 **Tomar decisiones financieras** basadas en datos reales

## 🚀 ¿Qué hace esta aplicación?

**platita** es una aplicación web moderna que te permite:

### 📊 Dashboard Inteligente
- Vista general de tu situación financiera actual
- Gráficos y métricas en tiempo real
- Resumen de gastos, ahorros y metas

### 💼 Gestión de Ingresos
- Configuración de tu sueldo mensual
- Seguimiento de ingresos adicionales
- Cálculo automático de disponibilidad

### 💸 Control de Gastos
- Registro de gastos con categorías personalizables
- Análisis de patrones de gasto
- Alertas de presupuesto

### 🎯 Sistema de Ahorros
- Seguimiento de ahorros mensuales
- Metas de ahorro con progreso visual
- Historial completo de ahorros

### 🛒 Lista de Deseos Inteligente
- Planificación de compras futuras
- Cálculo automático de tiempo para alcanzar metas
- Priorización de deseos

## 🛠️ ¿Con qué está construido?

### Frontend
- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Para un código más robusto y mantenible
- **Tailwind CSS** - Estilos modernos y responsivos
- **Lucide React** - Iconos hermosos y consistentes
- **Shadcn/ui** - Componentes de UI reutilizables

### Backend & Base de Datos
- **Prisma ORM** - Para una gestión eficiente de la base de datos
- **Supabase** - Base de datos PostgreSQL en la nube
- **NextAuth.js** - Autenticación segura y confiable

### Características Técnicas
- ⚡ **Rendimiento optimizado** con Next.js
- 🔒 **Autenticación segura** con múltiples proveedores
- 📱 **Diseño responsivo** para todos los dispositivos
- 🌙 **Modo oscuro/claro** integrado
- 🔄 **Sincronización en tiempo real** de datos

## 🚀 ¿Cómo empezar?

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase

### Instalación Rápida

1. **Clona el proyecto**
   ```bash
   git clone https://github.com/tu-usuario/financetracker.git
   cd financetracker
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura la base de datos**
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Copia tu connection string
   - Crea un archivo `.env.local`:
   ```env
   DATABASE_URL="tu-connection-string-de-supabase"
   DIRECT_URL="tu-connection-string-de-supabase"
   ```

4. **Inicializa la base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **¡Ejecuta la aplicación!**
   ```bash
   npm run dev
   ```

   Visita `http://localhost:3000` y ¡comienza a controlar tus finanzas!

## 🤝 ¿Quieres colaborar?

¡Me encantaría que te unas al proyecto! Si te interesa la gestión financiera personal o quieres contribuir con código, ideas o feedback, aquí tienes varias formas de conectarte:

### 📱 Sígueme en redes sociales
- **Twitter/X**: [@fabricastro_](https://twitter.com/tu-usuario)
- **LinkedIn**: [@fabricio-castrodev](https://linkedin.com/in/tu-perfil)
- **GitHub**: [@fabricastro](https://github.com/tu-usuario)

### 💡 Formas de contribuir
- 🐛 **Reportar bugs** - Abre un issue en GitHub
- ✨ **Sugerir nuevas características** - Comparte tus ideas
- 🔧 **Contribuir código** - Envía un pull request
- 📖 **Mejorar documentación** - Ayuda a otros desarrolladores
- 🌟 **Dar una estrella** - Si te gusta el proyecto

### 🎯 Próximas características
- 📱 Aplicación móvil nativa
- 🔔 Notificaciones de gastos
- 📊 Reportes avanzados y exportación
- 🔗 Integración con bancos
- 🌍 Soporte multiidioma

**¿Te gustó el proyecto? ¡Dale una estrella ⭐ en GitHub y compártelo con otros!**

*Construido con ❤️ para ayudar a todos a tener un mejor control de sus finanzas personales.*
