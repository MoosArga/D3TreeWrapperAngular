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

  @Input() data: ITreeModel;
  @Input() width: number;
  @Input() height: number;

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    const treeLayout = d3
      .tree()
      .size([this.height, this.width])
      .nodeSize([80, 200]);
    if (this.data) {
      this.traceTree(treeLayout, this.data);
    }
  }

  private traceTree(treeLayout, data: ITreeModel) {
    const root = d3.hierarchy(data);
    treeLayout(root);
    d3.select('#tree-container svg').remove();
    const svg = d3
      .select('#tree-container')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g')
      .attr('transform', 'translate(100, 200)');

    this.setZoomBehaviour();
    this.traceLinks(svg, root);
    this.traceNodes(svg, root);
  }

  private traceLinks(svg: any, root: any) {
    svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line.tree-link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'tree-link-path')
      .attr(
        'd',
        d =>
          'M' +
          d.source.y +
          ',' +
          d.source.x +
          'C' +
          (d.source.y + 100) +
          ',' +
          d.source.x +
          ' ' +
          (d.source.y + 100) +
          ',' +
          d.target.x +
          ' ' +
          d.target.y +
          ',' +
          d.target.x
      );
  }

  private traceNodes(svg: any, root: any) {
    const nodes = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle.tree-node')
      .data(root.descendants());
    const node = nodes
      .enter()
      .append('g')
      .attr('class', 'tree-node-container')
      .attr('transform', d => 'translate(' + d.y + ',' + d.x + ')')
      .on('click', d => {
        if (d.children) {
          d.memento = d.children;
          d.children = null;
        } else {
          d.children = d.memento;
          d.memento = null;
        }
      });

    node
      .append('circle')
      .classed('tree-node', true)
      .attr('r', 30);

    node
      .append('text')
      .attr('dy', '0.3em')
      .attr('text-anchor', 'middle')
      .text(d => d.data.name);
  }

  setZoomBehaviour() {
    const zoom = d3
      .zoom()
      .on('zoom', () => d3.select('g').attr('transform', d3.event.transform));
    const svg = d3.select('svg');
    svg.call(zoom.transform, d3.zoomIdentity.translate(100, 400));
    svg.call(zoom);
  }
}
