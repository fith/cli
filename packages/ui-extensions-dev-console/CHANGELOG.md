# @shopify/ui-extensions-dev-console-app

## 3.45.0-pre.3

## 3.45.0-pre.2

## 3.45.0-pre.1

## 3.44.1-pre.0

## 3.44.0

## 3.43.0

### Minor Changes

- 942316711: Added a Tooltip component used to wrap any item you wish to have a tooltip.

  Tooltip accepts a string prop `text` for the content of the tooltip, and a single child of type `JSX.Element` OR `string`.

  ### Example

  ```tsx
  import {Tooltip} from '@components/Tooltip'

  // Add a tooltip to a component

  <Tooltip text="This is a tooltip!">
    <IconButton icon={SomeIcon} />
  </Tooltip>

  // Add a tooltip to an a string

  <Tooltip text="This is a tooltip!">
    This string will have a dotted underline.
  </Tooltip>

  // Since Tooltip is wrapped an inline-block div, it may be used
  // in a block of text

  <p>
    Only <Tooltip text="This right here!">this section</Tooltip> will be underlined and trigger a tooltip.
  </p>
  ```

## 3.42.0

## 3.41.2

## 3.41.1

## 3.41.0

## 3.40.3

## 3.40.2

## 3.40.1

## 3.40.0

## 3.39.0

## 3.38.0

## 3.37.0

## 3.36.2

## 3.36.1

## 3.36.0

### Minor Changes

- 335a96a24: Improved dev console with new UX & functionality. New functionality: Preview app link and QRCode, better post purchase extension instructions, copy button for all preview links, support for upcoming UI extension changes

### Patch Changes

- Updated dependencies [335a96a24]
  - @shopify/ui-extensions-server-kit@4.1.0

## 3.35.0

### Patch Changes

- Updated dependencies [10b86c459]
  - @shopify/ui-extensions-server-kit@4.0.1

## 3.34.0

## 3.33.0

## 3.32.1

## 3.32.0

## 3.31.1

## 3.31.0

## 3.30.2

## 3.30.1

## 3.30.0

## 3.29.0

## 3.28.0

## 3.27.0

## 3.26.0

### Patch Changes

- Updated dependencies [feee9215]
  - @shopify/ui-extensions-server-kit@4.0.0

## 3.25.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.25.0

## 3.24.1

### Patch Changes

- @shopify/ui-extensions-server-kit@3.24.1

## 3.24.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.24.0

## 3.23.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.23.0

## 3.22.1

### Patch Changes

- @shopify/ui-extensions-server-kit@3.22.1

## 3.22.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.22.0

## 3.21.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.21.0

## 3.20.1

### Patch Changes

- @shopify/ui-extensions-server-kit@3.20.1

## 3.20.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.20.0

## 3.19.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.19.0

## 3.18.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.18.0

## 3.17.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.17.0

## 3.16.3

### Patch Changes

- @shopify/ui-extensions-server-kit@3.16.3

## 3.16.2

### Patch Changes

- @shopify/ui-extensions-server-kit@3.16.2

## 3.16.1

### Patch Changes

- @shopify/ui-extensions-server-kit@3.16.1

## 3.16.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.16.0

## 3.15.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.15.0

## 3.14.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.14.0

## 3.13.1

### Patch Changes

- @shopify/ui-extensions-server-kit@3.13.1

## 3.13.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.13.0

## 3.12.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.12.0

## 3.11.0

### Patch Changes

- 9bfa8428: Fix the extensions hover background for Safari in the dev console
- Updated dependencies [4fca2930]
  - @shopify/ui-extensions-server-kit@3.11.0

## 3.10.1

### Patch Changes

- @shopify/ui-extensions-server-kit@3.10.1

## 3.10.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.10.0

## 3.9.2

### Patch Changes

- @shopify/ui-extensions-server-kit@3.9.2

## 3.9.1

### Patch Changes

- @shopify/ui-extensions-server-kit@3.9.1

## 3.9.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.9.0

## 3.8.0

### Patch Changes

- @shopify/ui-extensions-server-kit@3.8.0

## 3.7.1

### Patch Changes

- @shopify/ui-extensions-server-kit@3.7.1
