# Redirects – Admin UI Implementation Guide

> **Audience:** Frontend developer implementing the Redirects feature in `leadcms.admin`.
> This document translates the backend spec into concrete implementation steps matched
> to the project's existing patterns, folder structure, routing, and component library.

---

## 0. Current API Snapshot

The Redirects endpoints are already present in the generated client in
`src/lib/network/swagger-client.ts`.

If the backend contract changes again, regenerate the API client with:

```bash
npm run generate-api -- http://localhost:45437
```

This updates both `src/lib/network/swagger-client.ts` and
`src/lib/network/swagger.json`.

Important: the generated Redirect DTOs currently expose string enum values,
not numeric values. The frontend should therefore use the generated union
strings in form state and API payloads:

- `sourceType`: `"InternalPath" | "ContentSlug" | "ContentId"`
- `targetType`: `"ExternalUrl" | "InternalPath" | "ContentSlug" | "ContentId"`
- `kind`: `"Temporary" | "Permanent"`

The backend product spec still describes these as numeric values for display
and semantics. In this project, treat the generated TypeScript client as the
source of truth for request payload typing.

---

## 1. Routing

### 1.1 Add the module name to `CoreModule`

File: `src/lib/router/index.ts`

Add to the `CoreModule` const enum:

```ts
redirects = "redirects",
```

### 1.2 Register the lazy module in `ModuleLoader`

File: `src/features/module-loader/index.tsx`

Add a lazy import at the top (alongside the other lazy imports):

```ts
const RedirectsModule = lazy(() =>
  import("@features/redirects").then((m) => ({ default: m.RedirectsModule }))
);
```

Add the render condition inside `ModuleLoader`:

```tsx
{
  moduleName === CoreModule.redirects && <RedirectsModule />;
}
```

### 1.3 Keep create/edit inside the list route

Unlike the first draft of this spec, Redirect create/edit should **not** use
dedicated `/add` or `/:id/edit` routes.

The module route remains a single list page:

- `/redirects` shows the table
- create opens a dialog from the list page
- edit opens the same dialog from the list page

This should follow the same UX concept as content creation in
`src/features/content/content-list.tsx`, which renders `AddContentDialog`
directly from list state instead of routing to a separate screen.

### 1.4 Register the menu category in `authenticated-layout.tsx`

File: `src/authenticated-layout.tsx`

Add to `menuCategories`:

```ts
redirects: { category: "CMS", name: "Redirects" },
```

### 1.5 Add the sidebar entry to `MENU_CONFIG`

File: `src/utils/menu-config.tsx`

Add a `Shuffle` icon import from `lucide-react` and insert an item in the
**CMS** section (after `links`):

```tsx
import { ..., Shuffle } from "lucide-react";

// Inside the CMS section items array:
{
  id: "redirects",
  label: "Redirects",
  icon: <Shuffle size={20} />,
  entity: "redirect",
  route: getCoreModuleRoute(CoreModule.redirects),
},
```

The `entity` value must match whatever entity string the server returns in the
`availableEntities` list (case-insensitive comparison). Confirm the exact
string with the backend team; if none is gated, set `entity: null`.

---

## 2. Feature Folder Structure

```
src/features/redirects/
  index.tsx          ← RedirectsModule (list-only route)
  constants.ts       ← constants (breadcrumbs, storage keys, labels, enum maps)
  list/
    index.tsx        ← RedirectsList host page
  dialog/
    index.tsx        ← RedirectDialog used for both create and edit
    content-id-autocomplete.tsx ← shared content selector for `fromContentId` / `toContentId`
```

The list/dialog split should follow the same state-driven pattern as
`src/features/content/content-list.tsx` +
`src/components/add-content-dialog/index.tsx`.

---

## 3. Constants (`src/features/redirects/constants.ts`)

```ts
import { CoreModule, getCoreModuleRoute } from "lib/router";
import { dataListBreadcrumbLinks } from "utils/constants";
import { BreadcrumbLink } from "types";

export const modelName = "redirect";
export const searchLabel = "Search redirects";
export const defaultFilterOrderColumn = "createdAt";
export const defaultFilterOrderDirection = "desc";
export const redirectGridSettingsStorageKey = "redirectDataListSettings";
export const redirectListPageBreadcrumb = "Redirects";

// Enum display labels
export const SOURCE_TYPE_LABELS: Record<string, string> = {
  InternalPath: "Internal Path",
  ContentSlug: "Content Slug",
  ContentId: "Content ID",
};

export const TARGET_TYPE_LABELS: Record<string, string> = {
  ExternalUrl: "External URL",
  InternalPath: "Internal Path",
  ContentSlug: "Content Slug",
  ContentId: "Content ID",
};

export const KIND_LABELS: Record<string, string> = {
  Temporary: "Temporary (302)",
  Permanent: "Permanent (301)",
};
```

---

## 4. Module Entry Point (`src/features/redirects/index.tsx`)

```tsx
import { Outlet, Route, Routes } from "react-router-dom";
import { RedirectsList } from "./list";

export const RedirectsModule = () => {
  return (
    <>
      <Routes>
        <Route index element={<RedirectsList />} />
      </Routes>
      <Outlet />
    </>
  );
};
```

---

## 5. List Page (`src/features/redirects/list/index.tsx`)

### 5.1 Data fetching

Use `useRequestContext` and call the generated method:

```ts
const { client } = useRequestContext();

const getRedirectsList = async (mainQuery: string, exportQuery?: string) => {
  dataExportQuery.current = exportQuery || "";
  return client.api.redirectsList({ query: mainQuery });
};
```

`DataList` passes a composed query string built from
`filter[limit]`, `filter[order]`, `filter[skip]`, and any active where-filters.
The component reads `x-total-count` from the response headers automatically —
no manual header parsing is needed.

### 5.2 Columns

Do not use `GenericForm`-generated columns. Define `GridColDef[]` manually
because several columns require derived display logic:

| Column header   | `field` key        | Notes                                                                          |
| --------------- | ------------------ | ------------------------------------------------------------------------------ |
| Source Type     | `sourceType`       | `valueFormatter: ({ value }) => SOURCE_TYPE_LABELS[String(value)] ?? value`    |
| Source          | `_source`          | Custom `renderCell` — derive from `sourceType` (see §5.3)                      |
| Target Type     | `targetType`       | `valueFormatter: ({ value }) => TARGET_TYPE_LABELS[String(value)] ?? value`    |
| Target          | `_target`          | Custom `renderCell` — derive from `targetType` (see §5.3)                      |
| Kind            | `kind`             | `valueFormatter: ({ value }) => KIND_LABELS[String(value)] ?? value`           |
| Auto-discovered | `isAutoDiscovered` | `renderCell: ({ value }) => value ? <Chip label="Auto" size="small" /> : null` |
| Created         | `createdAt`        | Use `DateValueGetter` / `DateValueFormatter` from `@components/data-list`      |
| Actions         | —                  | See §5.4                                                                       |

### 5.3 Derived Source / Target display

```ts
function formatSource(row: RedirectDetailsDto): string {
  switch (row.sourceType) {
    case "InternalPath":
      return row.fromPath ?? "";
    case "ContentSlug":
      return `${row.fromLanguage ?? ""}/${row.fromSlug ?? ""}`;
    case "ContentId":
      return row.fromContentId != null ? `Content #${row.fromContentId}` : "";
    default:
      return "";
  }
}

function formatTarget(row: RedirectDetailsDto): string {
  switch (row.targetType) {
    case "ExternalUrl":
      return row.toUrl ?? "";
    case "InternalPath":
      return row.toPath ?? "";
    case "ContentSlug":
      return `${row.toLanguage ?? ""}/${row.toSlug ?? ""}`;
    case "ContentId":
      return row.toContentId != null ? `Content #${row.toContentId}` : "";
    default:
      return "";
  }
}
```

Pass these as `valueGetter` on the respective column definitions.

### 5.4 Row actions (Edit / Delete)

Add an **Actions** column with icon buttons:

- **Edit** (`Pencil` from `lucide-react`) — open `RedirectDialog` in `"edit"`
  mode for the selected row.
- **Delete** (`Trash2` from `lucide-react`) — show a MUI `Dialog` for
  confirmation, then call `client.api.redirectsDelete(row.id)`. On success,
  refresh the list and show `notificationsService.success("Redirect deleted.")`.
  On `404`, show `"This redirect no longer exists."`.

> Auto-discovered redirects (`isAutoDiscovered: true`) are suppressed by the
> server on DELETE — no visual distinction is required. The row simply
> disappears after the call completes.

### 5.5 Toolbar

Add two extra action buttons via `extraActionsContainerChildren` on
`ModuleWrapper`:

1. **"Auto-Discover" button** — see §6.
2. **"Add Redirect" button** — open `RedirectDialog` in `"create"` mode.

Use `ToolbarButton` from `@components/tool-bar-button` for both.

The list component should own the dialog state, following the same pattern as
`ContentList` owns `AddContentDialog`:

```ts
const [redirectDialogOpen, setRedirectDialogOpen] = useState(false);
const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
const [editingRedirectId, setEditingRedirectId] = useState<number | null>(null);
```

Suggested handlers:

```ts
const handleAddRedirect = () => {
  setDialogMode("create");
  setEditingRedirectId(null);
  setRedirectDialogOpen(true);
};

const handleEditRedirect = (id: number) => {
  setDialogMode("edit");
  setEditingRedirectId(id);
  setRedirectDialogOpen(true);
};

const handleDialogSaved = async () => {
  setRedirectDialogOpen(false);
  setEditingRedirectId(null);
  await reloadCurrentList();
};
```

### 5.6 Scaffold

Follow the `UnsubscribesList` pattern exactly:

```tsx
<ModuleWrapper
  breadcrumbs={dataListBreadcrumbLinks}
  currentBreadcrumb={redirectListPageBreadcrumb}
  leftContainerChildren={<SearchBar ... />}
  extraActionsContainerChildren={[...toolbarButtons]}
>
  <DataList
    columns={columns}
    setColumns={setColumns}
    gridSettingsStorageKey={redirectGridSettingsStorageKey}
    defaultFilterOrderColumn={defaultFilterOrderColumn}
    defaultFilterOrderDirection={defaultFilterOrderDirection}
    searchText={searchTerm}
    getModelDataList={getRedirectsList}
    initialGridState={{ ... }}
    filterPanelOpen={filterPanelOpen}
    setFilterPanelOpen={setFilterPanelOpen}
    columnsPanelOpen={columnsPanelOpen}
    setColumnsPanelOpen={setColumnsPanelOpen}
  />
</ModuleWrapper>
```

Render the dialog at the bottom of the list component, just like
`ContentList` renders `AddContentDialog`:

```tsx
<RedirectDialog
  open={redirectDialogOpen}
  mode={dialogMode}
  redirectId={editingRedirectId}
  onClose={() => {
    setRedirectDialogOpen(false);
    setEditingRedirectId(null);
  }}
  onSaved={handleDialogSaved}
/>
```

### 5.7 Export and bulk delete

Because the generated client already includes both `redirectsExportList` and
`redirectsBulkDelete`, the Redirects list should follow the same project
pattern as `UnsubscribesList` and enable both features.

```ts
const redirectsExportApi: (query: string, accept: string) => Promise<Response> = (query, accept) =>
  client.api.redirectsExportList({ query }, { headers: { Accept: accept } });
```

Pass these into `DataList`:

```tsx
onExportOpen={openExport}
onExportClose={handleExportOpen}
exportApiCall={redirectsExportApi}
onBulkDelete={async (ids) => {
  await client.api.redirectsBulkDelete(ids.map(Number));
}}
bulkDeleteEntityName="redirect"
```

---

## 6. Auto-Discover Action

**Endpoint:** `POST /api/redirects/discover`

The generated method is `client.api.redirectsDiscoverCreate(...)`. It accepts
the same `query` wrapper shape as the list endpoint and returns
`RedirectDetailsDto[]` with `x-total-count` in the response headers.

**Implementation inside `RedirectsList`:**

```ts
const handleAutoDiscover = async () => {
  setIsDiscovering(true);
  try {
    const result = await client.api.redirectsDiscoverCreate({ query: currentListQuery });
    const total = result.headers.get("x-total-count") ?? "0";
    // Replace table data with result.data
    // Update pagination total
    notificationsService.success(`Discovery complete. ${total} redirect(s) found.`);
  } catch (e) {
    showApiError(e, notificationsService, undefined, "Auto-discovery failed.");
  } finally {
    setIsDiscovering(false);
  }
};
```

Pass `currentListQuery` (the last query string used to fetch the list) so the
returned results respect the user's active filters and sort.

> `showApiError` is exported from `@utils/api-error-parser`.

---

## 7. Create / Edit Dialog (`src/features/redirects/dialog/index.tsx`)

> **Do NOT use `GenericForm`** for this feature. The form has complex
> conditional field sections that depend on runtime-selected enum values
> (`sourceType`, `targetType`), which the generic form's field-section
> schema cannot express. Build a fully custom MUI dialog instead.

The UX should follow the dialog hosting pattern used by:

- `src/components/add-content-dialog/index.tsx` for open/close/save behavior
- `src/components/ai-draft-dialog/index.tsx` for the ContentId autocomplete UX

Add user-facing guidance at the top of the dialog so admins understand what
the feature does and what it does **not** do.

Recommended top-of-dialog note:

- Show an `Alert severity="info"` near the top of the dialog explaining that
  Redirects in Admin UI are a registry of redirect knowledge for the site.
  This includes both manually created redirects and auto-discovered redirects
  derived from historical content slug changes.
- Make it explicit that having a redirect record in LeadCMS does **not**
  automatically make the live site perform that redirect.
- Clarify that the site developer is still responsible for implementing the
  actual redirect mechanism at the site or infrastructure level, for example
  through nginx redirect maps or an equivalent application-level solution.

Suggested copy:

```tsx
<Alert severity="info" sx={{ mb: 3 }}>
  Redirects in LeadCMS are a registry of redirect rules the site should know about, including both
  manual redirects and redirects auto-discovered from historical content slug changes. They do not
  execute redirects by themselves. The live site must still implement these rules using its own
  redirect engine, such as nginx redirect maps or a similar application-level mechanism.
</Alert>
```

### 7.1 Component contract

```ts
interface RedirectDialogProps {
  open: boolean;
  mode: "create" | "edit";
  redirectId?: number | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}
```

Use a MUI `Dialog` with `DialogTitle`, `DialogContent`, and `DialogActions`,
mirroring `AddContentDialog`.

### 7.2 Data loading (edit mode)

```ts
useEffect(() => {
  if (open && mode === "edit" && redirectId != null) {
    client.api.redirectsDetail(redirectId).then((res) => setFormData(res.data));
  }
}, [client.api, mode, open, redirectId]);
```

Generated method: `client.api.redirectsDetail(id)`.

When `open` changes to `false`, reset local form state so reopening the dialog
starts cleanly in create mode and does not leak edit state from the previous
session.

### 7.3 Form state

```ts
interface FormState {
  kind: "Temporary" | "Permanent";
  sourceType: "InternalPath" | "ContentSlug" | "ContentId";
  fromPath: string | null;
  fromLanguage: string | null;
  fromSlug: string | null;
  fromContentId: number | null;
  targetType: "ExternalUrl" | "InternalPath" | "ContentSlug" | "ContentId";
  toUrl: string | null;
  toPath: string | null;
  toLanguage: string | null;
  toSlug: string | null;
  toContentId: number | null;
}
```

When `sourceType` changes, null-out all source fields that do not belong to the
new type. Do the same for `targetType`.

The generated `RedirectUpdateDto` currently does **not** contain a
`nullProperties` field, so the implementation should follow the actual Swagger
contract and send changed fields directly, with `null` values for cleared
nullable fields when needed.

### 7.4 Kind field

```tsx
<FormControl>
  <FormLabel>Kind</FormLabel>
  <RadioGroup
    row
    value={formState.kind}
    onChange={(e) => setField("kind", e.target.value as FormState["kind"])}
  >
    <FormControlLabel value="Permanent" control={<Radio />} label="Permanent (301)" />
    <FormControlLabel value="Temporary" control={<Radio />} label="Temporary (302)" />
  </RadioGroup>
</FormControl>
```

### 7.5 Source section

```tsx
<Select
  value={formState.sourceType}
  onChange={(e) => handleSourceTypeChange(e.target.value as FormState["sourceType"])}
>
  <MenuItem value="InternalPath">Internal Path</MenuItem>
  <MenuItem value="ContentSlug">Content Slug</MenuItem>
  <MenuItem value="ContentId">Content ID</MenuItem>
</Select>;

{
  formState.sourceType === "InternalPath" && (
    <TextField
      label="From Path"
      value={formState.fromPath ?? ""}
      onChange={(e) => setField("fromPath", e.target.value)}
      error={!!errors.fromPath}
      helperText={
        errors.fromPath ??
        'Enter the full site path from the domain root, for example "/long/multi-folder/source-path/".'
      }
    />
  );
}

{
  formState.sourceType === "ContentSlug" && (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        This source type stores a language and slug combination, not a final URL path. The site must
        still know how to translate values such as `"en"` and `"my-slug"` into the real source path
        when building its redirect map.
      </Alert>
      <TextField
        label="Language"
        value={formState.fromLanguage ?? ""}
        onChange={(e) => setField("fromLanguage", e.target.value)}
        helperText='Language code used by the site, for example "en".'
      />
      <TextField
        label="Slug"
        value={formState.fromSlug ?? ""}
        onChange={(e) => setField("fromSlug", e.target.value)}
        helperText='Slug only, without a leading slash, for example "my-slug".'
      />
    </>
  );
}

{
  formState.sourceType === "ContentId" && (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        This source type references an existing content record by ID. The live site must still
        resolve that content item to its current language and slug, then calculate the actual source
        path before using it in a redirect map.
      </Alert>
      <ContentIdAutocomplete
        label="From Content"
        value={formState.fromContentId}
        onChange={(id) => setField("fromContentId", id)}
      />
    </>
  );
}
```

### 7.6 Target section

Mirror the pattern above for `targetType` with fields:

- `targetType = "ExternalUrl"` → `toUrl` (full URL)
- `targetType = "InternalPath"` → `toPath` (must start with `/`)
- `targetType = "ContentSlug"` → `toLanguage` + `toSlug`
- `targetType = "ContentId"` → `toContentId` via `ContentIdAutocomplete`

Add helper notes for target-specific behavior as well:

- For `ExternalUrl`, explain that this field is only relevant for target type
  `"ExternalUrl"` and should contain a full absolute URL beginning with
  `"http://"` or `"https://"`.
- For `ContentSlug`, explain that the site must still resolve the selected
  language and slug combination into the actual destination path.
- For `ContentId`, explain that the site must resolve the referenced content
  record into language + slug + final path before building the destination
  redirect rule.

Suggested `ExternalUrl` helper text:

```tsx
<TextField
  label="URL"
  value={formState.toUrl ?? ""}
  onChange={(e) => setField("toUrl", e.target.value)}
  helperText='Full external URL starting with "http://" or "https://".'
/>
```

### 7.7 Content ID autocomplete

Create a small internal component `ContentIdAutocomplete` in
`src/features/redirects/dialog/content-id-autocomplete.tsx`.

```tsx
interface ContentIdAutocompleteProps {
  label: string;
  value: number | null;
  onChange: (id: number | null) => void;
}
```

This should borrow the interaction model from the `Reference Content` field in
`src/components/ai-draft-dialog/index.tsx`:

- local `inputValue`, `options`, `loading`, and dropdown `open` state
- debounced search input (`useDebounce(..., 300)`)
- `Autocomplete<ContentDetailsDto>` rather than a plain numeric text field
- selected option displays title and slug, but stores the numeric `id`
- when an existing value is provided in edit mode, load the item with
  `client.api.contentDetail(id)` so the Autocomplete can display the selected
  record correctly

**Implementation sketch:**

```ts
const search = async (query: string) => {
  const trimmed = query.trim();
  if (!trimmed) return;

  const res = await client.api.contentList({
    query: `search=${encodeURIComponent(
      trimmed
    )}&filter[skip]=0&filter[limit]=10&filter[order]=updatedAt desc`,
  });
  setOptions(res.data);
};
```

Recommended rendering, copied conceptually from `AIDraftDialog`:

```tsx
<Autocomplete
  options={options}
  value={selectedContent}
  inputValue={inputValue}
  open={isOpen}
  onOpen={() => setIsOpen(true)}
  onClose={() => setIsOpen(false)}
  onInputChange={(_, value) => setInputValue(value)}
  onChange={(_, value) => onChange(value?.id ?? null)}
  getOptionLabel={(option) => {
    const title = option.title || "Untitled";
    const slugPart = option.slug ? ` • ${option.slug}` : "";
    return `${title}${slugPart}`;
  }}
  isOptionEqualToValue={(option, value) => option.id === value.id}
  loading={isLoading}
  filterOptions={(x) => x}
  renderOption={(props, option) => (
    <Box component="li" {...props} key={option.id ?? option.slug ?? option.title}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {option.title || "Untitled"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {option.slug || `ID: ${option.id ?? "-"}`}
        </Typography>
      </Box>
    </Box>
  )}
  renderInput={(params) => (
    <TextField
      {...params}
      label={label}
      placeholder="Search content by title or slug"
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {isLoading ? <CircularProgress size={18} /> : null}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
    />
  )}
/>
```

Generated method: `client.api.contentList({ query: "..." })`. The response
items have `id` (number) and `title` (string) fields.

### 7.8 Save: Create

```ts
const payload: RedirectCreateDto = {
  kind: formState.kind,
  sourceType: formState.sourceType,
  ...(formState.sourceType === "InternalPath" && { fromPath: formState.fromPath }),
  ...(formState.sourceType === "ContentSlug" && {
    fromLanguage: formState.fromLanguage,
    fromSlug: formState.fromSlug,
  }),
  ...(formState.sourceType === "ContentId" && { fromContentId: formState.fromContentId }),
  targetType: formState.targetType,
  ...(formState.targetType === "ExternalUrl" && { toUrl: formState.toUrl }),
  ...(formState.targetType === "InternalPath" && { toPath: formState.toPath }),
  ...(formState.targetType === "ContentSlug" && {
    toLanguage: formState.toLanguage,
    toSlug: formState.toSlug,
  }),
  ...(formState.targetType === "ContentId" && { toContentId: formState.toContentId }),
};

await client.api.redirectsCreate(payload);
```

Generated method: `client.api.redirectsCreate(payload)`.

### 7.9 Save: Update (PATCH)

Build a diff between the original loaded data and current form state. Send only
changed fields. For fields that were explicitly cleared due to a type switch,
send them as `null` if they are nullable in `RedirectUpdateDto`.

```ts
const changed: Partial<RedirectUpdateDto> = {};

// Example for fromPath:
if (formState.fromPath !== original.fromPath) {
  changed.fromPath = formState.fromPath;
}
// ... repeat for all fields

const payload: RedirectUpdateDto = changed;
await client.api.redirectsPartialUpdate(itemId, payload);
```

Generated method: `client.api.redirectsPartialUpdate(id, payload)`.

### 7.10 Error handling

| HTTP status                | Behaviour                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `409 Conflict`             | Show `error.title` from response body as a form-level error or toast via `notificationsService.error(...)` |
| `422 Unprocessable Entity` | Show `error.title` from response body as a form-level error                                                |
| `404 Not Found`            | Show `"This redirect no longer exists."`, close the dialog, and refresh the list                           |
| Network / other            | Use `showApiError(e, notificationsService)` from `@utils/api-error-parser`                                 |

Use `parseApiError` from `@utils/api-error-parser` to extract `title` from all
of these. A helper:

```ts
import { parseApiError } from "@utils/api-error-parser";

const parsed = parseApiError(e);
if (parsed.status === 409 || parsed.status === 422) {
  setFormError(parsed.title ?? parsed.message);
} else if (parsed.status === 404) {
  notificationsService.error("This redirect no longer exists.");
  onClose();
  await onSaved();
} else {
  showApiError(e, notificationsService);
}
```

### 7.11 Auto-discovered badge

When `mode === "edit"` and `formData.isAutoDiscovered === true`, render a
read-only `Alert` above the form:

```tsx
{
  mode === "edit" && formData?.isAutoDiscovered && (
    <Alert severity="info" sx={{ mb: 2 }}>
      This redirect was created automatically by the system.
    </Alert>
  );
}
```

### 7.12 Client-side validation

Run before calling the API:

| Field                       | Rule                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `fromPath`                  | Required when `sourceType = "InternalPath"`; must start with `/`                                               |
| `fromLanguage` / `fromSlug` | Both required when `sourceType = "ContentSlug"`                                                                |
| `fromContentId`             | Required and must be a positive integer when `sourceType = "ContentId"`                                        |
| `toUrl`                     | Required when `targetType = "ExternalUrl"`; must be a valid absolute URL starting with `http://` or `https://` |
| `toPath`                    | Required when `targetType = "InternalPath"`; must start with `/`                                               |
| `toLanguage` / `toSlug`     | Both required when `targetType = "ContentSlug"`                                                                |
| `toContentId`               | Required and must be a positive integer when `targetType = "ContentId"`                                        |

### 7.13 Dialog actions

Follow `AddContentDialog`, not page-level action bars. Use `DialogActions`
with:

- `Cancel` button that resets local state and closes the dialog
- `Save` button for create/edit submit
- optional loading state on the save button while request is in flight

Suggested shell:

```tsx
<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
  <DialogTitle>{mode === "create" ? "Add Redirect" : "Edit Redirect"}</DialogTitle>
  <DialogContent>{/* form fields */}</DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleSubmit} variant="contained" disabled={!isValid || isSaving}>
      {mode === "create" ? "Create" : "Save"}
    </Button>
  </DialogActions>
</Dialog>
```

---

## 8. API Method Names (Current generated client)

| Action         | Generated method                                     |
| -------------- | ---------------------------------------------------- |
| List redirects | `client.api.redirectsList({ query })`                |
| Get one        | `client.api.redirectsDetail(id)`                     |
| Create         | `client.api.redirectsCreate(payload)`                |
| Update (PATCH) | `client.api.redirectsPartialUpdate(id, payload)`     |
| Delete         | `client.api.redirectsDelete(id)`                     |
| Auto-discover  | `client.api.redirectsDiscoverCreate({ query })`      |
| Bulk delete    | `client.api.redirectsBulkDelete(ids)`                |
| Export         | `client.api.redirectsExportList({ query }, ...)`     |
| Sync           | `client.api.redirectsSyncList({ syncToken, query })` |

`redirectsSyncList` exists in the generated client but is not required for the
initial CRUD list/form implementation unless live sync is added later.

---

## 9. TypeScript Types (Current generated client)

The generated client currently contains these Redirect types in
`swagger-client.ts`:

- `RedirectDetailsDto` — full response object (as described in the backend spec §5)
- `RedirectCreateDto` — POST body
- `RedirectUpdateDto` — PATCH body with nullable fields, but **without** `nullProperties`

Important mismatch from the original backend writeup:

- The generated DTOs use string unions, not numeric enums.
- The generated PATCH DTO does not expose `nullProperties`.

The implementation should follow the generated Swagger contract unless the
backend team updates the schema and the client is regenerated.

Import them from `@lib/network/swagger-client`.

---

## 10. Breadcrumbs

The dialog does not participate in breadcrumb navigation. Only the list page
needs breadcrumbs:

| Page | `breadcrumbs` prop        | `currentBreadcrumb` prop     |
| ---- | ------------------------- | ---------------------------- |
| List | `dataListBreadcrumbLinks` | `redirectListPageBreadcrumb` |

`dataListBreadcrumbLinks` is imported from `utils/constants`.

---

## 11. Summary Checklist

- [ ] Regenerate API client if the backend Redirects contract changes again
- [ ] Add `redirects` to `CoreModule` enum in `src/lib/router/index.ts`
- [ ] Add lazy module + render condition in `src/features/module-loader/index.tsx`
- [ ] Add `redirects` category in `src/authenticated-layout.tsx`
- [ ] Add menu item in `src/utils/menu-config.tsx`
- [ ] Create `src/features/redirects/constants.ts`
- [ ] Create `src/features/redirects/index.tsx` (list-only route)
- [ ] Create `src/features/redirects/list/index.tsx` (list page + dialog host)
- [ ] Create `src/features/redirects/dialog/index.tsx` (shared create/edit dialog)
- [ ] Create `src/features/redirects/dialog/content-id-autocomplete.tsx`
- [ ] Wire Auto-Discover button with `redirectsDiscoverCreate`
- [ ] Wire export with `redirectsExportList`
- [ ] Wire bulk delete with `redirectsBulkDelete`
- [ ] Open create/edit from local list state instead of routing
- [ ] Reuse the AI draft Autocomplete interaction for ContentId selection
- [ ] Handle 409 / 422 / 404 error responses from the API
- [ ] Use generated string enum values from `swagger-client.ts`
