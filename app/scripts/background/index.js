import { SettingsService } from '../common/settings';
import customizeIconColor from './iconColor';
import openAsWindow from './openAsWindow';

function registerBackgroundScripts() {
    const settingsService = new SettingsService();
    customizeIconColor(settingsService);
    openAsWindow(settingsService);
}

registerBackgroundScripts();
