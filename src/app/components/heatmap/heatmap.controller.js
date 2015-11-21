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
        var _chartWidth = width - (margin.left + margin.right) -15;
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
        var treemap = d3.layout.treemap()
         .padding([20, 10, 10, 10])
            .size([_chartWidth, _chartHeight])
            .value(function(d) {
                return d.value;
            })
            // .children(function(d, depth) {
            //     return depth ? null : d._children;
            // })
            .sort(function(a, b) {
                return a.value - b.value;
            })
            .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
            .round(false);
        console.log(treemap);
        // create div containers
        var svg = d3.select("#chart")
            .style("margin-top", margin.top + "px")
            .style("margin-right", margin.right + "px")
            .style("margin-bottom", margin.bottom + "px")
            .style("margin-left", margin.left + "px")
            .append("div")
            .attr("class", "chart")
            .style("width", _chartWidth + "px")
            .style("height", _chartHeight + "px");

        // var svg = d3.select("#chart").append("div")
        //     .attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.bottom + margin.top)
        //     .style("margin-left", -margin.left + "px")
        //     .style("margin.right", -margin.right + "px")
        //     .append("div")
        //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        //     .style("shape-rendering", "crispEdges");
        // update logic
        function cellUpdate() {
            this.style("left", function(d) {
                return d.x + "px";
            })
                .style("top", function(d) {
                    return d.y + "px";
                })
                .style("width", function(d) {
                    return Math.max(0, d.dx - 1) + "px";
                })
                .style("height", function(d) {
                    return Math.max(0, d.dy - 1) + "px";
                })
                .style("background-color", function(d) {
                    if(d.heat === "green"){
                        return "#8bc53f";
                    }
                    if(d.heat === "blue"){
                        return "#00adee";
                    }
                    if(d.heat === "red"){
                        return "#f16c54";
                    }
                });
        }
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





        var x = d3.scale.linear()
            .domain([0, width])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, height])
            .range([0, height]);



        // var grandparent = svg.append("div")
        //     .attr("class", "grandparent");


        // grandparent.append("div")
        //     .attr("y", -margin.top)
        //     .attr("width", width)
        //     .attr("height", margin.top);

        // grandparent.append("div")
        //     .attr("x", (width / 2) - 20)
        //     .attr("y", -35)
        //     .attr("dy", ".75em");

        // d3.json("http://www.billdwhite.com/wordpress/wp-content/data/demo_data_03.json", function(error, data) {

        d3.json("data.json", function(root) {
                initialize(root);
                accumulate(root);
                layout(root);
            display(root);

                function initialize(root) {
                    root.x = root.y = 0;
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
                var nodes = treemap.nodes(d);
                console.log(nodes);
                var cellSelection = svg.selectAll(".cell").data(nodes);
                var cellEnterSelection = cellSelection.enter().append("div")
                    .attr("class", "cell").on("click", transition);
                cellEnterSelection.append("div")
                    .attr("class", "label")
                    .text(function(d) {
                        return d.name ? d.name : "";
                    });
                cellSelection.call(cellUpdate);
                // var g1 = svg.insert("div", ".grandparent")
                //     .datum(d)
                //     .attr("class", "depth");
                //         grandparent
                //             .datum(d.parent)
                //             .on("click", transition)
                //             .select("text")
                //             .text(name(d));




                //         var g = g1.selectAll("div")
                //             .data(d._children)
                //             .enter().append("div");

                //         g.filter(function(d) {
                //             return d._children;
                //         })
                //             .classed("children", true)
                //             .on("click", transition);

                //         g.selectAll(".child")
                //             .data(function(d) {
                //                 return d._children || [d];
                //             })
                //             .enter().append("div")
                //             .attr("class", "child")
                //             .call(rect);
                //         g.selectAll(".children")
                //             .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

                //         g.append("div")
                //             .attr("class", "parent")
                //             .call(rect)
                //             .attr("stroke", function(d) {
                //                 if (d.heat === "blue") {
                //                     return "#00adee";
                //                 }
                //                 if (d.heat == "green") {
                //                     return "#8bc53f";
                //                 }
                //                 if (d.heat === "red") {
                //                     return "#f16c54";
                //                 }
                //                 if (d.heat === "grey") {
                //                     return "";
                //                 }
                //             })
                //             .attr("stroke-width", 5)
                //             .append("title")
                //             .text(function(d) {
                //                 return formatNumber(d.value)
                //             });

                //         g.append("div")
                //             .attr("dy", "1em")
                //             .text(function(d) {
                //                 return d.value + '%'
                //             })
                //             .attr("fill", "#333")
                //             .attr("font-size", "0.8em")
                //             .attr("class", "values")
                //             .call(text);
                //         g.append("div")
                //             .attr("dy", "1.9em")
                //             .text(function(d) {
                //                 return d.name;
                //             })
                //             .attr("fill", "white")
                //             .attr("font-size", "1.2em")
                //             .attr("class", "name")
                //             .call(text);
                //         g.append("div")
                //             .attr("dy", "3.25em")
                //             .text(function(d) {
                //                 return d.time + '%'
                //             })
                //             .attr("fill", "#333")
                //             .attr("font-size", "1.2em")
                //             .attr("class", "values")
                //             .call(text);

                function transition(d) {
                    if (transitioning || !d) return;
                    transitioning = true;
                    var g2 = display(d),
                        t1 = cellEnterSelection.transition().duration(750),
                        t2 = g2.transition().duration(750);

                    // Update the domain only after entering new elements.
                    x.domain([d.x, d.x + d.dx]);
                    y.domain([d.y, d.y + d.dy]);

                    // Enable anti-aliasing during the transition.
                    svg.style("shape-rendering", null);

                    // Draw child nodes on top of parent nodes.
                    svg.selectAll(".cell").sort(function(a, b) {
                        return a.depth - b.depth;
                    });

                    // Fade-in entering text.
                    // g2.selectAll("text").style("fill-opacity", 0);

                    // Transition to the new view.
                    // t1.selectAll("text").call(text).style("fill-opacity", 0);
                    // t2.selectAll("text").call(text).style("fill-opacity", 1);
                    // console.log(t1.selectAll(".cell"));
                    // t1.selectAll(".cell").call(cellUpdate);
                    // t2.selectAll(".cell").call(cellUpdate);

                    // Remove the old node when the transition is finished.
                    t1.remove().each("end", function() {
                        svg.style("shape-rendering", "crispEdges");
                        transitioning = false;
                    });
                }

                return cellSelection;
            }

                function text(text) {
                    text.attr("x", function(d) {
                        return x(d.x) + 6;
                    })
                        .attr("y", function(d) {
                            return y(d.y) + 6
                        });
                }

                function rect(rect) {
                    rect.attr("x", function(d) {
                        return x(d.x);
                    })
                        .attr("y", function(d) {
                            return y(d.y);
                        })
                        .attr("width", function(d) {
                            return x(d.x + d.dx) - x(d.x);
                        })
                        .attr("height", function(d) {
                            return y(d.y + d.dy) - y(d.y);
                        })
                        .attr("class", function(d) {
                            return d.class;
                        })

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