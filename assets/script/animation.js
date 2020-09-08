//Animation switch for the circle
$("#svg_circle").on("click", function () {
  $(this).toggleClass("changeColor");
});

//Animation switch for the rectangle
$("#svg_rect").on("click", function () {
  $(this).toggleClass("otherDirection");
});

//Animation switch for the ellipse
$("#svg_ellipse").click(function () {
  var ellipse = $("#svg_ellipse");
  var rx = ellipse.attr("rx");
  if (rx >= 150) {
    ellipse.attr("rx", 50);
    ellipse.attr("ry", 150);
  } else {
    ellipse.attr("rx", 150);
    ellipse.attr("ry", 50);
  }
});
