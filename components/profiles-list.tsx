"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, Plus, Mail, Loader2 } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchProfiles, deleteProfile, createProfile, updateProfile } from "@/lib/api"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"

interface Profile {
  id: string;
  email: string;
  username: string;
  user_id: string;
}

export function ProfilesList() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null)
  const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null)
  const [newProfile, setNewProfile] = useState({
    email: "",
    username: "",
    user_id: ""
  })
  const [editProfileData, setEditProfileData] = useState({
    email: "",
    username: "",
    user_id: ""
  })

  const loadProfiles = async () => {
    try {
      setLoading(true)
      const data = await fetchProfiles()
      setProfiles(data)
    } catch (error) {
      console.error("Error fetching profiles:", error)
      toast.error("Error al cargar perfiles")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (profile: Profile) => {
    setProfileToEdit(profile)
    setEditProfileData({
      email: profile.email,
      username: profile.username,
      user_id: profile.user_id
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileToEdit) return
    try {
      setIsUpdating(true)
      await updateProfile(profileToEdit.id, editProfileData)
      toast.success("Perfil actualizado correctamente")
      setIsEditDialogOpen(false)
      setProfileToEdit(null)
      setEditProfileData({
        email: "",
        username: "",
        user_id: ""
      })
      loadProfiles()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsCreating(true)
      await createProfile(newProfile)
      toast.success("Perfil creado correctamente")
      setIsDialogOpen(false)
      setNewProfile({
        email: "",
        username: "",
        user_id: ""
      })
      loadProfiles()
    } catch (error) {
      console.error("Error creating profile:", error)
      toast.error("Error al crear el perfil")
    } finally {
      setIsCreating(false)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const confirmDelete = async () => {
    if (!profileToDelete) return
    try {
      await deleteProfile(profileToDelete)
      toast.success("Perfil eliminado correctamente")
      setProfiles(profiles.filter(p => p.id !== profileToDelete))
    } catch (error) {
      console.error("Error deleting profile:", error)
      toast.error("Error al eliminar el perfil")
    } finally {
      setProfileToDelete(null)
    }
  }

  const filteredProfiles = profiles.filter(profile =>
    profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
    <AlertDialog open={!!profileToDelete} onOpenChange={(open) => !open && setProfileToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar perfil?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción es irreversible. El perfil será eliminado permanentemente del sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Perfiles</h2>
          <p className="text-muted-foreground">Gestiona los perfiles de los usuarios.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Añadir Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Perfil</DialogTitle>
              <DialogDescription>
                Introduce los detalles del nuevo perfil aquí. Haz clic en guardar cuando termines.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProfile} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Usuario</Label>
                <Input
                  id="username"
                  value={newProfile.username}
                  onChange={(e) => setNewProfile({ ...newProfile, username: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newProfile.email}
                  onChange={(e) => setNewProfile({ ...newProfile, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user_id" className="text-right">ID Usuario</Label>
                <Input
                  id="user_id"
                  value={newProfile.user_id}
                  onChange={(e) => setNewProfile({ ...newProfile, user_id: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
              <DialogDescription>
                Actualiza la información del perfil aquí. Haz clic en guardar cuando termines.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProfile} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-username" className="text-right">Usuario</Label>
                <Input
                  id="edit-username"
                  value={editProfileData.username}
                  onChange={(e) => setEditProfileData({ ...editProfileData, username: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editProfileData.email}
                  onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-user_id" className="text-right">ID Usuario</Label>
                <Input
                  id="edit-user_id"
                  value={editProfileData.user_id}
                  onChange={(e) => setEditProfileData({ ...editProfileData, user_id: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar cambios
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-premium">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario o email..."
                className="pl-9 bg-muted/30 border-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={loadProfiles} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refrescar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>ID Usuario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando perfiles...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No se encontraron perfiles.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id} className="group transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">@{profile.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{profile.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{profile.user_id}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenEdit(profile)}>Editar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setProfileToDelete(profile.id)}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
    </>
  )
}
