function updateTree(data) {
  d3.select("#tree").selectAll("*").remove();
  const root = d3.hierarchy(data);
  const treeLayout = d3.tree().size([500, 400]);
  treeLayout(root);
  const svg = d3.select("#tree");
  svg.selectAll('line')
    .data(root.links())
    .join('line')
    .attr('x1', d => d.source.y + 50)
    .attr('y1', d => d.source.x + 20)
    .attr('x2', d => d.target.y + 50)
    .attr('y2', d => d.target.x + 20)
    .attr('stroke', 'black');
  svg.selectAll('text')
    .data(root.descendants())
    .join('text')
    .attr('x', d => d.y + 50)
    .attr('y', d => d.x + 25)
    .text(d => d.data.text)
    .attr('font-size', 12);
}
