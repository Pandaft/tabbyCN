/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component, Input } from '@angular/core'

import { PlatformService } from 'tabby-core'
import { LoginScript, LoginScriptsOptions } from '../middleware/loginScriptProcessing'

/** @hidden */
@Component({
    selector: 'login-scripts-settings',
    template: require('./loginScriptsSettings.component.pug'),
})
export class LoginScriptsSettingsComponent {
    @Input() options: LoginScriptsOptions
    scripts: LoginScript[]

    constructor (
        private platform: PlatformService,
    ) { }

    ngOnInit () {
        this.scripts = this.options.scripts ?? []
    }

    async deleteScript (script: LoginScript) {
        if ((await this.platform.showMessageBox(
            {
                type: 'warning',
                message: '删除此脚本',
                detail: script.expect,
                buttons: ['确定', '取消'],
                defaultId: 0,
                cancelId: 1,
            }
        )).response === 0) {
            this.scripts = this.scripts.filter(x => x !== script)
        }
    }

    addScript () {
        this.scripts.push({ expect: '', send: '' })
    }

    save () {
        this.options.scripts = this.scripts
    }
}
