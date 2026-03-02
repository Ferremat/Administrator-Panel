"use client"

import { useState } from "react"
import { Search, Filter, MoreHorizontal, ShoppingBag, Calendar, CreditCard, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Mock data for demonstration
const mockOrders = [
  { id: "ORD-1234", customer: "Roberto Gómez", date: "2024-02-20", total: "$125.00", status: "Delivered", items: 3 },
  { id: "ORD-1235", customer: "Elena Rivas", date: "2024-02-21", total: "$45.50", status: "Processing", items: 1 },
  { id: "ORD-1236", customer: "Marco Polo", date: "2024-02-22", total: "$230.00", status: "Shipped", items: 5 },
  { id: "ORD-1237", customer: "Lucía Fernández", date: "2024-02-23", total: "$89.99", status: "Cancelled", items: 2 },
  { id: "ORD-1238", customer: "Santi Valls", date: "2024-02-24", total: "$540.00", status: "Processing", items: 8 },
]

export function OrdersList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = mockOrders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
          <p className="text-muted-foreground">Monitorea y gestiona los pedidos de los clientes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full md:w-auto">
            Exportar CSV
          </Button>
          <Button className="w-full md:w-auto">
            <ShoppingBag className="mr-2 h-4 w-4" /> Nuevo Pedido
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-premium">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID de pedido o cliente..."
                className="pl-9 bg-muted/30 border-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px]">ID Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group transition-colors hover:bg-muted/50">
                    <TableCell className="font-mono text-xs font-semibold">{order.id}</TableCell>
                    <TableCell className="font-medium">{order.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{order.date}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-semibold">{order.total}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.status === "Delivered" ? "default" : 
                          order.status === "Processing" ? "secondary" : 
                          order.status === "Shipped" ? "outline" : "destructive"
                        }
                        className="rounded-full font-normal"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Gestionar</DropdownMenuLabel>
                            <DropdownMenuItem>Actualizar Estado</DropdownMenuItem>
                            <DropdownMenuItem>Imprimir Factura</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Cancelar Pedido</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
