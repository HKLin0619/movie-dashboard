# Data Folder

## Structure

```
data/
  anime1/
    store.json       ← API data (anime list, overwritten on every Refresh)
    favorites.json   ← Your favorites (id + addedDate only, never overwritten)
```

## How it works

- **`store.json`** is replaced entirely every time you click the Refresh button on the dashboard. It contains the full anime list from the anime1.me API.
- **`favorites.json`** is only written when you click the heart icon on an anime. It stores only the `id` and `addedDate` of your favorites.
- When displaying the anime list, both files are read and merged in real time.

## Adding a new category in the future

Create a new subfolder following the same pattern:

```
data/
  movies/
    store.json
    favorites.json
```

## Backup recommendation

Only `favorites.json` contains your personal data. Back it up if needed:

```bash
copy data\anime1\favorites.json data\anime1\favorites.backup.json
```
