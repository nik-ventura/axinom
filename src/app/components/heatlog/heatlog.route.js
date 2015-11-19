(function() {
    'use strict';

    angular
        .module('axinom')
        .config(routerConfig);

    /** @ngInject */
    function routerConfig($stateProvider) {
        $stateProvider
            .state('heatlog', {
                url: '/heatlog',
                templateUrl: 'app/components/heatlog/heatlog.html',
                controller: 'HeatlogController',
                controllerAs: 'heatlog'
            });

    }

})();
