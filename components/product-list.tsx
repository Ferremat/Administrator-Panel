"use client"

import { Trash2, Package, Search, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import type { Product, Category } from "@/components/admin-dashboard"

interface ProductListProps {
  products: Product[]
  categories: Category[]
  onDelete: (id: string) => void
}

export function ProductList({ products, categories, onDelete }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Sin categoría"
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category?.name || getCategoryName(p.categoryId || "")).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="border-none shadow-premium animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Lista de Productos</CardTitle>
            <CardDescription>{products.length} productos en el inventario</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              className="pl-9 bg-muted/20 border-none h-9 focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No hay productos registrados aún.</p>
          </div>
        ) : (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px]">Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="group transition-colors hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                          {product.imageUrl ? (
                             <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                             <Package className="h-5 w-5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{product.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{product.id}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full font-normal">
                        {product.category?.name || getCategoryName(product.categoryId || "")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <span className={Number(product.stock) < 10 ? "text-destructive font-bold" : ""}>
                         {product.stock}
                       </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {(Number(product.price) || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(product.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
