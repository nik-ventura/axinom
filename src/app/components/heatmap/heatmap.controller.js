(function() {
    'use strict';

    angular
        .module('axinom')
        .controller('HeatmapController', HeatmapController);

    /** @ngInject */
    function HeatmapController($window, toastr, $scope) {
        var vm = this;

        // Heatmap playback slider
        $scope.play = false;
        $scope.playToggle = function() {
            var self = this;
            $scope.play = !$scope.play;
        };
        var datesArray = ['21-02-15', '22-02-15', '23-02-15', '24-02-15', '25-02-15', '26-02-15'];
        $scope.dateMax = datesArray.length -1;
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
        var _height = $(window).height() ;
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

        var grandparent = svg.append("div")
            .attr("class", "grandparent");


        grandparent.append("div")
            .style("top", -_margin.top + "px")
            .style("width", _chartWidth + "px")
            .style("height", _margin.top + "px");

        grandparent.append("div")
            .style("left", (_chartWidth / 2) - 20 + "px")
            .style("top", -35 + "px");

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
                grandparent
                    .datum(data.parent)
                    .on("click", zoomout)
                    .select("text")
                    .text(name(data));
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
                        if (d.name) {
                            return d.name + " " + (d.time && d.time !== "" ? d.time + "%" : "");
                        }
                        return "";
                    });
                cellSelection.append("div")
                    .attr("class", function(d) {
                        if (d.depth < 2) {
                            return "unit value";
                        } else {
                            return "label value";
                        }
                    })
                    .text(function(d) {
                        if (d.name) {
                            return  (d.value && d.value !== "" ? d.value + "%" : "");
                        }
                        return "";
                    });
                cellEnterSelection.call(cellUpdate);

                function zoomin(d) {
                    if (transitioning || !d || d.depth >= depth_child) return;
                    transitioning = true;
                    if (depth_child > 1 && d.depth >= 1) {
                        depth_child--;
                    }
                    display(d);

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

                function zoomout(d) {
                    if (transitioning || !d || d.depth >= depth_child) return;
                    transitioning = true;
                    display(d);
                    if (depth_child < 2) {
                        console.log(depth_child);
                        depth_child++;
                    }
                    transitioning = false;
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
                }

                function name(d) {
                    return d.parent ? name(d.parent) + " → " + d.name : d.name;
                }
            }
        });

        // setup
        // var windowHeight = $(window).height() - 60;
        // var windowWidth = $(window).width();
        // var margin = {
        //         top: 60,
        //         right: 0,
        //         bottom: 0,
        //         left: 0
        //     },
        //     width = windowWidth,
        //     height = windowHeight,
        //     formatNumber = d3.format(",d"),
        //     transitioning;
        // var _chartWidth = width - (margin.left + margin.right) - 15;
        // var _chartHeight = height - (margin.top + margin.bottom);
        // var _sizeByMetric = "size";
        // var _colorScale = d3.scale.category10();

        // var treemap = d3.layout.treemap()
        //     .children(function(d, depth) {
        //         return depth ? null : d._children;
        //     })
        //     .sort(function(a, b) {
        //         return a.value - b.value;
        //     })
        //     .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        //     .round(false);
        // console.log(treemap);

        // // create div containers
        // var svg = d3.select("#chart").append("div")
        //     .attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.bottom + margin.top)
        //     .style("margin-left", -margin.left + "px")
        //     .style("margin-right", -margin.right + "px")
        //     .style("background-color", "#ddd")
        //     .append("div")
        //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //     .style("shape-rendering", "crispEdges");

        // // update logic
        // var x = d3.scale.linear()
        //     .domain([0, width])
        //     .range([0, width]);

        // var y = d3.scale.linear()
        //     .domain([0, height])
        //     .range([0, height]);

        // // load data and create visualization
        // // d3.json("http://www.billdwhite.com/wordpress/wp-content/data/demo_data_03.json", function(error, data) {
        // //     var treemap = d3.layout.treemap()
        // //         .padding([20, 10, 10, 10])
        // //         .size([_chartWidth, _chartHeight])
        // //         .value(function(d) {
        // //             return d["size"];
        // //         });
        // //     var nodes = treemap.nodes(data);
        // //     var cellSelection = _chart.selectAll(".cell").data(nodes);
        // //     var cellEnterSelection = cellSelection.enter().append("div")
        // //         .attr("class", "cell").on("click", transition);;
        // //     cellEnterSelection.append("div")
        // //         .attr("class", "label")
        // //         .text(function(d) {
        // //             return d.name ? d.name : "";
        // //         });
        // //     cellSelection.transition().duration(250)
        // //         .call(cellUpdate);
        // //     cellSelection.exit().remove();
        // // });



        // var grandparent = svg.append("div")
        //     .attr("class", "grandparent");


        // grandparent.append("div")
        //     .style("top", -margin.top + "px")
        //     .style("width", width + "px")
        //     .style("height", margin.top + "px");

        // grandparent.append("div")
        //     .style("left", (width / 2) - 20 + "px")
        //     .style("top", -35 + "px");

        // // d3.json("http://www.billdwhite.com/wordpress/wp-content/data/demo_data_03.json", function(error, data) {

        // d3.json("data.json", function(root) {
        //     initialize(root);
        //     accumulate(root);
        //     layout(root);
        //     display(root);

        //     function initialize(root) {
        //         root.x = 0;
        //         root.y = 75;
        //         root.dx = width;
        //         root.dy = height;
        //         root.depth = 0;
        //     }

        //     // Aggregate the values for internal nodes. This is normally done by the
        //     // treemap layout, but not here because of our custom implementation.
        //     // We also take a snapshot of the original children (_children) to avoid
        //     // the children being overwritten when when layout is computed.
        //     function accumulate(d) {
        //         return (d._children = d.children) ? d.value = d.children.reduce(function(p, v) {
        //             return p + accumulate(v);
        //         }, 0) : d.value;
        //     }

        //     // Compute the treemap layout recursively such that each group of siblings
        //     // uses the same size (1×1) rather than the dimensions of the parent cell.
        //     // This optimizes the layout for the current zoom state. Note that a wrapper
        //     // object is created for the parent node for each group of siblings so that
        //     // the parent’s dimensions are not discarded as we recurse. Since each group
        //     // of sibling was laid out in 1×1, we must rescale to fit using absolute
        //     // coordinates. This lets us use a viewport to zoom.
        //     function layout(d) {
        //         if (d._children) {
        //             treemap.nodes({
        //                 _children: d._children
        //             });
        //             d._children.forEach(function(c) {
        //                 c.x = d.x + c.x * d.dx;
        //                 c.y = d.y + c.y * d.dy;
        //                 c.dx *= d.dx;
        //                 c.dy *= d.dy;
        //                 c.parent = d;
        //                 layout(c);
        //             });
        //         }
        //     }

        //     function display(d) {

        //         grandparent
        //             .datum(d.parent)
        //             .on("click", zoomout)
        //             .select("text")
        //             .text(name(d));


        //         var g1 = svg.insert("div", ".grandparent")
        //             .datum(d)
        //             .attr("class", "depth");


        //         var g = g1.selectAll("div")
        //             .data(d._children)
        //             .enter().append("div");

        //         g.filter(function(d) {
        //             return d._children;
        //         })
        //             .classed("blue children", true)
        //             .append("div")
        //             .attr("class", "label")
        //             .text(function(d) {
        //                 return d.name ? d.name : "";
        //             })
        //             .on("click", zoomin);



        //         g.append("div")
        //             .attr("class", "parent")
        //             .call(parentUpdate)
        //             .append("div")
        //             .attr("class", "label")
        //             .text(function(d) {
        //                 return d.name ? d.name : "";
        //             });

        //         g.selectAll(".child")
        //             .data(function(d) {
        //                 return d._children || [d];
        //             })
        //             .enter()
        //             .append("div")
        //             .attr("class", "child")
        //             .call(cellUpdate)
        //             .append("div")
        //             .attr("class", "label")
        //             .text(function(d) {
        //                 return d.name ? d.name : "";
        //             });
        //         g.selectAll(".children")
        //             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //         function zoomin(d) {
        //             if (transitioning || !d) return;
        //             transitioning = true;
        //             var g2 = displayChild(d),
        //                 t1 = g1.transition().duration(750),
        //                 t2 = g2.transition().duration(750);
        //             t1.selectAll(".parent").style("display", "none");
        //             t2.selectAll(".label").call(text).style("fill-opacity", 1);

        //             // Update the domain only after entering new elements.
        //             x.domain([d.x, d.x + d.dx]);
        //             y.domain([d.y, d.y + d.dy]);


        //             // Enable anti-aliasing during the transition.
        //             svg.style("shape-rendering", null);

        //             // Draw child nodes on top of parent nodes.
        //             svg.selectAll(".depth").sort(function(a, b) {
        //                 return a.depth - b.depth;
        //             });

        //             t1.selectAll(".child").call(cellUpdateZoom);
        //             t2.selectAll(".child").call(cellUpdateZoom);

        //             // Remove the old node when the transition is finished.
        //             t1.remove().each("end", function() {
        //                 svg.style("shape-rendering", "crispEdges");
        //                 transitioning = false;
        //             });
        //         }

        //         function zoomout(d) {
        //             if (transitioning || !d) return;
        //             transitioning = true;
        //             var g2 = display(d),
        //                 t1 = g1.transition().duration(750),
        //                 t2 = g2.transition().duration(750);

        //             // Update the domain only after entering new elements.
        //             x.domain([d.x, d.x + d.dx]);
        //             y.domain([d.y, d.y + d.dy]);

        //             // Enable anti-aliasing during the transition.
        //             svg.style("shape-rendering", null);

        //             // Draw child nodes on top of parent nodes.
        //             svg.selectAll(".depth").sort(function(a, b) {
        //                 return a.depth - b.depth;
        //             });

        //             t1.selectAll(".depth").call(cellUpdate);
        //             t2.selectAll(".child").call(cellUpdate);

        //             // Remove the old node when the transition is finished.
        //             t1.remove().each("end", function() {
        //                 svg.style("shape-rendering", "crispEdges");
        //                 transitioning = false;
        //             });
        //         }

        //         function displayChild(d) {
        //             initialize(root);
        //             grandparent
        //                 .datum(d.parent)
        //                 .on("click", zoomin)
        //                 .select("text")
        //                 .text(name(d));


        //             var g1 = svg.insert("div", ".grandparent")
        //                 .datum(d)
        //                 .attr("class", "depth");


        //             var g = g1.selectAll("div")
        //                 .data(d._children)
        //                 .enter().append("div").classed("children", true);

        //             g.selectAll(".child")
        //                 .data(function(d) {
        //                     return d._children || [d];
        //                 })
        //                 .enter().append("div")
        //                 .attr("class", "child")
        //                 .call(cellUpdateZoom)
        //                 .append("div")
        //                 .attr("class", "label")
        //                 .text(function(d) {
        //                     return d.name ? d.name : "";
        //                 });
        //             g.selectAll(".children")
        //                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        //             return g;
        //         }

        //         return g;
        //     }

        //     function cellUpdate() {
        //         this.style("margin-left", function(d) {
        //             return x(d.x) + "px";
        //         })
        //             .style("margin-top", function(d) {
        //                 return y(d.y) + "px";
        //             })
        //             .style("width", function(d) {
        //                 return Math.max(0, d.dx) + "px";
        //             })
        //             .style("height", function(d) {
        //                 return Math.max(0, d.dy) + "px";
        //             })
        //             .attr("class", function(d) {
        //                 return d.heat + " child";
        //             });
        //     }

        //     // function cellUpdate() {
        //     //     this.attr("style", function(d) {
        //     //         var margin_left = x(d.x) + 5;
        //     //         var margin_top = y(d.y) + 15;
        //     //         var width = Math.max(0, d.dx - 10);
        //     //         var height = Math.max(0, d.dy - 20);
        //     //         if (height < 10) {
        //     //             height = 15;
        //     //         }
        //     //         if (d.id === 1) {
        //     //             margin_top = y(d.y) + 35;
        //     //             height -= 15;
        //     //         }
        //     //         return "width:" + width + "px ; height: " + height + "px ; margin-left: " + margin_left + "px ; margin-top: " + margin_top + "px";;
        //     //     })
        //     //         .attr("class", function(d) {
        //     //             return d.heat + " child";
        //     //         });
        //     // }

        //     function cellUpdateZoom() {
        //         this.style("margin-left", function(d) {
        //             return x(d.x) + "px";
        //         })
        //             .style("margin-top", function(d) {
        //                 return y(d.y) + 75 + "px";
        //             })
        //             .style("width", function(d) {
        //                 return x(d.x + d.dx) - x(d.x) + "px";
        //             })
        //             .style("height", function(d) {
        //                 return y(d.y + d.dy) - y(d.y) + "px";
        //             })
        //             .attr("class", function(d) {
        //                 return d.heat + " child";
        //             });
        //     }

        //     function parentUpdate() {
        //         this.style("margin-left", function(d) {
        //             return x(d.x) + "px";
        //         })
        //             .style("margin-top", function(d) {
        //                 return y(d.y) + "px";
        //             })
        //             .style("width", function(d) {
        //                 return x(d.x + d.dx) - x(d.x) + "px";
        //             })
        //             .style("height", function(d) {
        //                 return y(d.y + d.dy) - y(d.y) + "px";
        //             })
        //             .attr("class", function(d) {
        //                 return d.heat + " parent";
        //             });
        //     }

        //     function name(d) {
        //         return d.parent ? name(d.parent) + " → " + d.name : d.name;
        //     }

        //     function time(d) {
        //         return d.parent ? time(d.parent) + "." + d.time : d.time;
        //     }

        //     function text(text) {
        //         text.attr("x", function(d) {
        //             return x(d.x) + 6;
        //         })
        //             .attr("y", function(d) {
        //                 return y(d.y) + 6
        //             });
        //     }
        // });
    }
})();