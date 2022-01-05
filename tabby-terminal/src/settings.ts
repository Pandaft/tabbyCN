import { Injectable } from '@angular/core'
import { SettingsTabProvider } from 'tabby-settings'

import { AppearanceSettingsTabComponent } from './components/appearanceSettingsTab.component'
import { TerminalSettingsTabComponent } from './components/terminalSettingsTab.component'
import { ColorSchemeSettingsTabComponent } from './components/colorSchemeSettingsTab.component'

/** @hidden */
@Injectable()
export class AppearanceSettingsTabProvider extends SettingsTabProvider {
    id = 'terminal-appearance'
    icon = 'swatchbook'
    title = '外观'
    prioritized = true

    getComponentType (): any {
        return AppearanceSettingsTabComponent
    }
}

/** @hidden */
@Injectable()
export class ColorSchemeSettingsTabProvider extends SettingsTabProvider {
    id = 'terminal-color-scheme'
    icon = 'palette'
    title = '配色方案'

    getComponentType (): any {
        return ColorSchemeSettingsTabComponent
    }
}

/** @hidden */
@Injectable()
export class TerminalSettingsTabProvider extends SettingsTabProvider {
    id = 'terminal'
    icon = 'terminal'
    title = '终端'
    prioritized = true

    getComponentType (): any {
        return TerminalSettingsTabComponent
    }
}
