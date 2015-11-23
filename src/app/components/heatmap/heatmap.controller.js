(function() {
    'use strict';

    angular
        .module('axinom')
        .controller('HeatmapController', HeatmapController);

    /** @ngInject */
    function HeatmapController($window, $scope) {
        var vm = this;

        // Heatmap playback slider
        $scope.play = false;
        $scope.playToggle = function() {
            var self = this;
            $scope.play = !$scope.play;
        };
        var datesArray = ['21-02-15', '22-02-15', '23-02-15', '24-02-15', '25-02-15', '26-02-15'];
        $scope.dateMax = datesArray.length - 1;
        $scope.datesArray = 0;
        $scope.datesTranslate = function(value) {
            return datesArray[value] + '';
        };

        // Heatmap
        var _margin = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };
        var transitioning;
        var _width = $(window).width() - 0;
        var _height = $(window).height();
        var _chartWidth = _width - (_margin.left + _margin.right);
        var _chartHeight = _height - (_margin.top + _margin.bottom);
        var _sizeByMetric = "size";
        var _colorScale = d3.scale.category10();
        // create div containers
        var svg = d3.select("#chart")
            .style("margin-top", _margin.top + "px")
            .style("margin-right", _margin.right + "px")
            .style("margin-bottom", _margin.bottom + "px")
            .style("margin-left", _margin.left + "px")
            .append("div")
            .attr("class", "chart")
            .style("width", _chartWidth + "px")
            .style("height", _chartHeight + "px");


        var treemap = d3.layout.treemap()
            .padding([40, 10, 10, 10])
            .size([_chartWidth, _chartHeight])
            .value(function(d) {
                return d.value;
            });

        // update logic
        var x = d3.scale.linear()
            .domain([0, _chartWidth])
            .range([0, _chartWidth]);

        var y = d3.scale.linear()
            .domain([0, _chartHeight])
            .range([0, _chartHeight]);

        function cellUpdate() {
            this.style("left", function(d) {
                return x(d.x) + "px";
            })
                .style("top", function(d) {
                    return y(d.y) + "px";
                })
                .style("width", function(d) {
                    return Math.max(0, d.dx) + "px";
                })
                .style("height", function(d) {
                    return Math.max(0, d.dy) + "px";
                })
                .attr("class", function(d) {
                    return "cell " + d.heat;
                });
        }
        // load data and create visualization
        d3.json("data.json", function(error, data) {
            display(data);
            var depth_child = 2;

            function display(data) {
                var nodes = treemap.nodes(data);
                svg.selectAll(".cell").remove();
                var cellSelection = svg.selectAll(".cell").data(nodes);
                var cellEnterSelection = cellSelection.enter().append("div")
                    .attr("class", "cell").on("click", zoomin);
                cellSelection.append("div")
                    .attr("class", function(d) {
                        if (d.depth < 2) {
                            return "unit label";
                        } else {
                            return "label";
                        }
                    })
                    .text(function(d) {
                        return d.name ? d.name : "";
                    });
                cellSelection.append("div")
                    .attr("class", function(d) {
                        if (d.depth < 2 && d.value < 100) {
                            return "unit value";
                        } else if (d.value < 100) {
                            return "label value";
                        } else {
                            return "hidden";
                        }
                    })
                    .text(function(d) {
                        if (d.name) {
                            return (d.value && d.value !== "" ? d.value + "%" : "");
                        }
                        return "";
                    });
                cellEnterSelection.call(cellUpdate);

                function zoomin(d) {
                    if (transitioning || !d || d.depth >= depth_child) return;
                    transitioning = true;
                    console.log(d);
                    if (d.depth == 1 && depth_child > 1) {
                        display(d);
                        depth_child--;

                    } else if (depth_child < 2) {
                        depth_child++;
                        display(d.parent);
                    }

                    // var t1 = cellSelection.transition().duration(750);
                    // var t2 = cellEnterSelection.transition().duration(750);

                    // // Update the domain only after entering new elements.
                    // x.domain([d.x, d.x + d.dx]);
                    // y.domain([d.y, d.y + d.dy]);

                    // // Enable anti-aliasing during the transition.
                    // svg.style("shape-rendering", null);

                    // // Draw child nodes on top of parent nodes.
                    // svg.selectAll(".cell").sort(function(a, b) {
                    //     return a.depth - b.depth;
                    // });

                    // t1.selectAll(".cell").call(cellUpdate);
                    // t2.selectAll(".cell").call(cellUpdate);

                    // // Remove the old node when the transition is finished.
                    // t1.remove().each("end", function() {
                    //     svg.style("shape-rendering", "crispEdges");
                    //     transitioning = false;
                    // });
                    transitioning = false;
                }

                function name(d) {
                    return d.parent ? name(d.parent) + " → " + d.name : d.name;
                }
            }

        });
        $('html').on('keydown', function(event) {

            if (!$(event.target).is('input')) {
                console.log(event.which);
                event.preventDefault();
                if (event.which == 8) {
                    //                    $route.reload();
                    location.reload();
                    //                    zoomout(d);
                    return false;
                }
            }
        });


    }
})();