(function() {
    'use strict';

    angular
        .module('axinom')
        .config(routerConfig);

    /** @ngInject */
    function routerConfig($stateProvider) {
        $stateProvider
            .state('office', {
                url: '/office',
                templateUrl: 'app/components/office/office2.html',
                controller: 'OfficeController',
                controllerAs: 'vm'
            });

    }

})();
