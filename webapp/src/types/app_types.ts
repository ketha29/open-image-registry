export enum RegistryTypes {
  Hosted,
  Proxy,
}

export enum ImageTagsTreeNodeTypes {
  Registry,
  Namespace,
  Repository,
  Tag,
}

export type ImageTagsTreeViewNodeData = {
  registry_key: string;
  registry_type: RegistryTypes;
  image_or_tag_path: string;
  node_type: ImageTagsTreeNodeTypes;
  namespace: string;
  image_repository: string;
  tag: string;
};

export type NamespaceAccess = {
  id: string;
  namespace: string;
  resource_id: string;
  user_id: string;
  access_level: string;
  granted_by: string;
  created_at: Date;
  updated_at: Date;
};

export type RepositoryAccesss = {
  id: string;
  namespace: string;
  repository: string;
  resource_id: string;
  user_id: string;
  access_level: string;
  granted_by: string;
  created_at: Date;
  updated_at: Date;
};

export type UserProfileInfo = {
  user_id: string;
  username: string;
  role: string;
  namespaces: NamespaceAccess[];
  repositories: RepositoryAccesss[];
};

export type UserAccountInfo = {
  id: string;
  username: string;
  role: string;
  email: string;
  display_name: string;
  locked: boolean;
  locked_reason: string;
  failed_attempts: number;
  locked_at?: Date;
  password_recovery_id: string;
  password_recovery_reason: string;
  password_recovery_at?: Date;
  last_loggedin_at?: Date;
  created_at: Date;
  updated_at?: Date;
};

export type TableSortState<T> = {
  key: keyof T;
  order: -1 | 0 | 1;
};

export type TablePaginationState = {
  page: number;
  limit: number;
};

export type TableColumnFilterState<T, K extends keyof T = keyof T> = {
  key: keyof T;
  values:  T[K][]; // equal filter only for simplicity
}

export type TableFilterSearchPaginationSortState<T> = {
  sort?: TableSortState<T>;
  pagination: TablePaginationState;
  filters?: TableColumnFilterState<T>[];
  search_value?: string;
};
