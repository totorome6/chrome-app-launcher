import { SettingsService } from '../common/settings';
import { AppsService } from './services';
import AppsLauncher from './launcher';

let launcher = new AppsLauncher(new AppsService(), new SettingsService());
launcher.initialize()
  .catch(err => console.error(err, err.stack));
