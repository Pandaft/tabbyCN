import { Injectable } from '@angular/core'
import { ProfilesService } from './services/profiles.service'
import { HotkeyDescription, HotkeyProvider } from './api/hotkeyProvider'
import { PartialProfile, Profile } from './api'

/** @hidden */
@Injectable()
export class AppHotkeyProvider extends HotkeyProvider {
    hotkeys: HotkeyDescription[] = [
        {
            id: 'profile-selector',
            name: '显示配置选择器',
        },
        {
            id: 'toggle-fullscreen',
            name: '切换全屏模式',
        },
        {
            id: 'rename-tab',
            name: '重命名标签页',
        },
        {
            id: 'close-tab',
            name: '关闭标签页',
        },
        {
            id: 'reopen-tab',
            name: '恢复关闭的标签页',
        },
        {
            id: 'toggle-last-tab',
            name: '回到上一个标签页',
        },
        {
            id: 'next-tab',
            name: '切换到下一个标签页',
        },
        {
            id: 'previous-tab',
            name: '切换到上一个标签页',
        },
        {
            id: 'move-tab-left',
            name: '向左移动标签页',
        },
        {
            id: 'move-tab-right',
            name: '向右移动标签页',
        },
        {
            id: 'rearrange-panes',
            name: '显示窗格标签页',
        },
        {
            id: 'duplicate-tab',
            name: '克隆标签页',
        },
        {
            id: 'tab-1',
            name: '标签页 1',
        },
        {
            id: 'tab-2',
            name: '标签页 2',
        },
        {
            id: 'tab-3',
            name: '标签页 3',
        },
        {
            id: 'tab-4',
            name: '标签页 4',
        },
        {
            id: 'tab-5',
            name: '标签页 5',
        },
        {
            id: 'tab-6',
            name: '标签页 6',
        },
        {
            id: 'tab-7',
            name: '标签页 7',
        },
        {
            id: 'tab-8',
            name: '标签页 8',
        },
        {
            id: 'tab-9',
            name: '标签页 9',
        },
        {
            id: 'tab-10',
            name: '标签页 10',
        },
        {
            id: 'tab-11',
            name: '标签页 11',
        },
        {
            id: 'tab-12',
            name: '标签页 12',
        },
        {
            id: 'tab-13',
            name: '标签页 13',
        },
        {
            id: 'tab-14',
            name: '标签页 14',
        },
        {
            id: 'tab-15',
            name: '标签页 15',
        },
        {
            id: 'tab-16',
            name: '标签页 16',
        },
        {
            id: 'tab-17',
            name: '标签页 17',
        },
        {
            id: 'tab-18',
            name: '标签页 18',
        },
        {
            id: 'tab-19',
            name: '标签页 19',
        },
        {
            id: 'tab-20',
            name: '标签页 20',
        },
        {
            id: 'split-right',
            name: '向右拆分',
        },
        {
            id: 'split-bottom',
            name: '向下拆分',
        },
        {
            id: 'split-left',
            name: '向左拆分',
        },
        {
            id: 'split-top',
            name: '向上拆分',
        },
        {
            id: 'pane-maximize',
            name: '最大化当前窗格',
        },
        {
            id: 'pane-nav-up',
            name: '聚焦上方窗格',
        },
        {
            id: 'pane-nav-down',
            name: '聚焦下方窗格',
        },
        {
            id: 'pane-nav-left',
            name: '聚焦左方窗格',
        },
        {
            id: 'pane-nav-right',
            name: '聚焦右方窗格',
        },
        {
            id: 'pane-nav-previous',
            name: '聚焦上一个窗格',
        },
        {
            id: 'pane-nav-next',
            name: '聚焦下一个窗格',
        },
        {
            id: 'switch-profile',
            name: '在当前窗格切换配置',
        },
        {
            id: 'close-pane',
            name: '关闭当前窗格',
        },
    ]

    constructor (
        private profilesService: ProfilesService,
    ) { super() }

    async provide (): Promise<HotkeyDescription[]> {
        const profiles = await this.profilesService.getProfiles()
        return [
            ...this.hotkeys,
            ...profiles.map(profile => ({
                id: `profile.${AppHotkeyProvider.getProfileHotkeyName(profile)}`,
                name: `新标签页：${profile.name}`,
            })),
            ...this.profilesService.getProviders().map(provider => ({
                id: `profile-selectors.${provider.id}`,
                name: `显示 ${provider.name} 配置选择器`,
            })),
        ]
    }

    static getProfileHotkeyName (profile: PartialProfile<Profile>): string {
        return (profile.id ?? profile.name).replace(/\./g, '-')
    }
}
