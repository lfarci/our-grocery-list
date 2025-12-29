# Data Model (Minimal)

```ts
type ItemState = 'active' | 'checked' | 'archived'

Item {
  id: string
  name: string
  category: string
  state: ItemState
  createdAt: Date
}
```

No additional fields unless explicitly requested.
