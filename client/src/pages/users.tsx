import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, RotateCcw, Plus, Users as UsersIcon } from "lucide-react";
import TopBar from "@/components/layout/topbar";
import { DataTable } from "@/components/ui/data-table";
import AddUserModal from "@/components/modals/add-user-modal";
import EditUserModal from "@/components/modals/edit-user-modal";
import ConfirmModal from "@/components/modals/confirm-modal";
import { UserSearch } from "@/components/users/user-search";

import { apiRequest } from "@/lib/queryClient";
import type { User, TableColumn } from "@/types";

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/users/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setShowDeleteModal(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user) => {
    // Role Filter
    if (roleFilter !== "all" && user.defaultRole !== roleFilter) return false;

    // Status Filter
    if (statusFilter === "active" && user.disabled) return false;
    if (statusFilter === "disabled" && !user.disabled) return false;
    if (statusFilter === "verified" && !user.emailVerified) return false;
    if (statusFilter === "unverified" && user.emailVerified) return false;

    // Search Filter
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      const matchName = user.displayName.toLowerCase().includes(term);
      const matchEmail = user.email.toLowerCase().includes(term);
      const matchPhone = user.phoneNumber?.toLowerCase().includes(term);

      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort from Oldest to Newest (Ascending)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusColor = (user: User) => {
    if (user.disabled) return "bg-red-100 text-red-800";
    if (!user.emailVerified) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (user: User) => {
    if (user.disabled) return "Disabled";
    if (!user.emailVerified) return "Unverified";
    return "Active";
  };

  const columns: TableColumn<User>[] = [
    {
      key: "displayName",
      label: "Display Name",
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center">
          <Avatar className="w-10 h-10 mr-3 ring-2 ring-blue-100 dark:ring-blue-900">
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-semibold">
              {user.displayName.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{value}</span>
      ),
    },
    {
      key: "defaultRole",
      label: "Role",
      sortable: true,
      render: (value) => (
        <Badge className={`text-xs font-semibold shadow-sm ${getRoleColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "lastSeen",
      label: "Last Seen",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {value ? new Date(value).toLocaleString() : "Never"}
        </span>
      ),
    },
    {
      key: "disabled",
      label: "Status",
      render: (_, user) => (
        <Badge className={`inline-flex items-center text-xs font-semibold shadow-sm ${getStatusColor(user)}`}>
          <div className="w-2 h-2 bg-current rounded-full mr-1"></div>
          {getStatusText(user)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(user)}
            className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-600 hover:text-blue-700"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteUser(user)}
            className="h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-900 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filters = (
    <div className="flex gap-3">
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="w-36 bg-white/80 dark:bg-slate-700/80 backdrop-blur border-slate-200 dark:border-slate-600">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="anonymous">Anonymous</SelectItem>
          <SelectItem value="me">Me</SelectItem>
          <SelectItem value="author">Author</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-36 bg-white/80 dark:bg-slate-700/80 backdrop-blur border-slate-200 dark:border-slate-600">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="disabled">Disabled</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
          <SelectItem value="unverified">Unverified</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6 bg-gradient-to-br from-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* Professional Compact Container */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Compact Header */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <UsersIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  User Management
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {filteredUsers.length} of {users.length} users
                </p>
              </div>
            </div>

            <div className="flex-1 px-8">
              <UserSearch
                users={users}
                onSearch={setSearchQuery}
                onSelect={(user) => {
                  setSearchQuery(user.displayName);
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await refetch();
                  toast({ title: "Refreshed", description: "User list updated" });
                }}
                disabled={isLoading}
                className="h-7 text-xs px-2"
              >
                <RotateCcw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="h-7 bg-blue-600 hover:bg-blue-700 text-xs px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="p-0">
          <DataTable
            data={filteredUsers}
            columns={columns}
            loading={isLoading}
            searchPlaceholder="Search users..."
            filters={filters}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            getRowId={(user) => user.id}
            hideSearch={true}
          />
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditUserModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser as any}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onOpenChange={(open) => setShowDeleteModal(open)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete "${selectedUser?.displayName}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
