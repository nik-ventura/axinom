(function() {
  'use strict';

  angular
    .module('axinom')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/components/heatlog/heatlog.html',
        controller: 'HeatlogController',
        controllerAs: 'heatlog'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
