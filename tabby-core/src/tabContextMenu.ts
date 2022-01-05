/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Subscription } from 'rxjs'
import { AppService } from './services/app.service'
import { BaseTabComponent } from './components/baseTab.component'
import { TabHeaderComponent } from './components/tabHeader.component'
import { SplitTabComponent, SplitDirection } from './components/splitTab.component'
import { TabContextMenuItemProvider } from './api/tabContextMenuProvider'
import { MenuItemOptions } from './api/menu'
import { ProfilesService } from './services/profiles.service'
import { TabsService } from './services/tabs.service'
import { HotkeysService } from './services/hotkeys.service'
import { PromptModalComponent } from './components/promptModal.component'
import { SplitLayoutProfilesService } from './profiles'
import { TAB_COLORS } from './utils'

/** @hidden */
@Injectable()
export class TabManagementContextMenu extends TabContextMenuItemProvider {
    weight = 99

    constructor (
        private app: AppService,
    ) {
        super()
    }

    async getItems (tab: BaseTabComponent, tabHeader?: TabHeaderComponent): Promise<MenuItemOptions[]> {
        let items: MenuItemOptions[] = [
            {
                label: '关闭',
                click: () => {
                    if (this.app.tabs.includes(tab)) {
                        this.app.closeTab(tab, true)
                    } else {
                        tab.destroy()
                    }
                },
            },
        ]
        if (tabHeader) {
            items = [
                ...items,
                {
                    label: '关闭其他标签页',
                    click: () => {
                        for (const t of this.app.tabs.filter(x => x !== tab)) {
                            this.app.closeTab(t, true)
                        }
                    },
                },
                {
                    label: '关闭右边的标签页',
                    click: () => {
                        for (const t of this.app.tabs.slice(this.app.tabs.indexOf(tab) + 1)) {
                            this.app.closeTab(t, true)
                        }
                    },
                },
                {
                    label: '关闭左边的标签页',
                    click: () => {
                        for (const t of this.app.tabs.slice(0, this.app.tabs.indexOf(tab))) {
                            this.app.closeTab(t, true)
                        }
                    },
                },
            ]
        } else {
            if (tab.parent instanceof SplitTabComponent) {
                const directions: SplitDirection[] = ['r', 'b', 'l', 't']
                items.push({
                    label: '拆分',
                    submenu: directions.map(dir => ({
                        label: {
                            r: '向右',
                            b: '向下',
                            l: '向左',
                            t: '向上',
                        }[dir],
                        click: () => {
                            (tab.parent as SplitTabComponent).splitTab(tab, dir)
                        },
                    })) as MenuItemOptions[],
                })
            }
        }
        return items
    }
}

/** @hidden */
@Injectable()
export class CommonOptionsContextMenu extends TabContextMenuItemProvider {
    weight = -1

    constructor (
        private app: AppService,
        private ngbModal: NgbModal,
        private splitLayoutProfilesService: SplitLayoutProfilesService,
    ) {
        super()
    }

    async getItems (tab: BaseTabComponent, tabHeader?: TabHeaderComponent): Promise<MenuItemOptions[]> {
        let items: MenuItemOptions[] = []
        if (tabHeader) {
            items = [
                ...items,
                {
                    label: '重命名',
                    click: () => tabHeader.showRenameTabModal(),
                },
                {
                    label: '克隆',
                    click: () => this.app.duplicateTab(tab),
                },
                {
                    label: '颜色',
                    sublabel: TAB_COLORS.find(x => x.value === tab.color)?.name,
                    submenu: TAB_COLORS.map(color => ({
                        label: color.name,
                        type: 'radio',
                        checked: tab.color === color.value,
                        click: () => {
                            tab.color = color.value
                        },
                    })) as MenuItemOptions[],
                },
            ]

            if (tab instanceof SplitTabComponent && tab.getAllTabs().length > 1) {
                items.push({
                    label: '保存布局为配置文件',
                    click: async () => {
                        const modal = this.ngbModal.open(PromptModalComponent)
                        modal.componentInstance.prompt = '配置文件名'
                        const name = (await modal.result)?.value
                        if (!name) {
                            return
                        }
                        this.splitLayoutProfilesService.createProfile(tab, name)
                    },
                })
            }
        }
        return items
    }
}

/** @hidden */
@Injectable()
export class TaskCompletionContextMenu extends TabContextMenuItemProvider {
    constructor (
        private app: AppService,
    ) {
        super()
    }

    async getItems (tab: BaseTabComponent): Promise<MenuItemOptions[]> {
        const process = await tab.getCurrentProcess()
        const items: MenuItemOptions[] = []

        const extTab: (BaseTabComponent & { __completionNotificationEnabled?: boolean, __outputNotificationSubscription?: Subscription|null }) = tab

        if (process) {
            items.push({
                enabled: false,
                label: '当前进程：' + process.name,
            })
            items.push({
                label: '完成时通知',
                type: 'checkbox',
                checked: extTab.__completionNotificationEnabled,
                click: () => {
                    extTab.__completionNotificationEnabled = !extTab.__completionNotificationEnabled

                    if (extTab.__completionNotificationEnabled) {
                        this.app.observeTabCompletion(tab).subscribe(() => {
                            new Notification('进程完成', {
                                body: process.name,
                            }).addEventListener('click', () => {
                                this.app.selectTab(tab)
                            })
                            extTab.__completionNotificationEnabled = false
                        })
                    } else {
                        this.app.stopObservingTabCompletion(tab)
                    }
                },
            })
        }
        items.push({
            label: '活跃时通知',
            type: 'checkbox',
            checked: !!extTab.__outputNotificationSubscription,
            click: () => {
                if (extTab.__outputNotificationSubscription) {
                    extTab.__outputNotificationSubscription.unsubscribe()
                    extTab.__outputNotificationSubscription = null
                } else {
                    extTab.__outputNotificationSubscription = tab.activity$.subscribe(active => {
                        if (extTab.__outputNotificationSubscription && active) {
                            extTab.__outputNotificationSubscription.unsubscribe()
                            extTab.__outputNotificationSubscription = null
                            new Notification('标签页活跃', {
                                body: tab.title,
                            }).addEventListener('click', () => {
                                this.app.selectTab(tab)
                            })
                        }
                    })
                }
            },
        })
        return items
    }
}


/** @hidden */
@Injectable()
export class ProfilesContextMenu extends TabContextMenuItemProvider {
    weight = 10

    constructor (
        private profilesService: ProfilesService,
        private tabsService: TabsService,
        private app: AppService,
        hotkeys: HotkeysService,
    ) {
        super()
        hotkeys.hotkey$.subscribe(hotkey => {
            if (hotkey === 'switch-profile') {
                let tab = this.app.activeTab
                if (tab instanceof SplitTabComponent) {
                    tab = tab.getFocusedTab()
                    if (tab) {
                        this.switchTabProfile(tab)
                    }
                }
            }
        })
    }

    async switchTabProfile (tab: BaseTabComponent) {
        const profile = await this.profilesService.showProfileSelector()
        if (!profile) {
            return
        }

        const params = await this.profilesService.newTabParametersForProfile(profile)
        if (!params) {
            return
        }

        if (!await tab.canClose()) {
            return
        }

        const newTab = this.tabsService.create(params)
        ;(tab.parent as SplitTabComponent).replaceTab(tab, newTab)

        tab.destroy()
    }

    async getItems (tab: BaseTabComponent, tabHeader?: TabHeaderComponent): Promise<MenuItemOptions[]> {

        if (!tabHeader && tab.parent instanceof SplitTabComponent && tab.parent.getAllTabs().length > 1) {
            return [
                {
                    label: '切换配置文件',
                    click: () => this.switchTabProfile(tab),
                },
            ]
        }

        return []
    }
}
