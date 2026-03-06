"use client"

import { useState, useEffect } from "react"
import { Package, FolderTree, Plus, Users, ShoppingCart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ProductList } from "@/components/product-list"
import { CategoryList } from "@/components/category-list"
import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { UsersList } from "@/components/users-list"
import { OrdersList } from "@/components/orders-list"
import { fetchProducts, fetchCategories, createProduct, createCategory, deleteProduct, deleteCategory } from "@/lib/api"
import { toast } from "sonner"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

const salesData = [
  { name: 'Lun', sales: 4000 },
  { name: 'Mar', sales: 3000 },
  { name: 'Mié', sales: 2000 },
  { name: 'Jue', sales: 2780 },
  { name: 'Vie', sales: 1890 },
  { name: 'Sáb', sales: 2390 },
  { name: 'Dom', sales: 3490 },
]

export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: string
  stock: number
  imageUrl?: string | null
  updatedAt?: string
  category?: Category
  categoryId?: string
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    stock: "", 
    imageUrl: "", 
    categoryId: "" 
  })
  const [newCategory, setNewCategory] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setIsMounted(true)
    loadData()
  }, [])

  if (!isMounted) return null

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Bienvenido de nuevo. Aquí tienes un resumen de tu tienda.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-premium hover:shadow-premium-hover transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Productos</CardTitle>
                  <Package className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">productos registrados</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-premium hover:shadow-premium-hover transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Categorías</CardTitle>
                  <FolderTree className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{categories.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">categorías activas</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-premium hover:shadow-premium-hover transition-all duration-300 border-l-4 border-l-primary/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios Activos</CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,284</div>
                  <p className="text-xs text-emerald-500 mt-1">+12% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-premium hover:shadow-premium-hover transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Pendientes</CardTitle>
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">24</div>
                  <p className="text-xs text-amber-500 mt-1">Requieren atención pronto</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
               <Card className="md:col-span-4 border-none shadow-premium">
                  <CardHeader>
                    <CardTitle>Ventas Semanales</CardTitle>
                    <CardDescription>Resumen de ingresos de los últimos 7 días.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={salesData}>
                           <defs>
                             <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                           <XAxis 
                             dataKey="name" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                             dy={10}
                           />
                           <YAxis 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                             tickFormatter={(value: number) => `$${value}`}
                           />
                           <RechartsTooltip 
                             contentStyle={{ 
                               backgroundColor: 'var(--card)', 
                               borderColor: 'var(--border)',
                               borderRadius: '8px',
                               boxShadow: 'var(--shadow-premium)'
                             }} 
                           />
                           <Area 
                             type="monotone" 
                             dataKey="sales" 
                             stroke="var(--primary)" 
                             strokeWidth={3}
                             fillOpacity={1} 
                             fill="url(#colorSales)" 
                           />
                         </AreaChart>
                       </ResponsiveContainer>
                     </div>
                  </CardContent>
               </Card>
               <Card className="md:col-span-3 border-none shadow-premium">
                  <CardHeader>
                    <CardTitle>Últimos Productos</CardTitle>
                    <CardDescription>Los últimos 5 productos añadidos.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {products.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center font-bold text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.price}€</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{p.stock} ud.</Badge>
                      </div>
                    ))}
                  </CardContent>
               </Card>
            </div>
          </div>
        )
      case "products":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Gestión de Productos</h2>
              <p className="text-muted-foreground">Crea, edita y elimina productos de tu inventario.</p>
            </div>
            <Card className="border-none shadow-premium">
              <CardHeader>
                <CardTitle>Añadir Nuevo Producto</CardTitle>
                <CardDescription>Completa los campos para registrar un producto en el sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Nombre</Label>
                    <Input id="product-name" placeholder="Ej: Taladro Percutor 500W" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-description">Descripción</Label>
                    <Input id="product-description" placeholder="Breve detalle del producto" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Precio (€)</Label>
                    <Input id="product-price" type="number" step="0.01" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-stock">Stock</Label>
                    <Input id="product-stock" type="number" placeholder="0" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-image">URL de Imagen</Label>
                    <Input id="product-image" placeholder="https://..." value={newProduct.imageUrl} onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category">Categoría</Label>
                    <Select value={newProduct.categoryId} onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}>
                      <SelectTrigger id="product-category">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="lg:col-span-3 flex justify-end">
                    <Button type="submit" disabled={loading} className="px-8 shadow-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      {loading ? 'Guardando...' : 'Registrar Producto'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <ProductList products={products} categories={categories} onDelete={handleDeleteProduct} />
          </div>
        )
      case "categories":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
              <p className="text-muted-foreground">Organiza tus productos por familias y tipos.</p>
            </div>
            <Card className="border-none shadow-premium max-w-2xl">
              <CardHeader>
                <CardTitle>Nueva Categoría</CardTitle>
                <CardDescription>Define una nueva agrupación para tus productos.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCategory} className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="category-name">Nombre</Label>
                    <Input id="category-name" placeholder="Ej: Herramientas Manuales" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={loading} className="mt-8">
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? 'Creando...' : 'Añadir'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <CategoryList categories={categories} products={products} onDelete={handleDeleteCategory} />
          </div>
        )
      case "users":
        return <UsersList />
      case "orders":
        return <OrdersList />
      default:
        return null
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId) return

    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        imageUrl: newProduct.imageUrl ? newProduct.imageUrl : undefined,
        category: newProduct.categoryId
      }
      await createProduct(productData)
      await loadData()
      setNewProduct({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" })
      toast.success("Producto creado correctamente", {
        description: `"${productData.name}" ha sido añadido al inventario.`
      })
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error("Error al crear el producto")
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return

    try {
      const categoryName = newCategory.trim()
      await createCategory({ name: categoryName })
      await loadData()
      setNewCategory("")
      toast.success("Categoría creada correctamente", {
        description: `"${categoryName}" ha sido añadida al sistema.`
      })
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error("Error al crear la categoría")
    }
  }

  const handleDeleteProduct = async (id: string) => {
     try {
       await deleteProduct(id)
       await loadData()
       toast.success("Producto eliminado")
     } catch (error) {
       console.error("Error deleting product:", error)
       toast.error("Error al borrar el producto")
     }
  }

  const handleDeleteCategory = async (id: string) => {
     try {
       await deleteCategory(id)
       await loadData()
       toast.success("Categoría eliminada")
     } catch (error) {
       console.error("Error deleting category:", error)
       toast.error("Error al borrar la categoría")
     }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
