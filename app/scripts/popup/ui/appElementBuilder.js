import { IconService } from '../services';

export class AppElementBuilder {

    constructor(app) {
        this.app = app;
    }

    static create(app) {
        return new AppElementBuilder(app);
    }

    build() {
        let { app } = this;
        let iconUrl = IconService.getIconUrl(app);
        let result = document.createElement('div');
        result.className = 'app';
        result.setAttribute('tabindex', '1');
        result.innerHTML = '<div class="app_content">' +
            `<div class="app_icon" style="background-image: url('${ iconUrl }')" ></div>` +
            `<div class="app_name">${ app.name }</div>` +
            '</div>';
        result.dataset.appId = app.id;
        return result;
    }
}
