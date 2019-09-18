import {
  Component,
  OnInit,
  Input,
  OnChanges,
  HostBinding
} from '@angular/core';
import * as d3 from 'd3';
import { ITreeModel } from '../../model/itree-model';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html'
})
export class TreeComponent implements OnInit, OnChanges {
  @HostBinding('class.tree-container') defautlClass = true;

  @Input() treeData: ITreeModel;
  @Input() width: number;
  @Input() height: number;

  private treemap;
  private root;
  private svg;
  private i = 0;
  private duration = 750;
  private self;

  constructor() {}

  ngOnInit() {
    this.self = this;
    const margin = { top: 20, right: 90, bottom: 30, left: 90 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    this.svg = d3
      .select('#tree-container')
      .append('svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this.treemap = d3.tree().size([height, width]);
  }

  ngOnChanges() {
    this.root = d3.hierarchy(this.treeData, d => d.children);
    this.root.x0 = this.height / 2;
    this.root.y0 = 0;

    this.root.children.forEach(d => {
      this.collapse(d);
    });

    this.update(this.root);
  }

  collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(d => {
        this.collapse(d);
      });
      d.children = null;
    }
  }

  update(source) {
    const self = this;
    // Assigns the x and y position for the nodes
    const treeData = this.treemap(this.root);

    // Compute the new tree layout.
    const nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(d => {
      d.y = d.depth * 180;
    });

    // ****************** Nodes section ***************************

    // Update the nodes...
    let node = this.svg.selectAll('g.node').data(nodes, function(d) {
      return d.id || (d.id = ++this.i);
    });

    // Enter any new modes at the parent's previous position.
    let nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {
        return 'translate(' + source.y0 + ',' + source.x0 + ')';
      })
      .on('click', d => { self.click(d, self); });

    // Add Circle for the nodes
    nodeEnter
      .append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style('fill', function(d) {
        return d._children ? 'lightsteelblue' : '#fff';
      });

    // Add labels for the nodes
    nodeEnter
      .append('text')
      .attr('dy', '.35em')
      .attr('x', function(d) {
        return d.children || d._children ? -13 : 13;
      })
      .attr('text-anchor', function(d) {
        return d.children || d._children ? 'end' : 'start';
      })
      .text(function(d) {
        return d.data.name;
      });

    // UPDATE
    let nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', function(d) {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    // Update the node attributes and style
    nodeUpdate
      .select('circle.node')
      .attr('r', 10)
      .style('fill', function(d) {
        return d._children ? 'lightsteelblue' : '#fff';
      })
      .attr('cursor', 'pointer');

    // Remove any exiting nodes
    let nodeExit = node
      .exit()
      .transition()
      .duration(this.duration)
      .attr('transform', function(d) {
        return 'translate(' + source.y + ',' + source.x + ')';
      })
      .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle').attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text').style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    let link = this.svg.selectAll('path.link').data(links, function(d) {
      return d.id;
    });

    // Enter any new links at the parent's previous position.
    let linkEnter = link
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('d', function(d) {
        let o = { x: source.x0, y: source.y0 };
        return self.diagonal(o, o);
      });

    // UPDATE
    let linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate
      .transition()
      .duration(this.duration)
      .attr('d', function(d) {
        return self.diagonal(d, d.parent);
      });

    // Remove any exiting links
    let linkExit = link
      .exit()
      .transition()
      .duration(this.duration)
      .attr('d', function(d) {
        let o = { x: source.x, y: source.y };
        return self.diagonal(o, o);
      })
      .remove();

    // Store the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
  }

  private diagonal(s, d) {
    const path = `M ${s.y} ${s.x}
          C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`;

    return path;
  }

  private click(d, self) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
      self.update(d);
  }
}
