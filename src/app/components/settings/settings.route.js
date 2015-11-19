(function() {
    'use strict';

    angular
        .module('axinom')
        .config(routerConfig);

    /** @ngInject */
    function routerConfig($stateProvider) {
        $stateProvider
            .state('settings', {
                url: '/settings',
                templateUrl: 'app/components/settings/settings.html',
                controller: 'SettingsController',
                controllerAs: 'vm'
            });

    }

})();
