import { Injectable } from '@angular/core'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ConfigService, BaseTabComponent, TabContextMenuItemProvider, TabHeaderComponent, SplitTabComponent, NotificationsService, MenuItemOptions, ProfilesService, PromptModalComponent } from 'tabby-core'
import { TerminalTabComponent } from './components/terminalTab.component'
import { UACService } from './services/uac.service'
import { TerminalService } from './services/terminal.service'
import { LocalProfile } from './api'

/** @hidden */
@Injectable()
export class SaveAsProfileContextMenu extends TabContextMenuItemProvider {
    constructor (
        private config: ConfigService,
        private ngbModal: NgbModal,
        private notifications: NotificationsService,
    ) {
        super()
    }

    async getItems (tab: BaseTabComponent, _tabHeader?: TabHeaderComponent): Promise<MenuItemOptions[]> {
        if (!(tab instanceof TerminalTabComponent)) {
            return []
        }
        const items: MenuItemOptions[] = [
            {
                label: '另存为配置',
                click: async () => {
                    const modal = this.ngbModal.open(PromptModalComponent)
                    modal.componentInstance.prompt = '新配置名'
                    const name = (await modal.result)?.value
                    if (!name) {
                        return
                    }
                    const profile = {
                        options: {
                            ...tab.profile.options,
                            cwd: await tab.session?.getWorkingDirectory() ?? tab.profile.options.cwd,
                        },
                        name,
                        type: 'local',
                    }
                    this.config.store.profiles = [
                        ...this.config.store.profiles,
                        profile,
                    ]
                    this.config.save()
                    this.notifications.info('已保存')
                },
            },
        ]

        return items
    }
}

/** @hidden */
@Injectable()
export class NewTabContextMenu extends TabContextMenuItemProvider {
    weight = 10

    constructor (
        public config: ConfigService,
        private profilesService: ProfilesService,
        private terminalService: TerminalService,
        private uac: UACService,
    ) {
        super()
    }

    async getItems (tab: BaseTabComponent, tabHeader?: TabHeaderComponent): Promise<MenuItemOptions[]> {
        const profiles = (await this.profilesService.getProfiles()).filter(x => x.type === 'local') as LocalProfile[]

        const items: MenuItemOptions[] = [
            {
                label: '新终端',
                click: () => {
                    if (tab instanceof TerminalTabComponent) {
                        this.profilesService.openNewTabForProfile(tab.profile)
                    } else {
                        this.terminalService.openTab()
                    }
                },
            },
            {
                label: '打开配置',
                submenu: profiles.map(profile => ({
                    label: profile.name,
                    click: async () => {
                        let workingDirectory = profile.options.cwd
                        if (!workingDirectory && tab instanceof TerminalTabComponent) {
                            workingDirectory = await tab.session?.getWorkingDirectory() ?? undefined
                        }
                        await this.terminalService.openTab(profile, workingDirectory)
                    },
                })),
            },
        ]

        if (this.uac.isAvailable) {
            items.push({
                label: '打开配置（管理员权限）',
                submenu: profiles.map(profile => ({
                    label: profile.name,
                    click: () => {
                        this.profilesService.openNewTabForProfile({
                            ...profile,
                            options: {
                                ...profile.options,
                                runAsAdministrator: true,
                            },
                        })
                    },
                })),
            })
        }

        if (tab instanceof TerminalTabComponent && tabHeader && this.uac.isAvailable) {
            items.push({
                label: '以管理员身份克隆',
                click: () => {
                    this.profilesService.openNewTabForProfile({
                        ...tab.profile,
                        options: {
                            ...tab.profile.options,
                            runAsAdministrator: true,
                        },
                    })
                },
            })
        }

        if (tab instanceof TerminalTabComponent && tab.parent instanceof SplitTabComponent && tab.parent.getAllTabs().length > 1) {
            items.push({
                label: '聚焦所有窗格',
                click: () => {
                    tab.focusAllPanes()
                },
            })
        }

        return items
    }
}
