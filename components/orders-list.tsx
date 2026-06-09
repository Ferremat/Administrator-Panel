"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, ShoppingBag, Calendar, CreditCard, Eye, Loader2 } from "lucide-react"
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
import { fetchOrders, updateOrderStatus } from "@/lib/api"
import { toast } from "sonner"

interface Order {
  id: string
  userId?: string
  customerName?: string
  customer?: string
  date?: string
  createdAt?: string
  total?: number | string
  amount?: number
  status?: string
  items?: number
}

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await fetchOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Error al cargar pedidos")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    const id = order.id || ""
    const customer = order.customer || order.customerName || ""
    return id.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
          <p className="text-muted-foreground">Monitorea y gestiona los pedidos de los clientes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full md:w-auto" disabled={loading}>
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
            <Button variant="outline" onClick={loadOrders} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refrescar"}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando pedidos...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No se encontraron pedidos.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="group transition-colors hover:bg-muted/50">
                      <TableCell className="font-mono text-xs font-semibold">{order.id}</TableCell>
                      <TableCell className="font-medium">{order.customer || order.customerName || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {order.date ? new Date(order.date).toLocaleDateString() : order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-semibold">${typeof order.total === "number" ? order.total.toFixed(2) : order.amount?.toFixed(2) || "0.00"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "Delivered" || order.status === "COMPLETED" ? "default" :
                            order.status === "Processing" || order.status === "PENDING" ? "secondary" :
                            order.status === "Shipped" ? "outline" : "destructive"
                          }
                          className="rounded-full font-normal"
                        >
                          {order.status || "N/A"}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
