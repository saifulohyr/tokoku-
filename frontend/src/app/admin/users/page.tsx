"use client";

import { useState } from "react";
import { useAdminUsers, useUpdateUserRole, useDeleteUser } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, UserCog, Trash2, Shield, User, Loader2 } from "lucide-react";

export default function AdminUsersPage() {
  const { data: users, isLoading, error } = useAdminUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; email: string } | null>(null);

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRole.mutate({ userId, role: newRole });
  };

  const handleDeleteClick = (user: { id: number; email: string }) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUser.mutate(userToDelete.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Gagal memuat data pengguna. Pastikan Anda login sebagai Admin.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">USER MANAGEMENT</h1>
        <Badge variant="outline" className="text-sm">
          {users?.length ?? 0} Pengguna
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold uppercase tracking-wider">Daftar Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className={user.role === "admin" ? "bg-blue-600" : ""}
                    >
                      {user.role === "admin" ? (
                        <><Shield className="w-3 h-3 mr-1" /> Admin</>
                      ) : (
                        <><User className="w-3 h-3 mr-1" /> User</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role === "user" ? (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "admin")}
                            disabled={updateRole.isPending}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Jadikan Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "user")}
                            disabled={updateRole.isPending}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Jadikan User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick({ id: user.id, email: user.email })}
                          className="text-red-600"
                          disabled={deleteUser.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus Pengguna
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus pengguna <strong>{userToDelete?.email}</strong>?
              <br />
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data pesanan pengguna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
