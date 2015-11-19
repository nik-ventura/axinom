(function() {
    'use strict';

    angular
        .module('axinom')
        .config(routerConfig);

    /** @ngInject */
    function routerConfig($stateProvider) {
        $stateProvider
            .state('timelog', {
                url: '/timelog',
                templateUrl: 'app/components/timelog/timelog.html',
                controller: 'TimelogController',
                controllerAs: 'vm'
            });

    }

})();
