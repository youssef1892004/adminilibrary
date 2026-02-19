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
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
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
    <div className="flex flex-wrap gap-3 w-full md:w-auto">
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="w-full md:w-36 bg-white/80 dark:bg-slate-700/80 backdrop-blur border-slate-200 dark:border-slate-600">
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
        <SelectTrigger className="w-full md:w-36 bg-white/80 dark:bg-slate-700/80 backdrop-blur border-slate-200 dark:border-slate-600">
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
      {/* Professional Compact Container */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Enhanced Header - Matches Books/Dashboard */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar-primary/90 p-6 text-white shadow-lg border border-sidebar-border">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-inner">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">إدارة المستخدمين</h1>
                <p className="text-sidebar-foreground/80 text-sm">
                  {filteredUsers.length} مستخدم مسجل
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-white/10 backdrop-blur-sm p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/70 hover:text-white'}`}
                title="List View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/70 hover:text-white'}`}
                title="Grid View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col">
          {/* Actions Bar */}
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">

            <div className="flex-1 md:px-8">
              <UserSearch
                users={users}
                onSearch={setSearchQuery}
                onSelect={(user) => {
                  setSearchQuery(user.displayName);
                }}
              />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await refetch();
                  toast({ title: "Refreshed", description: "User list updated" });
                }}
                disabled={isLoading}
                className="h-9 text-xs px-3"
              >
                <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="h-9 bg-blue-600 hover:bg-blue-700 text-xs px-3"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add User
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="px-5 py-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            {filters}
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 ring-2 ring-blue-50 dark:ring-blue-900/20">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                      {user.displayName.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{user.displayName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
                <Badge className={`shadow-none ${getStatusColor(user)}`}>
                  {getStatusText(user)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Role</span>
                  <Badge variant="outline" className={`font-normal ${getRoleColor(user.defaultRole)}`}>
                    {user.defaultRole}
                  </Badge>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">Created</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                  onClick={() => handleEditUser(user)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  onClick={() => handleDeleteUser(user)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - Grid vs Table */}
        <div className="hidden md:block p-0 pb-20">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="group relative bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-900">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50" onClick={() => handleEditUser(user)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 bg-red-50" onClick={() => handleDeleteUser(user)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-16 h-16 ring-4 ring-slate-50 dark:ring-slate-800 mb-3">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl">
                        {user.displayName.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{user.displayName}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className={`${getRoleColor(user.defaultRole)}`}>{user.defaultRole}</Badge>
                      <Badge variant="outline" className={`${getStatusColor(user)}`}>{getStatusText(user)}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between text-xs text-slate-400">
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    <span>{user.lastSeen ? 'Seen recently' : 'Never seen'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable
              data={filteredUsers}
              columns={columns}
              loading={isLoading}
              searchPlaceholder="Search users..."
              filters={null}
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
              getRowId={(user) => user.id}
              hideSearch={true}
            />
          )}
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
