(function() {
    'use strict';

    angular
        .module('axinom')
        .controller('HeatmapController', HeatmapController);

    /** @ngInject */
    function HeatmapController($window, toastr, $scope) {
        var vm = this;
        $scope.play = false;
        $scope.playToggle = function() {
            var self = this;
            $scope.play = !$scope.play;
        }
        var datesArray = ['21-02-15', '22-02-15', '23-02-15', '24-02-15', '25-02-15', '26-02-15'];
        $scope.dateMax = datesArray.length;

        $scope.translate = function(value) {
            return value + '%';
        };

        // setup
        var windowHeight = $(window).height() - 60;
        var windowWidth = $(window).width();
        var margin = {
                top: 60,
                right: 0,
                bottom: 0,
                left: 0
            },
            width = windowWidth,
            height = windowHeight,
            formatNumber = d3.format(",d"),
            transitioning;
        var _chartWidth = width - (margin.left + margin.right) - 15;
        var _chartHeight = height - (margin.top + margin.bottom);
        var _sizeByMetric = "size";
        var _colorScale = d3.scale.category10();

        var treemap = d3.layout.treemap()
            .children(function(d, depth) {
                return depth ? null : d._children;
            })
            .sort(function(a, b) {
                return a.value - b.value;
            })
            .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
            .round(false);
        console.log(treemap);

        // create div containers
        var svg = d3.select("#chart").append("div")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .style("margin-left", -margin.left + "px")
            .style("margin-right", -margin.right + "px")
            .style("background-color", "#ddd")
            .append("div")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .style("shape-rendering", "crispEdges");

        // var svg = d3.select("#chart").append("div")
        //     .attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.bottom + margin.top)
        //     .style("margin-left", -margin.left + "px")
        //     .style("margin.right", -margin.right + "px")
        //     .append("div")
        //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //     .style("shape-rendering", "crispEdges");
        // update logic
        var x = d3.scale.linear()
            .domain([0, width])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, height])
            .range([0, height]);

        // rect.attr("x", function(d) {
        //     return x(d.x);
        // })
        //     .attr("y", function(d) {
        //         return y(d.y);
        //     })
        //     .attr("width", function(d) {
        //         return x(d.x + d.dx) - x(d.x);
        //     })
        //     .attr("height", function(d) {
        //         return y(d.y + d.dy) - y(d.y);
        //     })
        //     .attr("class", function(d) {
        //         return d.class;
        //     })
        // load data and create visualization
        // d3.json("http://www.billdwhite.com/wordpress/wp-content/data/demo_data_03.json", function(error, data) {
        //     var treemap = d3.layout.treemap()
        //         .padding([20, 10, 10, 10])
        //         .size([_chartWidth, _chartHeight])
        //         .value(function(d) {
        //             return d["size"];
        //         });
        //     var nodes = treemap.nodes(data);
        //     var cellSelection = _chart.selectAll(".cell").data(nodes);
        //     var cellEnterSelection = cellSelection.enter().append("div")
        //         .attr("class", "cell").on("click", transition);;
        //     cellEnterSelection.append("div")
        //         .attr("class", "label")
        //         .text(function(d) {
        //             return d.name ? d.name : "";
        //         });
        //     cellSelection.transition().duration(250)
        //         .call(cellUpdate);
        //     cellSelection.exit().remove();
        // });



        var grandparent = svg.append("div")
            .attr("class", "grandparent");


        grandparent.append("div")
            .style("top", -margin.top + "px")
            .style("width", width + "px")
            .style("height", margin.top + "px");

        grandparent.append("div")
            .style("left", (width / 2) - 20 + "px")
            .style("top", -35 + "px");

        // d3.json("http://www.billdwhite.com/wordpress/wp-content/data/demo_data_03.json", function(error, data) {

        d3.json("data.json", function(root) {
            initialize(root);
            accumulate(root);
            layout(root);
            display(root);

            function initialize(root) {
                root.x = 0;
                root.y = 75;
                root.dx = width;
                root.dy = height;
                root.depth = 0;
            }

            // Aggregate the values for internal nodes. This is normally done by the
            // treemap layout, but not here because of our custom implementation.
            // We also take a snapshot of the original children (_children) to avoid
            // the children being overwritten when when layout is computed.
            function accumulate(d) {
                return (d._children = d.children) ? d.value = d.children.reduce(function(p, v) {
                    return p + accumulate(v);
                }, 0) : d.value;
            }

            // Compute the treemap layout recursively such that each group of siblings
            // uses the same size (1×1) rather than the dimensions of the parent cell.
            // This optimizes the layout for the current zoom state. Note that a wrapper
            // object is created for the parent node for each group of siblings so that
            // the parent’s dimensions are not discarded as we recurse. Since each group
            // of sibling was laid out in 1×1, we must rescale to fit using absolute
            // coordinates. This lets us use a viewport to zoom.
            function layout(d) {
                if (d._children) {
                    treemap.nodes({
                        _children: d._children
                    });
                    d._children.forEach(function(c) {
                        c.x = d.x + c.x * d.dx;
                        c.y = d.y + c.y * d.dy;
                        c.dx *= d.dx;
                        c.dy *= d.dy;
                        c.parent = d;
                        layout(c);
                    });
                }
            }

            function display(d) {

                grandparent
                    .datum(d.parent)
                    .on("click", transition)
                    .select("text")
                    .text(name(d));


                var g1 = svg.insert("div", ".grandparent")
                    .datum(d)
                    .attr("class", "depth");


                var g = g1.selectAll("div")
                    .data(d._children)
                    .enter().append("div");

                g.filter(function(d) {
                    return d._children;
                })
                    .classed("children", true)
                    .on("click", transition);

                g.selectAll(".child")
                    .data(function(d) {
                        return d._children || [d];
                    })
                    .enter()
                    .append("div")
                    .attr("class", "child")
                    .call(cellUpdate)
                    .append("div")
                    .attr("class", "label")
                    .text(function(d) {
                        return d.name ? d.name : "";
                    });
                g.selectAll(".children")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

                g.append("div")
                    .attr("class", "parent")
                    .call(parentUpdate)
                    .append("title")
                    .text(function(d) {
                        return formatNumber(d.value)
                    });
                // grandparent
                //     .datum(d.parent)
                //     .on("click", transition)
                //     .select("text")
                //     .text(name(d));

                // var g1 = svg.insert("div", ".grandparent")
                //     .datum(d)
                //     .attr("class", "depth");

                // var g = g1.selectAll("div")
                //     .data(d._children)
                //     .enter().append("div");

                // g.filter(function(d) {
                //     return d._children;
                // }).classed("children", true)
                //     .on("click", transition);

                // g.selectAll(".child")
                //     .data(function(d) {
                //         return d._children || [d];
                //     })
                //     .enter().append("div")
                //     .attr("class", "child")
                //     .call(cellUpdate)
                //     .append("div")
                //     .attr("class", "label")
                //     .text(function(d) {
                //         return d.name ? d.name : "";
                //     });

                // g.selectAll(".children")
                //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(cellUpdate);

                // g.append("div")
                //     .attr("class", "parent")
                //     .call(parentUpdate)
                //     .append("title")
                //     .text(function(d) {
                //         return formatNumber(d.value)
                //     });

                function transition(d) {
                    if (transitioning || !d) return;
                    transitioning = true;
                    var g2 = displayChild(d),
                        t1 = g1.transition().duration(750),
                        t2 = g2.transition().duration(750);

                    // Update the domain only after entering new elements.
                    x.domain([d.x, d.x + d.dx]);
                    y.domain([d.y, d.y + d.dy]);

                    // Enable anti-aliasing during the transition.
                    svg.style("shape-rendering", null);

                    // Draw child nodes on top of parent nodes.
                    svg.selectAll(".depth").sort(function(a, b) {
                        return a.depth - b.depth;
                    });

                    t1.selectAll(".child").call(cellUpdate);
                    t2.selectAll(".child").call(cellUpdate);

                    // Remove the old node when the transition is finished.
                    t1.remove().each("end", function() {
                        svg.style("shape-rendering", "crispEdges");
                        transitioning = false;
                    });
                }

                function displayChild(d) {
                    grandparent
                        .datum(d.parent)
                        .on("click", transition)
                        .select("text")
                        .text(name(d));


                    var g1 = svg.insert("div", ".grandparent")
                        .datum(d)
                        .attr("class", "depth");


                    var g = g1.selectAll("div")
                        .data(d._children)
                        .enter().append("div").classed("children", true);

                    g.selectAll(".child")
                        .data(function(d) {
                            return d._children || [d];
                        })
                        .enter().append("div")
                        .attr("class", "child")
                        .call(cellUpdate);
                    g.selectAll(".children")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

                    // g.append("div")
                    //     .attr("class", "parent")
                    //     .call(cellUpdate)
                    //     .append("title")
                    //     .text(function(d) {
                    //         return formatNumber(d.value)
                    //     });
                    return g;
                }

                return g;
            }

            function cellUpdate() {
                this.style("margin-left", function(d) {
                    return x(d.x) + "px";
                })
                    .style("margin-top", function(d) {
                        return y(d.y) + "px";
                    })
                    .style("width", function(d) {
                        return x(d.x + d.dx) - x(d.x) + "px";
                    })
                    .style("height", function(d) {
                        return y(d.y + d.dy) - y(d.y) + "px";
                    })
                    .attr("class", function(d) {
                        return d.heat + " child";
                    });
            }

            function parentUpdate() {
                this.style("margin-left", function(d) {
                    return x(d.x) + "px";
                })
                    .style("margin-top", function(d) {
                        return y(d.y) + "px";
                    })
                    .style("width", function(d) {
                        return x(d.x + d.dx) - x(d.x) + "px";
                    })
                    .style("height", function(d) {
                        return y(d.y + d.dy) - y(d.y) + "px";
                    })
                    .attr("class", function(d) {
                        return d.heat + " parent";
                    });

            }

            function name(d) {
                return d.parent ? name(d.parent) + " → " + d.name : d.name;
            }

            function time(d) {
                return d.parent ? time(d.parent) + "." + d.time : d.time;
            }
        });
    }
})();