import { Injectable } from '@angular/core'
import { HotkeyDescription, HotkeyProvider } from 'tabby-core'

/** @hidden */
@Injectable()
export class TerminalHotkeyProvider extends HotkeyProvider {
    hotkeys: HotkeyDescription[] = [
        {
            id: 'copy',
            name: '复制到剪贴板',
        },
        {
            id: 'paste',
            name: '从剪贴板粘贴',
        },
        {
            id: 'home',
            name: '跳到行首',
        },
        {
            id: 'end',
            name: '跳到行尾',
        },
        {
            id: 'previous-word',
            name: '跳到上一个单词',
        },
        {
            id: 'next-word',
            name: '跳到下一个单词',
        },
        {
            id: 'delete-previous-word',
            name: '删除上一个单词',
        },
        {
            id: 'delete-next-word',
            name: '删除后一个单词',
        },
        {
            id: 'clear',
            name: '清空终端',
        },
        {
            id: 'zoom-in',
            name: '放大',
        },
        {
            id: 'zoom-out',
            name: '缩小',
        },
        {
            id: 'reset-zoom',
            name: '重置缩放',
        },
        {
            id: 'ctrl-c',
            name: '智能 Ctrl-C (copy/abort)',
        },
        {
            id: 'copy-current-path',
            name: '复制当前路径',
        },
        {
            id: 'search',
            name: '搜索',
        },
        {
            id: 'pane-focus-all',
            name: '聚焦所有窗格（广播）',
        },
    ]

    async provide (): Promise<HotkeyDescription[]> {
        return this.hotkeys
    }
}
