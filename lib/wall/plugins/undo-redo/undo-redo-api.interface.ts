export interface IUndoRedoApi {
    undo();

    undoSize(): number;

    redo();

    redoSize(): number;
}
