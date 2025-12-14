import { ChipFilterOption } from "../components/ChipsFilter";

export const USERS_FILTER_OPTIONS: ChipFilterOption[] = [
  {
    label: "Role: Admin",
    value: "Role:Admin",
  },
  {
    label: "Role: Maintainer",
    value: "Role:Maintainer",
  },
  {
    label: "Role: Developer",
    value: "Role:Developer",
  },
  {
    label: "Role: Guest",
    value: "Role:Guest",
  },
  {
    label: "Locked Accounts only",
    value: "Status:locked",
    unselected_default: true,
  },
  {
    label: "Active Accounts only",
    value: "Status:unlocked",
    unselected_default: true,
  },
];

export const NAMESPACE_FILTER_OPTIONS: ChipFilterOption[] = [
  {
    label: "Private",
    value: "Private"
  },
  {
    label: "Status: Active",
    value: "Status: Active"
  },
  {
    label: "Status: Deprecated",
    value: "Status: Deprecated"
  },
  {
    label: "Status: Disabled",
    value: "Status: Disabled"
  },
  {
    label: "Project Namespace",
    value: "Project Namespace"
  },
  {
    label: "Team Namespace",
    value: "Team Namespace"
  }
];

export const USER_ACCESS_FILTER_OPTIONS: ChipFilterOption[] = [
  {
    label: "Access Level: Maintainer",
    value: "Access Level: Maintainer"
  },
  {
    label: "Access Level: Developer",
    value: "Access Level: Developer"
  },
  {
    label: "Access Level: Guest",
    value: "Access Level: Guest"
  },
];

export const REPOSITORY_USER_ACCESS_FILTER_OPTIONS: ChipFilterOption[] = [
  {
    label: "Access Level: Developer",
    value: "Access Level: Developer"
  },
  {
    label: "Access Level: Guest",
    value: "Access Level: Guest"
  },
  {
    label: "Inherited Access Level",
    value: "Inherited Access Level"
  }
];


export const REPOSITORY_FILTER_OPTIONS: ChipFilterOption[] = [
  {
    label: "State: Active",
    value: "State: Active",
  },
  {
    label: "State: Deprecated",
    value: "State: Deprecated",
  },
  {
    label: "State: Disabled",
    value: "State: Disabled",
  },
  {
    label: "< 20 Tags",
    value: "< 20 Tags"
  },
  {
    label: "< 100 Tags",
    value: "< 100 Tags"
  },
  {
    label: "< 200 Tags",
    value: "< 200 Tags"
  },
  {
    label: "< 500 Tags",
    value: "< 500 Tags"
  },
  {
    label: "< 1000 Tags",
    value: "< 1000 Tags"
  },
];

// TODO: possible bug
// We define hard-coded OS ans Arch list. But if any arch/os exists in table without being
// here in the list, it cannot be filtered. Low priority issue
export const REPOSITORY_TAG_FILTER_OPTIONS: ChipFilterOption[] = [
  {
    label: 'Stable Tags only',
    value: 'stable',
    unselected_default: true,
  },
  {
    label: 'Arch: amd64',
    value: 'Arch: amd64',
  },
  {
    label: 'Arch: arm64',
    value: 'Arch: arm64',
  },
  {
    label: 'Arch: arm/v7',
    value: 'Arch: arm/v7',
  },
  {
    label: 'Arch: arm/v6',
    value: 'Arch: arm/v6',
  },
  {
    label: 'Arch: 386',
    value: 'Arch: 386',
  },
  {
    label: 'Arch: ppc64le',
    value: 'Arch: ppc64le',
  },
  {
    label: 'Arch: s390x',
    value: 'Arch: s390x',
  },
  {
    label: 'Arch: riscv64',
    value: 'Arch: riscv64',
  },
  {
    label: 'OS: linux',
    value: 'OS: linux',
  },
  {
    label: 'OS: windows',
    value: 'OS: windows',
  },
  {
    label: 'OS: darwin',
    value: 'OS: darwin',
  },
  {
    label: 'OS: freebsd',
    value: 'OS: freebsd',
  },
  {
    label: 'OS: netbsd',
    value: 'OS: netbsd',
  },
  {
    label: 'OS: openbsd',
    value: 'OS: openbsd',
  },
  {
    label: 'OS: android',
    value: 'OS: android',
  }
];
