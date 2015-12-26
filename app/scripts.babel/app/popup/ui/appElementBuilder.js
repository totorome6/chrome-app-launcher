
(function (window, document) {

    let { IconService } = window.popup.service;

    class AppElementBuilder {

        constructor (app) {
            this.app = app;
        }

        static create (app) {
            return new AppElementBuilder(app);
        }

        withIconSize (iconSize) {
            this.iconSize = iconSize;
            return this;
        }

        build () {
            let app = this.app,
                type = this.iconSize;

            let iconUrl = IconService.getIconUrl(app, type);
            let style = iconUrl ? `style="background-image: url('${ iconUrl }')"` : '';

            let result = document.createElement('div');
            result.className = 'app card';
            result.setAttribute('tabindex', '1');
            result.innerHTML = `<div class="icon" ${ style }></div><div class="name">${ app.name }</div>`;
            result.dataset.appId = app.id;
            return result;
        }
    }

    window.popup.ui.AppElementBuilder = AppElementBuilder;

})(window, document);
