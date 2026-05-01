# Spaced Study Export/Import Format

## Overview

Spaced Study uses a JSON-based format for exporting and importing data. The format is designed to be human-readable, portable, and extensible.

## File Structure

A Spaced Study export file (`.spaced.json`) contains all your data organized by type:

```json
{
  "version": "1.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "folders": [...],
  "documents": [...],
  "decks": [
    {
      "name": "Deck Name",
      "description": "Optional description",
      "cards": [
        {
          "front": "Question text",
          "back": "Answer text"
        }
      ]
    }
  ]
}
```

## Format Specification

### Version 1.0

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | Format version (currently "1.0") |
| `exportedAt` | ISO 8601 datetime | Yes | When the export was created |
| `folders` | Folder[] | No | Array of folder objects |
| `documents` | Document[] | No | Array of document objects |
| `decks` | Deck[] | No | Array of deck objects |

### Folder Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | No | Original folder id, used only to restore hierarchy during import |
| `name` | string | Yes | Folder name |
| `parentId` | string \| null | No | Original parent folder id, or null for root folders |

### Document Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | No | Original document id |
| `title` | string | Yes | Document title |
| `content` | string | Yes | Markdown content |
| `folderId` | string \| null | No | Original folder id, used to restore placement during import |

### Deck Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Deck name |
| `description` | string | No | Deck description |
| `cards` | Card[] | No | Array of cards in this deck |

### Card Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `front` | string | Yes | Question/term side |
| `back` | string | Yes | Answer/definition side |

## Export Behavior

- **Documents**: Exported with full markdown content
- **Folders**: Exported with hierarchy metadata when selected
- **Decks**: Exported with all their cards inline
- **Cards without deck**: Not supported in v1.0 (cards must belong to a deck)
- **Timestamps**: Not exported (cards will be created as "new" on import)
- **Selective export**: The app can export only chosen folders, documents, and decks. Selecting a folder also includes its nested folders and documents.
- **Document links**: Document references in cards are not maintained on import

## Import Behavior

- **Version check**: Will warn if importing different version
- **Duplicate handling**: Creates new entries (doesn't overwrite existing)
- **Folder placement**: Folders are recreated first, then imported documents are placed in their recreated folders when `folderId` is available
- **Card placement**: Cards are added to existing deck or new deck created
- **Empty arrays**: If no documents or decks, those sections can be omitted

## Examples

### Minimal Export (Just Decks)

```json
{
  "version": "1.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "decks": [
    {
      "name": "Spanish Vocabulary",
      "cards": [
        { "front": "Hello", "back": "Hola" },
        { "front": "Goodbye", "back": "Adiós" }
      ]
    }
  ]
}
```

### Full Export

```json
{
  "version": "1.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "documents": [
    {
      "title": "Study Notes",
      "content": "# Chapter 1\n\nImportant concepts..."
    }
  ],
  "decks": [
    {
      "name": "Biology 101",
      "description": "Cell structure and functions",
      "cards": [
        { "front": "What is a mitochondria?", "back": "The powerhouse of the cell" }
      ]
    }
  ]
}
```

## File Extension

- Recommended extension: `.spaced.json`
- MIME type: `application/json` (or `application/x-spaced-study`)

## Migration Notes

- v1.0 is the initial format
- Future versions may add: card statistics, study history, deck categories
