// Construct types: https://stackoverflow.com/a/57065680.

/** Base list of IDs to construct other types and interfaces. This list should be in the same order than the controls in HTML. */
// export const baseDropdownIds = ['d1', 'd2', 'd3', 'd4', 'd5'] as const;
// export type DropdownId = (typeof baseDropdownIds)[number];
export type DropdownId = 'd1' | 'd2' | 'd3' | 'd4' | 'd5';
export type Dropdowns = { [k in DropdownId]: Dropdown };
export type DropdownsOptional = { [k in DropdownId]?: Dropdown | null };
export type DropdownIdDependents = { [k in DropdownId]?: DropdownId[] | null };

export interface Dropdown {
  id: DropdownId;
  logic: DropdownLogicConfig;
  template: DropdownTemplateConfig;
}

export interface DropdownLogicConfig {
  triggerEvent?: string | null;
  dependents?: DropdownId[] | null;
}

export interface DropdownTemplateConfig {
  elements?: string[] | null;
  label?: string | null;
}

// Input config example: "config": { "dependents": {"d1": ["d2"]} }
export interface InputResources extends BaseResources<LocalConfig> {

}

export interface BaseResources<T> {
  config?: T;
}

export interface LocalConfig {
  dependants?: DropdownIdDependents;
}
