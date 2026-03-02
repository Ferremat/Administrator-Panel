"use client"

import { Trash2, FolderTree, Search, MoreVertical } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import type { Product, Category } from "@/components/admin-dashboard"

interface CategoryListProps {
  categories: Category[]
  products: Product[]
  onDelete: (id: string) => void
}

export function CategoryList({ categories, products, onDelete }: CategoryListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const getProductCount = (categoryId: string) => {
    return products.filter((p) => p.categoryId === categoryId).length
  }

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="border-none shadow-premium animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Lista de Categorías</CardTitle>
            <CardDescription>{categories.length} categorías activas en el sistema</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar categoría..."
              className="pl-9 bg-muted/20 border-none h-9 focus-visible:ring-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderTree className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No hay categorías registradas aún.</p>
          </div>
        ) : (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Nombre de Categoría</TableHead>
                  <TableHead className="text-center">Cant. Productos</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id} className="group transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="rounded-full bg-muted/50">
                        {getProductCount(category.id)} productos
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none rounded-full px-3">
                         Activa
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(category.id)}
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
