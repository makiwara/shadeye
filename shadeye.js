$(function(){

var shade_height = 2000;

var bars = [
	[ $('.point1'), $('.point2'), $('.point3'), $('.point4') ]
]
var max = 0;
function sqr(x) { return x*x }
function sqrt(x) { return Math.sqrt(x) }
var shades = [];
function init() {
	shades = [];
	for (var i=0; i<bars.length; i++) {
		var o = [ bars[i][0].offset(), bars[i][1].offset() ]
		shades[i] = {
			points : [],
			$shade: $('.shade').hide() // replace by constructor
		}
		var mid = [0,0];
		for (var j=0; j< bars[i].length; j++) {
			var o = bars[i][j].offset()
			shades[i].points[j] = { x: o.left, y: o.top }
			mid[0] += o.left;
			mid[1] += o.top;
		}
		shades[i].mid = { x: mid[0]/4, y: mid[0]/4 };
		shades[i].repos = repos;	
		shades[i].draw  = draw;	
	}
	max = $(window).width();
}

init();

function vector_len(v) {
	return sqrt(sqr(v.x)+sqr(v.y));
}
function vector_scalar(a,b) {
	return a.x*b.x + a.y*b.y;
}
function vector_norm(v) {
	var l = vector_len(v);
	return { x: v.x/l, y: v.y/l };
}
function vector_angle(a, b) {
	var da = vector_norm(a);
	var db = vector_norm(b);
	var angle_a = Math.atan2(da.y, da.x);
	var angle_b = Math.atan2(db.y, db.x);
	return angle_a - angle_b;
}
function repos(x, y) {
	// найдём две точки, от которых падает тень.
	var vectors = [];
	for (var i=0; i<this.points.length; i++)
		vectors[i] = {
			x: x-this.points[i].x,
			y: y-this.points[i].y
		};
	var angles = [];
	for (var i=0; i<vectors.length; i++)
		for (var j=i+1; j<vectors.length; j++) {
			var a = {
				from: i,
				to: j,
				angle: vector_angle(vectors[i], vectors[j])
			}
			if (a.angle > Math.PI)
				a.angle -= 2*Math.PI;
			if (a.angle < -Math.PI)
				a.angle += 2*Math.PI;
			a.absangle = Math.abs(a.angle);
			if (a.absangle > Math.PI)
				a.absangle = 2*Math.PI -a.absangle;
			a.sin = sqrt(1 - sqr(a.cos));
			angles[angles.length] = a;
		}
	var max_angle = { absangle: 0 };
	for (var i=0; i<angles.length; i++) {
		if (max_angle.absangle < angles[i].absangle)
			max_angle = angles[i];
	}
	if (max_angle.angle < 0)
	 	this.draw(x, y, this.points[ max_angle.from ], this.points[ max_angle.to ] )
	else
	 	this.draw(x, y, this.points[ max_angle.to ], this.points[ max_angle.from ] )
}

function draw(x, y, from, to) {
	var d= { x: from.x-to.x, y: from.y-to.y };
	var len = vector_len(d);
	var mid = { 
		x: (from.x+to.x)/2, 
		y: (from.y+to.y)/2
	}
	var delta = { x: x-mid.x, y: y-mid.y };
	var a1 = Math.atan2(d.y, d.x);
	var a2 = Math.atan2(delta.x, delta.y);
	var a3 = vector_angle(d, delta);
	a3 = vector_angle(d, {x: x-to.x, y: y-to.y});

	if (a3 < Math.PI) a3+= 2*Math.PI;
	if (a3 > Math.PI) a3-= 2*Math.PI;
	a3 = a3 - Math.PI/2;
	var t1 = 'rotate('+a1+'rad)';
	var t2 = ' skew('+a3+'rad, 0)';
	this.$shade.css({ 
		left: to.x,
		top: to.y,
		'-webkit-transform': t1+t2
	}).show();
	var shade_color = 'rgba(0,0,0,' + vector_len(delta)/max/3 +")";
	this.$shade.find('.shade-shade').css({
		background: shade_color
	})

	// бортики
	var len_delta = vector_len(delta);
	var len_to = vector_len({x: x-to.x, y: y-to.y});
	var skew_angle = Math.abs(a3);
	if (skew_angle > Math.PI) skew_angle = 2*Math.PI - skew_angle;
	var skew_size = shade_height / Math.cos(skew_angle);
	var total_size = len * ( skew_size + len_to) / len_to;

	this.$shade.find('.shade-left').css({
		width: len,
		'border-right': (total_size-len)+'px solid transparent',
		//'border-left': border_to+'px solid transparent',
		'border-bottom': shade_height+'px solid '+shade_color,
		'margin-left': 0
	})
}


function all(event) {
	init();
	for (var i=0; i<shades.length; i++)
		shades[i].repos(event.pageX, event.pageY)	
}
$(window).resize(all)
$(window).mousemove(all)

})

/* TODO

* автоматически генерировать тени
* работать с тремя точками
* работать с кругами вокруг точек
* работать с одним кругом
* распознавание квадрата из jquery-блока

*/