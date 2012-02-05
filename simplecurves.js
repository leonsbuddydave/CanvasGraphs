/////// Constants
var NO_TYPE = null;
var CONSTANT = 1;
var LINEAR = 2;
var QUADRATIC = 3;
var CUBIC = 4;
var QUARTIC = 5;
/////// Objects

var CurrentCurveStyle;

function SetCurveStyle(curvestyle)
{
	CurrentCurveStyle = curvestyle;
}

function CurveStyle(accuracy)
{
	this.Accuracy = accuracy;
}

CurrentCurveStyle = new CurveStyle(.1);

function GenerateCurve(a, b, c, d, e)
{
	var type = NO_TYPE;
	var Coefficients = 0; // used to determine what kind of function this is

	if (typeof a !== "undefined")
	{
		Coefficients++;
		if (typeof b !== "undefined")
		{
			Coefficients++;
			if (typeof c !== "undefined")
			{
				Coefficients++;
				if (typeof d !== "undefined")
				{
					Coefficients++;
					if (typeof e !== "undefined")
					{
						Coefficients++;
					}
				}
			}
		}
	}

	if (Coefficients == 0)
	{
		return;
	}
	else
	{
		type = Coefficients;
	}

	var Curve = new DataObject();
	Curve.Type = type;
	Curve.Scale = CurrentCurveStyle.Accuracy;

	var LeftBound = CurrentWindow.x_left;
	var RightBound = CurrentWindow.x_right;

	switch (type)
	{
		case CONSTANT:
			for (var i = LeftBound; i <= RightBound; i += Curve.Scale)
			{
				Curve.Data.push(a);
			}			
			break;
		
		case LINEAR:
			for (var i = LeftBound; i <= RightBound; i += Curve.Scale)
			{
				Curve.Data.push(a * i + b);
			}
			break;

		case QUADRATIC:
			for (var i = LeftBound; i <= RightBound; i += Curve.Scale)
			{
				Curve.Data.push( a * Math.pow(i, 2) + b * i + c );
			}	
			break;

		case CUBIC:
			for (var i = LeftBound; i <= RightBound; i += Curve.Scale)
			{
				Curve.Data.push(a * Math.pow(i, 3) + b * Math.pow(i, 2) + c * i + d);
			}
			break;

		case QUARTIC:
			for (var i = LeftBound; i <= RightBound; i += Curve.Scale)
			{
				Curve.Data.push(a * Math.pow(i, 4) + b * Math.pow(i, 3) + c * Math.pow(i, 2) + d * i + e);
			}
			break;
	}
	return Curve;
}
