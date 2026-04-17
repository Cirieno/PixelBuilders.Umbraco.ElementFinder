import type { ManifestDashboard } from "@umbraco-cms/backoffice/dashboard";

const workspaceViews: Array<ManifestDashboard> = [
  {
    type: "dashboard",
    name: "Element Finder",
    alias: "element-finder-dashboard",
    elementName: "element-finder-dashboard",
    weight: -1,
    meta: {
      label: "Element Finder",
      pathname: "element-finder-dashboard",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  }
];

export const manifests = [...workspaceViews];
