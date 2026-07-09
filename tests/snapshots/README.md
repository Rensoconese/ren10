# Contract and token snapshots

The JSON snapshots make public surface changes explicit in pull requests. Run
`npm run snapshots:update` when intentionally adding or removing a token or
component, then review the diff. CI runs `npm run snapshots:check` to detect
uncommitted drift.
