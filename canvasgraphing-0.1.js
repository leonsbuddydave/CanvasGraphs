// Global Variables
var GraphContext;
var CurrentWindow;
var CurrentTickStyle;
var CurrentGraphInfo;

var origin_x_scale, origin_y_scale;
var CanvasWidth, CanvasHeight;
var visible_tick_gap_x, visible_tick_gap_y;
var CanvasMargin;

// CONSTANTS ////////////////////////

// Window Constants
var WINDOW_STANDARD = new Window(-10, 10, 10, -10, 1, 1);
var WINDOW_NO_AXES = new Window(10, 20, 20, 10, 1, 1);

// Tick Constants
var TICK_ABOVE = 0;
var TICK_BELOW = 1;
var TICK_CENTERED = 2;
var TICK_STANDARD = new TickStyle(TICK_CENTERED, 5);

/////////////////////////////////////

// Objects

function DataObject()
{
	this.Data = new Array();
	this.Scale = 1;
	this.Type = NO_TYPE;
	this.domain = [CurrentWindow.x_left, CurrentWindow.x_right];	
}

function GraphInfoExt(title, xlabel, ylabel, xunit, yunit)
{
	// used for labeling the graph
	this.title = title;
	this.xlabel = xlabel;
	this.ylabel = ylabel;
	this.xunit = xunit;
	this.yunit = yunit;
}

function GraphInfo(title, xlabel, ylabel)
{
	// used for identifying the graph
	this.title = title;
	this.xlabel = xlabel;
	this.ylabel = ylabel;
}

function Window(x_left, x_right, y_upper, y_lower, x_scale, y_scale)
{
	// Used for setting the visible area of the graph
	this.x_left = x_left;
	this.x_right = x_right;
	this.y_upper = y_upper;
	this.y_lower = y_lower;
	this.x_scale = x_scale;
	this.y_scale = y_scale;
}

function TickStyle(position, height)
{
	// used for styling the graph
	this.height = height;
	this.x_position = position;
	this.y_position = position;
	this.position = position;
	this.visible = true;
}

// End Objects

// Default Values ///////////////////

CurrentWindow = WINDOW_STANDARD;
CurrentTickStyle = TICK_STANDARD;

function HideTicks()
{
	CurrentTickStyle.visible = false;
}

function ShowTicks()
{
	CurrentTickStyle.visible = true;
}

function Graph(Window, Data)
{
	this.Window = Window;
	this.Data = Data;
}

function SetGraphWindow(Window)
{
	CurrentWindow = Window;	
}

function SetTickStyle(Style)
{
	CurrentTickStyle = Style;
}

function SetGraphInfo(GraphInfo)
{
	CurrentGraphInfo = GraphInfo;
}

////////////////////////////////////////

function ConvertToGraph(contextID)
{
	if (typeof CurrentWindow === "undefined")
	{
		// Window not set
		SetGraphWindow(WINDOW_STANDARD);
	}

	CanvasMargin = 10;

	var CanvasHandle = document.getElementById(contextID);
	GraphContext = CanvasHandle.getContext('2d');
	
	CanvasWidth = CanvasHandle.width;
	CanvasHeight = CanvasHandle.height;

	var GraphWidth = CanvasWidth - CanvasMargin * 2;
	var GraphHeight = CanvasHeight - CanvasMargin * 2;	


	// Setting our x-scale (the percentage of canvas each side takes up)
	if (CurrentWindow.x_left < 0 && CurrentWindow.x_right > 0)
	{
		origin_x_scale = Math.abs(CurrentWindow.x_left) / ( Math.abs(CurrentWindow.x_left) + Math.abs(CurrentWindow.x_right) );
	}
	else if (CurrentWindow.x_left > 0)
	{
		//origin_x_scale = CanvasMargin / CanvasWidth;
		origin_x_scale = 0 + (CanvasMargin / CanvasWidth);
		// Force tick position
		CurrentTickStyle.x_position = TICK_ABOVE;
	}
	else if (CurrentWindow.x_right < 0)
	{
		//origin_x_scale = CanvasWidth - (CanvasMargin / CanvasWidth);
		origin_x_scale = 1 - (CanvasMargin / CanvasWidth);
		// Force tick position
		CurrentTickStyle.x_position = TICK_BELOW;
	} 
	
	// Setting our y-scale (the percentage of canvas each side takes up)
	if (CurrentWindow.y_lower < 0 && CurrentWindow.y_upper > 0)
	{
		origin_y_scale = Math.abs(CurrentWindow.y_upper) / ( Math.abs(CurrentWindow.y_upper) + Math.abs(CurrentWindow.y_lower) );
	}
	else if (CurrentWindow.y_lower > 0)
	{
		//origin_y_scale = CanvasHeight - ( CanvasMargin / CanvasHeight );
		origin_y_scale = 1 - (CanvasMargin / CanvasHeight);
		// Force tick position
		CurrentTickStyle.y_position = TICK_ABOVE;
	}
	else if (CurrentWindow.y_upper < 0)
	{
		//origin_y_scale = CanvasMargin / CanvasHeight;
		origin_y_scale = 0 + (CanvasMargin / CanvasHeight);
		// Force tick position
		CurrentTickStyle.y_position = TICK_BELOW;
	}


	// Get the aspect ratio of the visible graph relative to the domain
	var AspectRatio_x = GraphWidth / ( Math.abs(CurrentWindow.x_left) + Math.abs(CurrentWindow.x_right) );
	var AspectRatio_y = GraphHeight / ( Math.abs(CurrentWindow.y_upper) + Math.abs(CurrentWindow.y_lower) );

	GraphContext.beginPath();

	// Draw outer graph bounding box
	GraphContext.fillStyle = '#000000';
	GraphContext.rect(CanvasMargin, CanvasMargin, GraphWidth, GraphHeight);
	GraphContext.stroke();

	// Draw the x-axis
	GraphContext.moveTo(CanvasMargin, CanvasHeight * origin_y_scale);
	GraphContext.lineTo(CanvasWidth - CanvasMargin, CanvasHeight * origin_y_scale);
	GraphContext.stroke();

	// Draw the y-axis
	GraphContext.moveTo(CanvasWidth * origin_x_scale, CanvasMargin);
	GraphContext.lineTo(CanvasWidth * origin_x_scale, CanvasHeight - CanvasMargin);
	GraphContext.stroke();

	if (CurrentTickStyle.visible)
	{
		var x_tick_top, x_tick_bottom, y_tick_left, y_tick_right;

		visible_tick_gap_x = CurrentWindow.x_scale * AspectRatio_x;
		visible_tick_gap_y = CurrentWindow.y_scale * AspectRatio_y;

		var canvas_x_remainder = CanvasWidth - (CanvasWidth * origin_x_scale);
		var canvas_y_remainder = CanvasHeight - (CanvasHeight * origin_y_scale);
	
		switch (CurrentTickStyle.y_position)
		{
			case TICK_ABOVE:
				x_tick_top = CanvasHeight * origin_y_scale - CurrentTickStyle.height;
				x_tick_bottom = CanvasHeight * origin_y_scale;
				break;
			case TICK_BELOW:
				x_tick_top = CanvasHeight * origin_y_scale;
				x_tick_bottom = CanvasHeight * origin_y_scale + CurrentTickStyle.height;
				break;
			case TICK_CENTERED:
				var half = CurrentTickStyle.height / 2;
				x_tick_top = CanvasHeight * origin_y_scale - half;
				x_tick_bottom = CanvasHeight * origin_y_scale + half;
				break;
		}

		switch (CurrentTickStyle.x_position)
		{
			case TICK_ABOVE:
				y_tick_left = CanvasWidth * origin_x_scale;
				y_tick_right = CanvasWidth * origin_x_scale + CurrentTickStyle.height;
				break;

			case TICK_BELOW:
				y_tick_left = CanvasWidth * origin_x_scale - CurrentTickStyle.height;
				y_tick_right = CanvasWidth * origin_x_scale;
				break;

			case TICK_CENTERED:
				var half = CurrentTickStyle.height / 2;
				y_tick_left = CanvasWidth * origin_x_scale - half;
				y_tick_right = CanvasWidth * origin_x_scale + half;
				break;
		}

		GraphContext.strokeWidth = 1;
		
		var DebugReport = 
			"CanvasWidth: " + CanvasWidth + "\n" +
			"origin_x_scale: " + origin_x_scale + "\n" +
			"CanvasMargin: " + CanvasMargin + "\n" +
			"visible_tick_gap_x: " + visible_tick_gap_x;
		//window.alert(DebugReport);

		// Draw x-ticks before y-axis
		for (var i = ( (CanvasWidth * origin_x_scale) - CanvasMargin ) / visible_tick_gap_x; i * visible_tick_gap_x > CanvasMargin; i -= 1)
		{
			GraphContext.moveTo(CanvasWidth * origin_x_scale - visible_tick_gap_x * i, x_tick_bottom);
			GraphContext.lineTo(CanvasWidth * origin_x_scale - visible_tick_gap_x * i, x_tick_top);
			GraphContext.stroke();
		}
		
	
		// Draw x-ticks after y-axis
		for (var i = 0; i < ( canvas_x_remainder - CanvasMargin ) / visible_tick_gap_x; i += 1)
		{
			GraphContext.moveTo(CanvasWidth * origin_x_scale + visible_tick_gap_x * i, x_tick_bottom);
			GraphContext.lineTo(CanvasWidth * origin_x_scale + visible_tick_gap_x * i, x_tick_top);
			GraphContext.stroke();
		}

		// Draw y-ticks above x-axis
		for (var i = ( (CanvasHeight * origin_y_scale) - CanvasMargin ) / visible_tick_gap_y; i * visible_tick_gap_y > CanvasMargin; i -= 1)
		{
			GraphContext.moveTo(y_tick_left, CanvasHeight * origin_y_scale - visible_tick_gap_y * i);
			GraphContext.lineTo(y_tick_right, CanvasHeight * origin_y_scale - visible_tick_gap_y * i);
			GraphContext.stroke();
		}

		// Draw y-ticks below x-axis
		for (var i = 0; i < (canvas_y_remainder - CanvasMargin) / visible_tick_gap_y; i+= 1)
		{
			GraphContext.moveTo(y_tick_left, CanvasHeight * origin_y_scale + visible_tick_gap_y * i);
			GraphContext.lineTo(y_tick_right, CanvasHeight * origin_y_scale + visible_tick_gap_y * i);
			GraphContext.stroke();
		}
	}
	
	GraphContext.closePath();
	// End tickmark drawing
}

function DrawCurve(dataobject)
{
	// This needs commenting and simplification holy shit it's a mess

	// TODO
	// - Make the drawn graph /not/ extend past the outer boundaries of the graph area
	// Suggestions: 
	// - Do a check on the angle of the line, determine where on the edge it should hit
	// - Draw it all the way up and then draw over it with the background canvas color
	// 
	// Need to do this both directions

	GraphContext.strokeStyle = '#FF0000';
	GraphContext.moveTo(origin_x_scale * CanvasWidth + dataobject.domain[0] * visible_tick_gap_x, origin_y_scale * CanvasHeight + -1 * dataobject.Data[0]);
	GraphContext.beginPath();
	for (var i = 0; i <= (dataobject.domain[1] - dataobject.domain[0]) / dataobject.Scale; i += 1)
	{
		var point_x = origin_x_scale * CanvasWidth + dataobject.domain[0] * visible_tick_gap_x + i * visible_tick_gap_x * dataobject.Scale;
		var point_y = origin_y_scale * CanvasHeight + -1 * dataobject.Data[i] * visible_tick_gap_y;

		/* Attempting to fix the graph drawing out of bounds, see below for quick hack

		if (point_y < CanvasMargin)
		{
			var LastPointX = (origin_x_scale * CanvasWidth + dataobject.domain[0] * visible_tick_gap_x + (i - 1) * visible_tick_gap_x * dataobject.Scale);
			var LastPointY = (origin_y_scale * CanvasHeight + -1 * dataobject.Data[i - 1] * visible_tick_gap_y);
	
			var DeltaY = point_y - LastPointY;
			var DeltaX = point_x - LastPointX;
			var Slope = DeltaY / DeltaX;

			console.log("DeltaY: " + DeltaY);
			console.log("DeltaX: " + DeltaX);
			
			var NewDeltaY = LastPointY - CanvasMargin;
			console.log("NewDeltaY: " + NewDeltaY);
			
			point_x = LastPointX + NewDeltaY / Slope;
			
			point_y = CanvasMargin;
		}
		*/

		if (point_y < CanvasMargin)
		{	
			point_y = CanvasMargin;
		}

		GraphContext.lineTo(point_x, point_y);
	//	GraphContext.stroke();
	}
	GraphContext.stroke();
	GraphContext.closePath();
}
