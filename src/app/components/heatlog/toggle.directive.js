(function() {
    'use strict';

    angular
        .module('axinom')
        .directive('toggleClass', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    element.bind('click', function() {
                        if(element.attr("class") !== "selected") {
                            element.addClass(attrs.toggleClass);
                        } else {
                            element.removeClass("selected");
                            element.addClass("glyphicon glyphicon-pencil");
                        }
                    });
                }
            };
        });
})();
