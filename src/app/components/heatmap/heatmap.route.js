(function() {
    'use strict';

    angular
        .module('axinom')
        .config(routerConfig);

    /** @ngInject */
    function routerConfig($stateProvider) {
        $stateProvider
            .state('heatmap', {
                url: '/heatmap',
                templateUrl: 'app/components/heatmap/heatmap.html',
                controller: 'HeatmapController',
                controllerAs: 'vm'
            });

    }

})();
