# Finance Tracker - Administrador Financiero Personal

Una aplicación web moderna para administrar tus finanzas personales, construida con Next.js, Supabase y Prisma.

## 🚀 Características

- **Dashboard financiero**: Vista general de tu situación financiera
- **Gestión de sueldo**: Configura tu sueldo mensual
- **Control de gastos**: Registra y categoriza tus gastos
- **Seguimiento de ahorros**: Lleva un registro de tus ahorros
- **Lista de deseos**: Planifica tus compras futuras con seguimiento de progreso
- **Persistencia de datos**: Todos los datos se almacenan en Supabase

## 🛠️ Tecnologías

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Prisma** - ORM para base de datos
- **Supabase** - Base de datos PostgreSQL en la nube
- **Lucide React** - Iconos

## 📦 Instalación

1. **Clona el repositorio**
   ```bash
   git clone <tu-repo>
   cd financetracker
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura Supabase**
   - Crea una cuenta en [Supabase](https://supabase.com)
   - Crea un nuevo proyecto
   - Ve a Settings > Database y copia la connection string

4. **Configura las variables de entorno**
   Crea un archivo `.env.local` con:
   ```
   DATABASE_URL="tu-connection-string-de-supabase"
   DIRECT_URL="tu-connection-string-de-supabase"
   ```

5. **Configura la base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Ejecuta la aplicación**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

La aplicación utiliza las siguientes tablas:

- **users**: Información del usuario y sueldo
- **expenses**: Registro de gastos con categorías
- **savings**: Historial de ahorros
- **wish_items**: Lista de deseos con progreso de ahorro

## 📱 Uso

1. **Dashboard**: Ve un resumen de tu situación financiera actual
2. **Sueldo**: Configura tu sueldo mensual
3. **Gastos**: Agrega gastos categorizados y ve el resumen mensual
4. **Ahorros**: Registra tus ahorros y ve el total acumulado
5. **Lista de Deseos**: Agrega artículos que quieres comprar y rastrea tu progreso

## 🔧 Scripts Disponibles

- `npm run dev` - Ejecuta la aplicación en modo desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter
- `npx prisma db push` - Sincroniza el esquema con la base de datos
- `npx prisma generate` - Genera el cliente de Prisma
- `npx prisma studio` - Abre Prisma Studio para administrar datos

## 🎨 Personalización

Puedes personalizar:

- **Categorías de gastos**: Modifica el array `categories` en `app/page.tsx`
- **Prioridades**: Modifica el array `priorities` en `app/page.tsx`
- **Estilos**: Edita las clases de Tailwind CSS
- **Esquema de base de datos**: Modifica `prisma/schema.prisma`

## 🚀 Despliegue

Para desplegar en Vercel:

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Despliega automáticamente

## 📝 Licencia

MIT License - siéntete libre de usar este proyecto como desees.
