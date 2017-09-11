import { Injectable } from '@angular/core';

@Injectable()
export class WallEditorRegistry {
    editors: Map<string, any> = new Map();

    focusedEditor: string = null;

    setFocusedEditor(id: string) {
        this.focusedEditor = id;
    }

    isFocusedEditor(id: string): boolean {
        return this.focusedEditor === id;
    }

    registerEditor(id, editor) {
        this.editors.set(id, editor);
    }

    unRegister(id) {
        this.editors.delete(id);
    }
}